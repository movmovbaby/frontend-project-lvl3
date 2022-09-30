import _ from 'lodash';
import * as yup from 'yup';
import view from './view.js';
import { loadRSS, parserRSS, updateRSS } from './rssUtils.js';

export default (i18nInstance) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    input: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

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
    .url();

  const validateURL = (url, urls) => urlSchema.notOneOf(urls).validate(url);

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
    },
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
        state.form.processState = 'sending';
        return loadRSS(validUrl);
      })
      .then((rss) => {
        state.form.processState = 'sent';
        const { feed, posts } = parserRSS(rss);
        const feedID = _.uniqueId();
        const rssFeed = { ...feed, id: feedID, url };
        const rssPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedID }));
        state.feeds = [rssFeed, ...state.feeds];
        state.posts = [...rssPosts, ...state.posts];
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
