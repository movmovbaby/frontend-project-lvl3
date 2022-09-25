/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const handleProcessState = (elements, i18n, processState) => {
  switch (processState) {
    case 'sent':
      elements.submitButton.disabled = false;
      break;

    case 'error':
      break;

    case 'sending':
      elements.submitButton.disabled = true;
      break;

    case 'filling':
      elements.submitButton.disabled = false;
      break;

    case 'dataLoaded':
      elements.feedback.textContent = i18n.t('form.rssValid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.form.reset();
      elements.form.focus();
      break;

    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const handleFormValid = (elements, value) => {
  if (value === false) {
    elements.input.classList.add('is-invalid');
    return;
  }
  elements.input.classList.remove('is-invalid');
};

const handleErrors = (elements, i18n, value) => {
  elements.submitButton.disabled = false;
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  switch (value) {
    case 'form.error.urlDuplicate':
      elements.feedback.textContent = i18n.t('form.error.urlDuplicate');
      break;

    case 'form.error.urlInvalid':
      elements.feedback.textContent = i18n.t('form.error.urlInvalid');
      break;

    case 'form.error.rssParser':
      elements.feedback.textContent = i18n.t('form.error.rssParser');
      break;

    case 'form.error.rssInvalid':
      elements.feedback.textContent = i18n.t('form.error.rssInvalid');
      break;

    default:
      console.log('Unknown error type = ', value);
      break;
  }
  elements.form.reset();
  elements.form.focus();
};

const renderFeeds = (elements, i18n, feeds) => {
  const { feedsContainer } = elements;
  feedsContainer.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('feed.header');
  cardBody.append(cardTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.forEach((feed) => {
    const feedItem = document.createElement('li');
    feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const title = document.createElement('h3');
    title.classList.add('h6', 'm-0');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;

    feedItem.append(title, description);
    feedsList.append(feedItem);
  });

  card.append(cardBody, feedsList);
  feedsContainer.append(card);
};

const renderPosts = (state, elements, i18n) => {
  const { postsContainer } = elements;
  postsContainer.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('post.header');
  cardBody.append(cardTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach((post) => {
    const { id, title, link } = post;
    const postItem = document.createElement('li');
    postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const linkElement = document.createElement('a');
    const linkClass = state.visitedPosts.has(id) ? 'fw-normal link-secondary' : 'fw-bold';
    linkElement.setAttribute('class', linkClass);
    linkElement.setAttribute('href', link);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('rel', 'noopener noreferrer');
    linkElement.setAttribute('data-id', id);
    linkElement.textContent = title;

    const buttonElement = document.createElement('button');
    buttonElement.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonElement.setAttribute('type', 'button');
    buttonElement.setAttribute('data-bs-toggle', 'modal');
    buttonElement.setAttribute('data-bs-target', '#modal');
    buttonElement.setAttribute('data-id', id);
    buttonElement.textContent = i18n.t('post.button');
    postItem.append(linkElement, buttonElement);

    postsList.append(postItem);
  });

  card.append(cardBody, postsList);
  postsContainer.append(card);
};

const renderModal = (state, elements, id) => {
  const { modal } = elements;
  const { title, description, link } = state.posts.filter((post) => post.id === id)[0];
  modal.querySelector('.modal-title').textContent = title;
  modal.querySelector('.modal-body').textContent = description;
  modal.querySelector('.full-article').href = link;
};

const render = (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(elements, i18n, value);
      break;

    case 'form.valid':
      handleFormValid(elements, value);
      break;

    case 'form.error':
      handleErrors(elements, i18n, value);
      break;

    case 'feeds':
      renderFeeds(elements, i18n, value);
      break;

    case 'posts':
      renderPosts(state, elements, i18n, value);
      break;

    case 'visitedPosts':
      renderPosts(state, elements, i18n, value);
      break;

    case 'dataIDForModal':
      renderModal(state, elements, value);
      break;

    default:
      break;
  }
};

export default (state, elements, i18n) => onChange(state, render(state, elements, i18n));
