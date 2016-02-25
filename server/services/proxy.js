var proxy = function (session, callback) {
  var express = require('express');
  var fs = require('fs');
  var parser = require('body-parser');
  var proxyMiddleware = require('http-proxy-middleware');
  var webshot = require('webshot');
  var mkdirp = require('mkdirp');
  var path = require('path');
  var auth = require('./auth');
  var imagesController = require('../controllers/imagesController');
  var mousetrackingController = require('../controllers/mousetrackingController');
  var app = express();
  var newServer;
  console.log(session)
  //proxy middleware
  app.use(parser.json());
  app.use(parser.urlencoded({ extended: true }));
  app.use(express.static('testview'));

  app.get('/testview', auth.decode, function (req, res) {
    var context = '/';
    var options = {
      target: session.url, // target host
      changeOrigin: true, // needed for virtual hosted sites
      ws: true, // proxy websockets
    };
    var proxy = proxyMiddleware(context, options);

    app.use(proxy);
    res.sendFile(path.join(__dirname, '/../../client/public/testview/', 'testview.html'));
  });

  app.get('/api/realUrl', auth.decode, function (req, res) {
    res.send(session.url);
  });

  app.post('/api/screenshot', auth.decode, function (req, res) {
    var url = req.body.url;
    var resolution = [req.body.resolution[0] + 'x' + req.body.resolution[1]];
    var directory = __dirname + '/../data/screenshots/' + session.testId + '/';
    var dir = path.resolve(__dirname, '../data/screenshots/', session.testId) + '/';

    var slug = function (input) {
      return input
        .replace(/^http:\/\/www/g, '')
        .replace(/^http:\/\//g, '')
        .replace(/^\s\s*/, '') // Trim start
        .replace(/\s\s*$/, '') // Trim end
        .toLowerCase() // Camel case is bad
        .replace(/[^a-z0-9_\-~!\+\s]+/g, '') // Exchange invalid chars
        .replace(/[\s]+/g, '-'); // Swap whitespace for single hyphen
    }

    mkdirp(directory, function (err) {
      if (err) {
        throw (new Error('ERROR! Directory creation error!'));
      }
    })

    var options = {
      screenSize: {
        width: req.body.resolution[0],
        height: req.body.resolution[1]
      }
    };

    webshot(url, dir + slug(url) + '.jpg', options, function (err) {
      var params = {
        testId: session.testId,
        url: url,
        image: dir + slug(url) + '.jpg'
      };

      return imagesController.createImage(params)
        .then(function (result) {
          var params = {
            userId: req.decoded.iss,
            imageId: result.get('id'),
            data: req.body.mouseTracking
          };

          return mousetrackingController.createMouseTracking(params)
            .then(function (result) {
              res.json(result.get())
            })
            .catch(function (error) {
              console.log('ERROR! Failed to save mousetracking data!', error);
              res.status(500).end('DB ERROR! Failed to create mousetracking data!');
            });
        });
    })
  });

  app.get('/api/endtest', auth.decode, function (req, res) {
    console.log('test ended', session.callbackUrl);
    res.send(session.callbackUrl);
    process.exit();
  })

  app.listen(session.port, function () {
    // callback();
    console.log('Proxy server is running on' + session.location + session.port);
  });
};
console.log('hi')

proxy(JSON.parse(process.argv[2]), process.argv[3]);