import axios from 'axios';
import _ from 'lodash';

const loadRSS = (url) => {
  const proxyURL = `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`;
  return axios.get(proxyURL);
};

const parserRSS = (rssFeed) => {
  const parsedXML = new DOMParser().parseFromString(rssFeed.data.contents, 'application/xml');
  const parseError = parsedXML.querySelector('parsererror');
  if (parseError) {
    const textError = parseError.textContent;
    const error = new Error(textError);
    error.rssInvalid = true;
    throw error;
  }
  const feed = {
    title: parsedXML.querySelector('channel title').textContent,
    description: parsedXML.querySelector('channel description').textContent,
  };

  const posts = Array.from(parsedXML.querySelectorAll('item'))
    .map((item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const description = item.querySelector('description').textContent;
      return { title, link, description };
    });

  return { feed, posts };
};

const updateRSS = (state) => {
  const { feeds, posts } = state;
  const promises = feeds.map((feed) => loadRSS(feed.url)
    .then((rss) => {
      const { posts: loadedPosts } = parserRSS(rss);
      const oldPosts = posts.filter((post) => post.feedID === feed.id);
      const diff = _.differenceBy(loadedPosts, oldPosts, 'link');
      if (diff.length !== 0) {
        const postsToAdd = diff.map((post) => ({ ...post, id: _.uniqueId(), feedId: feed.id }));
        state.posts = [...postsToAdd, ...posts];
      }
    })
    .catch((e) => console.log(e)));

  Promise.all(promises)
    .finally(() => setTimeout(() => updateRSS(state), 5000));
};

export { loadRSS, parserRSS, updateRSS };
