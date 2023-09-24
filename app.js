const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('node:querystring');

var dt = require('./modules/dateModule')


const route = {
    '/': (req, res, parameters) => {
        const filePath = path.join(__dirname, 'public', 'index.html')
        _staticFileHandler(filePath, res); 
    },
    '/host': (req, res, parameters) => {
        const filePath = path.join(__dirname, 'public', 'host.html')
        _staticFileHandler(filePath, res); 
    },
    '/join': (req, res, parameters) => {
        const filePath = path.join(__dirname, 'public', 'participant.html')
        _staticFileHandler(filePath, res);
    },
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

function staticFileHandler(req, res) {
    const filePath = path.join(__dirname, 'public', req.url)
    _staticFileHandler(filePath, res);
}

function _staticFileHandler(filePath, res) {
    const contentType = getContentType(filePath);
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
    })
}

const server = http.createServer(function(req, res) {
    const filePath = path.join(__dirname, 'public', req.url)
    const contentType = getContentType(filePath);
    console.log(req.url); 
    var qstring = querystring.parse(req.url.split('?')[1]);
    console.log(qstring)
    console.log(qstring.room)
    req.url = req.url.split('?')[0];
    if(route[req.url]) {
        route[req.url](req, res);
        return;
    } else if(contentType !== 'text/html'){
        staticFileHandler(req, res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('404 Not Found');
    }
     

    // let currentIndex = 0;
    // const next = () => {
    //     if(currentIndex < middleware.length) {
    //         middleware[currentIndex++](req, res, next);
    //     }
    // }
    // next();

    

}).listen(8080);