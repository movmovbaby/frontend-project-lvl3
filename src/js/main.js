import '../scss/styles.scss';
import 'bootstrap';
import i18n from 'i18next';
import app from './index.js';
import resources from './locales/index.js';

const i18nInstance = i18n.createInstance();
i18nInstance
  .init({
    lng: 'ru',
    debug: false,
    resources,
  })
  .then(app(i18nInstance))
  .catch((e) => {
    throw (e);
  });
