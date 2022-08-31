import '../scss/styles.scss';
import i18n from 'i18next';
import view from './view.js';
import validateURL from './validateURL.js';
import resources from './locales/index.js';

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
};

const state = view(elements, i18nInstance);

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get('url');
  state.form.fields.input = url;

  validateURL(url, state.feeds)
    .then((validUrl) => {
      state.form.valid = true;
      state.feeds.push(validUrl);
    })
    .catch((error) => {
      state.errorType = error.type;
      state.form.valid = false;
    });
});
