const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('node:querystring');
var bodyParser = require('body-parser');
require('dotenv').config();

const { MongoClient } = require("mongodb");
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect().then((connectedClient) => {
      global._mongoClientPromise = connectedClient;
      return connectedClient;
    });
  } else {
    clientPromise = Promise.resolve(global._mongoClientPromise);
  }
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}



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
    '/initialize-room': (req, res, parameters) => {
        console.log('create-room');
        // create a room check if it already exists in the database
        // if it does not exist, initialize a document for it
        // if it does exist, return return previous questions and response
        bodyParser.json()(req, res, ()=>{
            console.log('bodyParser')
            console.log(req.body);

            clientPromise.then((client) => {
                const db = client.db('test');
                const collection = db.collection('rooms');
                collection.updateOne(
                    {'room_id' : req.body.room},
                    {$set: {'room_id' : req.body.room}},
                    {upsert: true},
             )}
            );
        
            clientPromise.then(async (client) => {
                const db = client.db('test');
                const collection = db.collection('rooms');
                
                const query = {'room_id' : req.body.room};
                const options = {
                    projection : {
                        room_id: 1, questions: 1
                    }
                }

                const result = await collection.findOne(query, options)
                console.log(result);
            });


            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('create-room');
        })
        // console.log(req.body);
        
    },
    '/test': (req, res, parameters) => {
        clientPromise.then((client) => {
            const db = client.db('test');
            const collection = db.collection('test');
            collection.insertOne({test: 'test1'});
        })
        console.log('test');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('test');
    }
}

const middleware = [
    (req, res, next) => {
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
    // console.log(req.url); 
    var qstring = querystring.parse(req.url.split('?')[1]);
    req.url = req.url.split('?')[0];
    if(route[req.url]) {
        route[req.url](req, res, qstring);
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