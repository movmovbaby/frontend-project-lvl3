import i18n from 'i18next';
import _ from 'lodash';
import view from './view.js';
import validateURL from './validateURL.js';
import parserRSS from './parserRSS.js';
import loadRSS from './loadRSS.js';
import resources from './locales/index.js';
import updateRSS from './updateRSS.js';

export default () => {
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
    fields: {
      input: document.getElementById('url-input'),
    },
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const initialState = {
    feeds: [],
    posts: [],
    urls: [],
    errorType: null,
    form: {
      valid: null,
      processState: 'filling',
      fields: {
        input: '',
      },
    },
    visitedPosts: new Set(),
    dataIDForModal: null,
  };

  const state = view(initialState, elements, i18nInstance);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.form.fields.input = url;

    validateURL(url, state.urls)
      .then((validUrl) => {
        state.form.valid = true;
        state.urls.push(url);
        return validUrl;
      })
      .then((url) => {
        state.form.processState = 'sending';
        return loadRSS(url);
      })
      .then((rss) => {
        state.form.processState = 'sent';
        const [rssFeed, rssPosts] = parserRSS(rss);
        const feedID = _.uniqueId();
        const feed = { ...rssFeed, id: feedID, url, };
        const posts = rssPosts.map((post) => {
          return { ...post, id: _.uniqueId(), feedID };
        });
        state.feeds = [feed, ...state.feeds];
        state.posts = [...posts, ...state.posts];
      })
      .catch((error) => {
        state.errorType = error.type;
        state.form.valid = false;
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const clicked = e.target;
    if (clicked.closest('a')) {
      const { id } = clicked.dataset;
      state.visitedPosts.add(id);
    }
    if (clicked.closest('button')) {
      const { id } = clicked.dataset;
      state.dataIDForModal = id;
    }
  });

  setTimeout(() => updateRSS(state), 5000);
};
