var http = require('http');
var finalhandler = require('finalhandler')
var serveStatic = require('serve-static')
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var kopol= require('./kopol.mini.js');

var jsonParser = bodyParser.json()
var app = express();

// Serve up public/ftp folder
var serve = serveStatic('.', {'index': ['index.html', 'index.htm']})

// Create server
var staticPort = 3000;
var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
}).listen(staticPort)
console.log('Static server at http://localhost:' + staticPort)
// server connection



app.use(function middleware(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post('/receiver', jsonParser, function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  var message = req.body.data;
  var ck = kopol.getChartPeformance(message, function(val){
  	console.log("charts performance best to worse: ",val)
  });

})



var dataPort = staticPort+1;
app.listen(dataPort);
console.log('Data server at http://localhost:' + dataPort)

