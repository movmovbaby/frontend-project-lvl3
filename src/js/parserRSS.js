/* eslint-env browser */
export default (rssFeed) => {
  const parsedXML = new DOMParser().parseFromString(rssFeed.data, 'application/xml');
  const parseError = parsedXML.querySelector('parsererror');
  if (parseError) {
    const textError = parseError.textContent;
    const error = new Error(textError);
    error.NotValidRss = true;
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

  return [feed, posts];
};
