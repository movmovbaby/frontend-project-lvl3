import '../scss/styles.scss';
import isEmpty from 'lodash/isEmpty.js';
import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.object().shape({
  input: yup.string().required('URL can NOT be empty').url(),
},
);

const validate = (input) =>
  schema.validate(input)
    .then(() => { })
    .catch((error) => error);


const elements = {
  form: document.querySelector('.rss-form'),
  feedback: document.querySelector('feedback'),
  fields: {
    input: document.getElementById('url-input'),
  },
  submitButton: document.querySelector('input[name="url"]')
};

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'sent':
      elements.feedback.textContent = 'RSS успешно загружен';
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      break;

    case 'error':
      elements.submitButton.disabled = false;
      elements.feedback.textContent = 'Ссылка должна быть валидным URL';
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      break;

    case 'sending':
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.submitButton.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const render = (elements) => (path, value, prevValue) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.valid':
      console.log('form valid!');
      break;

    case 'form.errors':
      renderErrors(elements, value, prevValue);
      break;

    default:
      break;
  }
};

const state = onChange({
  feeds: [],
  form: {
    valid: true,
    processState: 'filling',
    fields: {
      input: '',
    },
  },
}, render(elements));


elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const value = formData.get('url');
  state.form.fields['input'] = value;

  const errors = validate(state.form.fields);

  state.form.valid = isEmpty(errors);
});
