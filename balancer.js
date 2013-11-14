var httpProxy = require('http-proxy');

var up = new Date();
var APP_NAME = process.env.APP_NAME || 'node-load-tester';
var BASE_DOMAIN = process.env.BASE_DOMAIN || '.herokuapp.com';
var NUM_INSTANCES = parseInt(process.env.INSTANCES,10) || 3;

console.log("Starting balancer '%s%s' with %s instances", APP_NAME,BASE_DOMAIN,NUM_INSTANCES);

// DEPLOY DIR 'git@heroku.com:NAME-INSTANCEID.git'
// var AUTH_KEY = new Buffer(":"+process.env.API_KEY).toString('base64');

var curr = 1;

var server = httpProxy.createServer(function (req, res, proxy) {

  if(req.url === '/__balancer_stats') {
    var json = JSON.stringify({ pings: totalPings, up: up.toString() }, null, 2);
    res.writeHead(200, 'application/json');
    res.end(json);
    return;
  }

  var hostname = APP_NAME + "-" + curr + BASE_DOMAIN;
  console.log('Bounce to #%s: %s', curr, hostname);

  req.headers.host = hostname;
  proxy.proxyRequest(req, res, { host: hostname, port: 80 });

  //increment
  curr = (curr+1 > NUM_INSTANCES) ? 1 : curr+1;
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Listening on " + port);
  ping();
});

var http = require('http');
var currPing = 1;
var totalPings = 0;

function ping() {
  totalPings++;
  var hostname = APP_NAME + "-" + currPing + BASE_DOMAIN;
  currPing = (currPing > NUM_INSTANCES) ? 1 : currPing+1;
  var req = http.request({
    hostname: hostname,
    port: 80,
    method: 'GET',
    path: '/'
  }, function(res) {
    if(res.statusCode !== 200)
      console.error('pinging %s status %s', hostname, res.statusCode);
    setTimeout(ping, 5*1000);
  });
  req.on('error', function(err) {
    console.error('pinging %s error %s', hostname, err);
  });
  req.end();
  
}
