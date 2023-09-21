const http = require('http');
const fs = require('fs');
const path = require('path');

var dt = require('./modules/dateModule')


const route = {
    '/': (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Hello World!');
    },
    '/about': (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('About page!');
    }
}

const middleware = [
    (req, res, next) => {
        // console.log('middleware 1');
        next();
    },
    (req, res, next) => {
        // console.log('middleware 2');
        next();
    },
]

function getContentType(filePath){
    const extname = path.extname(filePath);
    switch(extname) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        default:
            return 'text/plain';
    }
}

const server = http.createServer(function(req, res) {
    const filePath = path.join(__dirname, 'public', req.url)
    const contentType = getContentType(filePath);
    console.log(filePath);
    console.log(contentType);

    fs.readFile(filePath, (err, content) => {
        if(err){
            if (err.code === 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('404 Not Found');
            }else{
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content);
        }
    });

    let currentIndex = 0;
    const next = () => {
        if(currentIndex < middleware.length) {
            middleware[currentIndex++](req, res, next);
        }
    }
    next();

    // if(route[req.url]) {
    //     route[req.url](req, res);
    // } else {
    //     res.writeHead(404, {'Content-Type': 'text/html'});
    //     res.end('404 Not Found');
    // }

}).listen(8080);