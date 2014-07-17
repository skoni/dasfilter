
var NUM_ARTICLES = 12;

module.exports = function tagHandler(app) {

  return function(request, reply) {
    var classes;

    // optional start date for pagination
    var startDate = request.query.date;
    var slug = request.params.tag;

    app.models.classifications.getAll().then(function(cs) {
      classes = cs;

      return app.models.teasers.byTag(
        slug,
        startDate || new Date().toISOString(),
        NUM_ARTICLES + 1
      );
    }).then(function(docs) {
      var tag;
      var teasers = docs.map(function(doc) {
        if (!tag) {
          doc.classification.tags.forEach(function(t) {
            if (t.slug === slug) {
              tag = t;
            }
          });
        }
        return {
          display: 'light cls',
          showText: true,
          doc: doc
        };
      });

      var nextDate = '';
      if (docs.length > NUM_ARTICLES) {
        nextDate = docs[docs.length - 2].date;
        docs.pop();
      }

      app.replyView(request, reply, 'cls-page', {
        teasers: teasers,
        tag: tag,
        classifications: classes,
        nextDate: nextDate,
        isFirstPage: !startDate
      });

    }).fail(function(err) {
      reply(err);
    });

  };
};
