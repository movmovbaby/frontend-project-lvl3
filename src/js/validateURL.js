import * as yup from 'yup';

export default (url, feeds) => {
  const urlSchema = yup.string().required().url().notOneOf(feeds);
  return urlSchema.validate(url);
};
