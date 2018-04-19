const http = require("http");
const storage = require("../storage").storage;

const MAX_LONG_POLL_TIME = 5;

http.createServer(function (req, res) {
    let headers = {'Content-Type': 'application/json'};
    headers['Access-Control-Allow-Origin'] = 'http://localhost:63342';

    // log request object
    console.log("\nIncoming request: " + req.method + " " + req.url);

    // initialize the body to get the data asynchronously
    req.body = "";

    // get the data of the body
    req.on('data', function (chunk) {
        req.body += chunk;
        console.log("adding data");
    });

    // all data have been received
    req.on('end', function () {
        if (req.url.match("^/messages")) {
            if (req.method === "GET") {
                storage.clients.push(res);
            } else if (req.method === "POST") {
                processPostRequest(req, res);
            }
        } else {
            console.log("bad request");
            res.writeHead(400);
            res.end('bad request');
        }
    });

    function sendGetMessage() {
        let messages = storage.messages;

        console.log("returning messages");

        for (const res of storage.clients) {
            res.writeHead(200, headers);
            res.end(JSON.stringify(messages));
        }
    }

    // main function to process a GET request
    function processPostRequest(req, res) {
        const msg = JSON.parse(req.body);
        console.log("incoming message: " + msg.message);
        storage.messages.push(msg);

        sendGetMessage();

        res.writeHead(200, headers);
        res.end();
    }
}).listen(8080);
