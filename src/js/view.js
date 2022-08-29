import onChange from 'on-change';

const RSSInvalid = 'Ссылка должна быть валидным URL';
const RSSValid = 'RSS успешно загружен';
const RSSDuplicate = 'RSS уже существует';

const handleProcessState = (elements, processState) => {
  switch (processState) {
    case 'sent':

      break;

    case 'error':

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

const handleFormValid = (elements, value) => {
  if (value === true) {
    elements.feedback.textContent = RSSValid;
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
  }
};

const handleErrors = (elements, value) => {
  elements.submitButton.disabled = false;
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  switch (value) {
    case 'notOneOf':
      elements.feedback.textContent = RSSDuplicate;
      break;

    case 'url':
      elements.feedback.textContent = RSSInvalid;
      break;

    default:
      console.log('Unknown error type');
      break;
  }
  elements.form.reset();
  elements.form.focus();
};

const render = (elements) => (path, value /* , prevValue */) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.valid':
      handleFormValid(elements, value);
      break;

    case 'errorType':
      handleErrors(elements, value);
      break;

    default:
      break;
  }
};

export default (elements) => onChange({
  feeds: [],
  errorType: null,
  form: {
    valid: null,
    processState: 'filling',
    fields: {
      input: '',
    },
  },
}, render(elements));
