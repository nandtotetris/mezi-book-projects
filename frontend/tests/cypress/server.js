const handler = require('serve-handler');
const http = require('http');

function createServer() {

  const server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/zeit/serve-handler#options
    return handler(request, response, {
      "public": "build",
      "cleanUrls": false,
      "rewrites": [
        {
          source: '**',
          destination: '/index.html'
        }
      ],
      "headers": [
        {
          "source" : "**/*.*",
          "headers" : [{
            "key" : "Access-Control-Allow-Origin",
            "value" : "*"
          },
          {
            "key" : "Access-Control-Allow-Headers",
            "value" : "Origin, X-Requested-With, Content-Type, Accept"
          },
          {
            "key" : "X-FRAME-OPTIONS",
            "value" : "ALLOWALL"
          },
          {
            "key" : "X-Api-Url",
            "value" : "http://localhost:5000"
          }]
        }
      ]
    });
  })

  server.listen(3000, () => {
    console.log('Running at http://localhost:3000');
    process && process.send && process.send('ready');
  });

  process.on('SIGINT', function() {
    server && server.stop && server.stop(function(err) {
      process && process.exit && process.exit(err ? 1 : 0);
    });
  });

  return server;
}

module.exports = createServer();
