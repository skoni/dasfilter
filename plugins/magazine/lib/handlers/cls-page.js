var _ = require('lodash');
var Q = require('kew');
var Layout = require('../layout.js');


module.exports = function clsHandler(app) {

  return function(request, reply) {

    // optional start date for pagination
    var startDate = request.query.date;
    var slug = request.params.tag;

    app.models.classifications.getAll().then(function(cs) {
      var classes = cs;
      var cls = classes.bySlug[request.params.classification];
      if (!cls) {
        var err = new Error('Category or Collection not found: ' + request.params.classification);
        err.code = 404;
        throw err;
      }

      var type = cls.type_.toLowerCase();

      var wireframe = {};
      if (type === 'category') {
        wireframe.groups = [
          Layout.createGroup(type, 'spaced', { numTeasers: 2, category: cls }),
          Layout.createGroup(type, 'spaced', { numTeasers: 15, category: cls })
        ];
      }
      else {
        wireframe.groups = [
          Layout.createGroup(type, 'spaced', { numTeasers: 2, collection: cls }),
          Layout.createGroup(type, 'spaced', { numTeasers: 15, collection: cls })
        ];
      }

      return Layout.build(app, classes, wireframe, startDate).then(function(layout) {

        var nextDate = layout.refs[type][cls._id].nextDate;

        app.replyView(request, reply, 'chrono-page', {
          pageType: 'cls-page',
          pageTitle: cls.title,
          pageDescription: 'Artikel zum Thema ' + cls.title,
          headerTitle: cls.title,
          headerTitleUrl: app.urls.classification(cls),
          layout: layout,
          classification: cls,
          classifications: classes,
          nextDate: nextDate
        });
      });

    }).fail(function(err) {
      reply(err);
    });
  };
};
