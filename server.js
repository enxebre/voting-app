var express = require('express'),
    async = require('async'),
    pg = require("pg"),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    app = express(),
    server = require('http').Server(app),
    redis = require('redis'),
    io = require('socket.io')(server);

io.set({transports: ['websocket']});

var port = process.env.SERVER_PORT || 80;
var redisPort = process.env.REDIS_SERVICE_PORT || 6379;
var redisHost = process.env.REDIS_SERVICE_HOST || 'redis';

var redisClient = redis.createClient({ port: redisPort, host: redisHost});

io.sockets.on('connection', function (socket) {

  socket.emit('message', { text : 'Welcome!' });

  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });

  socket.on('vote', function (data) {
    console.log(data);
    redisClient.incr(data);
  });

});

function getVotes(client) {
  redisClient.mget(['a', 'b'], function (err, res) {
    console.dir(res);
    io.sockets.emit("scores", res);
    setTimeout(function() {getVotes(client) }, 1000);
  });
}
getVotes(redisClient);

app.use(express.static(__dirname + '/views'));
app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname + '/views/index.html'));
});

server.listen(port, function () {
  var port = server.address().port;
  console.log('App running on port ' + port);
});
