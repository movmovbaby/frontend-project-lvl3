import i18n from 'i18next';
import _ from 'lodash';
import * as yup from 'yup';
import view from './view.js';
import parserRSS from './parserRSS.js';
import loadRSS from './loadRSS.js';
import resources from './locales/index.js';
import updateRSS from './updateRSS.js';

export default () => {
  const validateURL = (url, urls) => {
    yup.setLocale({
      string: {
        url: 'form.error.urlInvalid',
      },

      mixed: {
        required: 'form.error.urlRequired',
        notOneOf: 'form.error.urlDuplicate',
      },
    });

    const urlSchema = yup
      .string()
      .required()
      .url()
      .notOneOf(urls);

    return urlSchema.validate(url);
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => console.log('i18n loaded'))
    .catch(() => console.log('i18n not loaded'));

  const elements = {
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    input: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const initialState = {
    feeds: [],
    posts: [],
    urls: [],
    form: {
      error: null,
      valid: null,
      processState: 'filling',
    },
    uiState: {
      visitedPosts: new Set(),
      dataIDForModal: null,
    }

  };

  const state = view(initialState, elements, i18nInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    validateURL(url, state.urls)
      .then((validUrl) => {
        state.form.valid = true;
        state.urls.push(url);
        return validUrl;
      })
      .then((validUrl) => {
        state.form.processState = 'sending';
        return loadRSS(validUrl);
      })
      .then((rss) => {
        state.form.processState = 'sent';
        const [rssFeed, rssPosts] = parserRSS(rss);
        const feedID = _.uniqueId();
        const feed = { ...rssFeed, id: feedID, url };
        const posts = rssPosts.map((post) => ({ ...post, id: _.uniqueId(), feedID }));
        state.feeds = [feed, ...state.feeds];
        state.posts = [...posts, ...state.posts];
        state.form.processState = 'dataLoaded';
      })
      .catch((error) => {
        state.form.valid = error.name !== 'ValidationError';
        if (error.name === 'ValidationError') {
          state.form.error = error.message;
        } else if (error.rssInvalid) {
          state.form.error = 'form.error.rssInvalid';
        } else if (error.name === 'AxiosError') {
          state.form.error = 'form.error.networkError';
        }
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const clicked = e.target;
    if (clicked.closest('a')) {
      const { id } = clicked.dataset;
      state.uiState.visitedPosts.add(id);
    }
    if (clicked.closest('button')) {
      const { id } = clicked.dataset;
      state.uiState.visitedPosts.add(id);
      state.uiState.dataIDForModal = id;
    }
  });

  setTimeout(() => updateRSS(state), 5000);
};
