
module.exports = function(app) {
  return {
    start: require('./start-page.js')(app),
    startMore: require('./start-page-more.js')(app),

    cls: require('./cls-page.js')(app),
    tag: require('./tag-page.js')(app),
    article: require('./article-page.js')(app),
    page: require('./generic-page.js')(app),
    contributors: require('./contributors-page.js')(app),
    contributor: require('./contributor-page.js')(app),
    search: require('./search-page.js')(app),

    mainRss: require('./main-rss.js')(app),
    clsRss: require('./cls-rss.js')(app)
  };
};
