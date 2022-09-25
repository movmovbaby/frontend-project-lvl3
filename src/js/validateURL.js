import * as yup from 'yup';

export default (url, urls) => {
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
