
module.exports = function mainRssHandler(app) {

  return function(request, reply) {

    app.models.teasers.byClsDate(
      '*',
      new Date().toISOString(),
      25

    ).then(function(docs) {
			var res = app.replyView(request, reply, 'rss', {
				articles: docs
			}, { contentType: 'application/xml' });

    }).fail(function(err) {
      reply(err);
    });
  };
};
