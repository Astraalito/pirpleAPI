/*
 * Primary file for the API
 *
 *
 */

// Depedencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all request with a string
var server = new http.createServer(function (req, res) {

    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true)

    // Get the path from that url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req
        .method
        .toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any Send the response
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // Send the response
        res.end("Hello world\n");

        // Log the headers
        console.log('Request received with this payload : ', buffer);
    });

});

// Start the server and listening on port 3000
server.listen(3000, function () {
    console.log('The server is listening on port 3000');
});