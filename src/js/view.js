import onChange from 'on-change';

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

const handleFormValid = (elements, i18n, value) => {
  if (value === true) {
    elements.feedback.textContent = i18n.t('form.urlValid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
  }
  elements.form.reset();
  elements.form.focus();
};

const handleErrors = (elements, i18n, value) => {
  elements.submitButton.disabled = false;
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  switch (value) {
    case 'notOneOf':
      elements.feedback.textContent = i18n.t('form.errors.urlDuplicate');
      break;

    case 'url':
      elements.feedback.textContent = i18n.t('form.errors.urlInvalid');
      break;

    default:
      console.log('Unknown error type');
      break;
  }
  elements.form.reset();
  elements.form.focus();
};

const render = (elements, i18n) => (path, value /* , prevValue */) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, value);
      break;

    case 'form.valid':
      handleFormValid(elements, i18n, value);
      break;

    case 'errorType':
      handleErrors(elements, i18n, value);
      break;

    default:
      break;
  }
};

export default (elements, i18n) => onChange({
  feeds: [],
  errorType: null,
  form: {
    valid: null,
    processState: 'filling',
    fields: {
      input: '',
    },
  },
}, render(elements, i18n));
