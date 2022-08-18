import '../scss/styles.scss';
// import * as bootstrap from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.object().shape({
  input: yup.string().required('URL can NOT be empty').url(),
},
);

const validate = (input) => schema.validate(input)
  .then((result) => {
    console.log(result);
    //return
  })
  .catch((error) => {
    console.log(error)
    //return
  });


const elements = {
  form: document.querySelector('.rss-form'),
  feedback: document.querySelector('feedback'),
  fields: {
    input: document.getElementById('url-input'),
  },
  submitButton: document.querySelector('input[name="url"]')
};

const render = (elements) => (path, value, prevValue) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.processError':
      handleProcessError();
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
  form: {
    valid: true,
    processState: 'filling',
    processError: null,
    errors: {},
    fields: {
      input: '',
    },
  },
}, render(elements));

Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
  fieldElement.addEventListener('input', (e) => {
    const { value } = e.target;
    state.form.fields[fieldName] = value;
    const errors = validate(state.form.fields);
    state.form.errors = errors;
    state.form.valid = isEmpty(errors);
  });
})

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  state.form.processError = null;
});
