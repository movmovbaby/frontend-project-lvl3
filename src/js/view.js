import onChange from 'on-change';
import _ from 'lodash';

const handleProcessState = (elements, processState) => {
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

    case 'rssParser':
      elements.feedback.textContent = i18n.t('form.errors.rssParser');
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

const renderPosts = (elements, i18n, posts) => {
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

  posts.forEach((post) => {
    const { id } = post;
    const postItem = document.createElement('li');
    postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const linkElement = document.createElement('a');
    linkElement.classList.add('fw-bold');
    linkElement.setAttribute('href', post.link);
    linkElement.setAttribute('target', '_blank');
    linkElement.setAttribute('rel', 'noopener noreferrer');
    linkElement.setAttribute('data-id', id);
    linkElement.textContent = post.title;

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

const renderVisitedPosts = (elements, value) => {
  const id = value.values().next().value;
  const { postsContainer } = elements;
  const visitedLink = postsContainer.querySelector(`a[data-id="${id}"]`);
  visitedLink.classList.remove('fw-bold');
  visitedLink.classList.add('fw-normal', 'link-secondary');
};


const renderModal = (state, elements, id) => {
  const { modal } = elements;
  const post = state.posts.filter((post) => post.id === id);
  modal.querySelector('.modal-title').textContent = post.title;
  modal.querySelector('.modal-body').textContent = post.description;
  modal.querySelector('.full-article').href = post.link;
};

const render = (state, elements, i18n) => (path, value) => {
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

    case 'feeds':
      renderFeeds(elements, i18n, value);
      break;

    case 'posts':
      renderPosts(elements, i18n, value);
      break;

    case 'visitedPosts':
      renderVisitedPosts(elements, value);

    case 'dataIDForModal':
      renderModal(state, elements, value);
    default:
      break;
  }
};



export default (state, elements, i18n) => onChange(state, render(state, elements, i18n));
