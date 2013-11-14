var httpProxy = require('http-proxy');

var up = new Date();
var APP_NAME = process.env.APP_NAME || 'node-load-tester';
var BASE_DOMAIN = process.env.BASE_DOMAIN || '.herokuapp.com';
var NUM_INSTANCES = parseInt(process.env.INSTANCES,10) || 3;

console.log("Starting balancer '%s%s' with %s instances", APP_NAME,BASE_DOMAIN,NUM_INSTANCES);

var totalRequests = 0;
var totalPings = 0;
// DEPLOY DIR 'git@heroku.com:NAME-INSTANCEID.git'
// var AUTH_KEY = new Buffer(":"+process.env.API_KEY).toString('base64');

var proxyCtr = counter(1, NUM_INSTANCES);

var server = httpProxy.createServer(function (req, res, proxy) {

  if(req.url === '/__balancer_stats') {
    var json = JSON.stringify({
      requests: totalRequests,
      pings: totalPings,
      up: up.toString(),
      APP_NAME: APP_NAME,
      BASE_DOMAIN: BASE_DOMAIN,
      NUM_INSTANCES: NUM_INSTANCES,
      env: process.env
    }, null, 2);
    res.writeHead(200, 'application/json');
    res.end(json);
    return;
  }

  totalRequests++;
  var hostname = APP_NAME + "-" + proxyCtr() + BASE_DOMAIN;
  req.headers.host = hostname;
  proxy.proxyRequest(req, res, { host: hostname, port: 80 });
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log("Listening on " + port);
  ping();
});

var http = require('http');
var pingCtr = counter(1, NUM_INSTANCES);

function ping() {
  totalPings++;
  var hostname = APP_NAME + "-" + pingCtr() + BASE_DOMAIN;
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

function counter(min, max) {
  var curr = min-1;
  return function() {
    curr = (curr+1 > max) ? min : curr+1;
    return curr;
  };
}

