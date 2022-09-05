import '../scss/styles.scss';
import i18n from 'i18next';
import axios from 'axios';
import view from './view.js';
import validateURL from './validateURL.js';
import resources from './locales/index.js';

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
    submitButton: document.querySelector('input[name="url"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const state = view(elements, i18nInstance);

  const rssParser = (rssFeed) => {
    const parsedXML = new DOMParser().parseFromString(rssFeed.data, 'application/xml');
    const error = parsedXML.querySelector('parsererror');
    if (error) {
      state.errorType = 'rssParser';
      return;
    }

    const feed = {
      title: parsedXML.querySelector('channel title').textContent,
      description: parsedXML.querySelector('channel description').textContent,
    };

    const posts = Array.from(parsedXML.querySelectorAll('item'))
      .map((item) => {
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const description = item.querySelector('description').textContent;
        return { title, link, description };
      });

    return [feed, posts];
  };

  const loadRSS = (url) => {
    const proxyURL = `https://allorigins.hexlet.app/raw?url=${url}`;
    return axios.get(proxyURL);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.form.fields.input = url;

    validateURL(url, state.feeds)
      .then((validUrl) => {
        state.form.valid = true;
        return validUrl;
      })
      .then((url) => loadRSS(url))
      .then((rss) => {
        const [feed, posts] = rssParser(rss);
        state.feeds = [feed, ...state.feeds];
        state.posts = [...posts, ...state.posts];
      })
      .catch((error) => {
        state.errorType = error.type;
        state.form.valid = false;
      });
  });
};
