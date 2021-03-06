var Path = require('path');
var _ = require('lodash');
var Marked = require('marked');
Marked.setOptions({
  breaks: true
});
var Api = require('../../api-client');
var Models = require('./lib/models/models.js');
var Handlers = require('./lib/handlers/handlers.js');
var CreateUrlHelper = require('./lib/url-helper.js');


exports.register = function(plugin, options, next) {

  var api = Api(options.apiUrl, 'admin', options.apiKey);

  plugin.views({
    engines: { jade: require('jade') },
    path: __dirname + '/views',
    isCached: !options.debug
  });

  var urls = {
    images: options.staticUrl + '/images',
    assets: '/static/assets',
    magazine: ''
  };
  plugin.log(['magazine'], 'paths: ' + JSON.stringify(urls));

  var app = {
    debug: options.debug,
    urls: CreateUrlHelper(urls),
    api: api,
    definitions: options.definitions,
    resources: options.cores.resources,
    models: Models(options.cores.resources),

    replyView: function(request, reply, viewName, context, options) {
      reply.view(viewName, _.merge(context, {
        debug: app.debug,
        markdown: Marked,
        formatDate: function(str) {
          var date = new Date(str);
          var dd = date.getDate();
          var MM = date.getMonth() + 1;
          var yy = date.getFullYear();
          return dd + '.' + MM + '.' + yy;
        },
        urls: CreateUrlHelper(urls, request)
      }), options);
    }
  };

  var handlers = Handlers(app);

  plugin.route([
    // start page
    {
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        if (request.query.date) {
          handlers.startMore(request, reply);
        }
        else {
          handlers.start(request, reply);
        }
      }
    },

    // category or collection page
    {
      method: 'GET',
      path: '/{classification}',
      handler: handlers.cls
    },
    {
      method: 'GET',
      path: '/{classification}/',
      handler: function(request, reply) {
        reply('You are being redirected...').redirect('/' + request.params.classification);
      }
    },

    // route matching each article in either its category, or any of its collections
    // redirects to category path if article slug is valid but classification is not
    {
      method: 'GET',
      path: '/{classification}/{article}',
      handler: handlers.article
    },
    {
      method: 'GET',
      path: '/{classification}/{article}/',
      handler: function(request, reply) {
        reply('You are being redirected...').redirect('/' + request.params.classification + '/' + request.params.article);
      }
    },

    // generic pages
    {
      method: 'GET',
      path: '/s/{page}',
      handler: handlers.page
    },
    {
      method: 'GET',
      path: '/s/{page}/',
      handler: function(request, reply) {
        reply('You are being redirected...').redirect('/s/' + request.params.page);
      }
    },

    // tags
    {
      method: 'GET',
      path: '/tags/{tag}',
      handler: handlers.tag
    },
    {
      method: 'GET',
      path: '/tags/{tag}/',
      handler: function(request, reply) {
        reply('You are being redirected...').redirect('/tags/' + request.params.tag);
      }
    },

    // contributors
    {
      method: 'GET',
      path: '/autoren',
      handler: handlers.contributors
    },
    {
      method: 'GET',
      path: '/autoren/{contributor}',
      handler: handlers.contributor
    },

    // main rss
    {
      method: 'GET',
      path: '/rss',
      handler: handlers.mainRss
    },
    // cls rss
    {
      method: 'GET',
      path: '/rss/{classification}',
      handler: handlers.clsRss
    },

    // search
    {
      method: 'GET',
      path: '/suchen',
      handler: handlers.search
    },

    // static
    {
      method: 'GET',
      path: '/favicon.ico',
      handler: { file: Path.join(Path.resolve(options.assetsDir), 'favicon.ico') }
    },
    {
      method: 'GET',
      path: '/static/assets/{path*}',
      handler: {
        directory: { path: [Path.resolve(options.assetsDir)], listing: true }
      }
    }
  ]);

  //
  // error pages
  //
  plugin.ext('onPreResponse', function(request, reply) {

    if (request.response.isBoom) {
      // redirect to error page
      var errorCode = request.response.code;
      var errorSlug = '';

      switch (errorCode) {
      case 403: // forbidden
      case 404: // not found
      case 500: // server error
        errorSlug = errorCode.toString();
        break;
      default:
        errorSlug = 'fehler';
        break;
      }

      plugin.log(['magazine'], 'error when ' + request.method + ' ' + request.path);
      plugin.log(['magazine'], 'redirect to error page:' + errorSlug + ', code: ' + errorCode);

      var path = '/s/' + errorSlug;
      // prevent loops
      if (request.path !== path) {
        return reply('You are being redirected').redirect(path);
      }
    }
    return reply.continue();
  });

  try {
    next();
  }
  catch (e) {
    console.log(e);
    console.log(e.stack);
    next(e);
  }
};

exports.register.attributes = {
  name: 'df-magazine'
};
