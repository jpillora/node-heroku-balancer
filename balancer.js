var bouncy = require('bouncy');

var APP_NAME = process.env.APP_NAME || 'node-load-tester';
var BASE_DOMAIN = process.env.BASE_DOMAIN || '.herokuapp.com';
var NUM_INSTANCES = parseInt(process.env.INSTANCES,10) || 3;

// DEPLOY DIR 'git@heroku.com:NAME-INSTANCEID.git'
// var AUTH_KEY = new Buffer(":"+process.env.API_KEY).toString('base64');

var curr = 1;

var server = bouncy(function (req, res, bounce) {
  var hostname = APP_NAME + "-" + curr + BASE_DOMAIN;
  console.log('Bounce to #%s: %s', curr, hostname);

  bounce(hostname, 80, {
    headers: {
      host: hostname
    }
  });

  //increment
  curr++;
  if(curr > NUM_INSTANCES) curr = 1;
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Listening on " + port);
});