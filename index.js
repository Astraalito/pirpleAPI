/*
 * Primary file for the API
 *
 *
 */

// Depedencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instanciating the HTTP server

var httpServer = http.createServer((req, res) => unifiedServer(req, res));

// Start the server

httpServer.listen(config.httpPort, () => console.log('The HTTP server is listening on port ' + config.httpPort + ' in ' + config.envName + ' mode'));

// Instanciate the HTTPS server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req,res));

// Start the HTTPS server


httpsServer.listen(config.httpsPort, () => console.log('The HTTPS server is listening on port ' + config.httpsPort + ' in ' + config.envName + ' mode'));


// All the server logic for both http and https server
var unifiedServer = function (req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true)

    // Get the path from that url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any Send the response
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', (data) => buffer += decoder.write(data));

    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to
        // If one is not found, use the not found handler
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ?
            router[trimmedPath] :
            handlers.notFound;

        // Construct the data object to send to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the hanlder or default to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            // Use the payload called back by the handler, or default to an empty object
            payload = typeof (payload) == 'object' ? payload : {}

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the headers
            console.log('Returning this response : ', statusCode, payloadString);
        });
    });
};

// Define the handlers
var handlers = {};

// Ping handler

handlers.ping = ((data, callback) => callback(200));

// Not found handler

handlers.notFound = ((data, callback) => callback(404));


// Define a request router
var router = {
    'ping': handlers.ping
};