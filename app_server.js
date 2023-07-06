import { createServer, Server, request } from 'http';
import 'dotenv/config';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import Semaphore from './src/semaphore.js';

const nonExistingResource = "The requested resource does not respond."; 

const hostname = '127.0.0.1';
const appPort = process.env.APP_PORT;

const numCPUs = availableParallelism();
let counter = numCPUs;

const stackFIFO = new Semaphore(1);

const httpRequest = function (port, url, method, reqData) {

  let childPort = (parseInt(process.env.APP_PORT) + counter % (numCPUs-1) + 1).toString();

  return new Promise ((resolve, reject) => {

    const options = {
      hostname: hostname,
      port: childPort,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'text/html',
      },
    };
    
    console.log(port, reqData, options)

    const subReq = request(options, (res) => {

      res.setEncoding('utf8');

      let body =  [];
      let result = {};

      res.on('data', (chunk) => {
        body.push(chunk.toString('utf8'));
      });
      res.on('end', () => {
        const userData = body.join('');
        result.statusCode = res.statusCode
        result.body = userData;

        resolve(result);
      });
    });

    subReq.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    subReq.write(JSON.stringify(reqData));
    subReq.end();
    
    counter = counter + 1;

  });
  
};

const httpChildRequest = function (port, url, method, reqData) {

  return new Promise ((resolve, reject) => {

    const options = {
      hostname: hostname,
      port: process.env.SERVER_PORT,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'text/html',
      },
    };
    
    console.log(port, reqData, options)

    const subReq = request(options, (res) => {

      res.setEncoding('utf8');

      let body =  [];
      let result = {};

      res.on('data', (chunk) => {
        body.push(chunk.toString('utf8'));
      });
      res.on('end', () => {
        const userData = body.join('');
        result.statusCode = res.statusCode
        result.body = userData;

        resolve(result);
      });
    });

    subReq.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e.message);
    });

    console.log(JSON.stringify(reqData));
    subReq.write(JSON.stringify(reqData));
    subReq.end();

  });
  
};


if (cluster.isPrimary) {

  const appServer = new Server();

  const requestAppListener = function (req, res) {
  
    let body =  [];
    let userData = '';
  
    switch (req.method) {
      case 'GET':
  
        stackFIFO.callFunction(httpRequest, '30001', req.url, req.method, '')
        .then((value) => {
        
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = value.statusCode;
          let str = '';
          str = `Result from DB server: ${value.body}`;
          res.end(str);
        })
        break;
  
      case 'POST':
        body = []
        req.on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          const userData = JSON.parse(body);
  
          stackFIFO.callFunction(httpRequest, '30001', req.url, req.method, userData)
          .then((value) => {
            console.log('value', value);
            
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = value.statusCode;
            let str = '';
            str = `Result from DB server: ${value.body}`;
            res.end(str);
          })
    
        })
  
        break;
          
      case 'PUT':
        body = []
        req.on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          const userData = JSON.parse(body);
  
          stackFIFO.callFunction(httpRequest, '30001', req.url, req.method, userData)
          .then((value) => {
            console.log('value', value);
            
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = value.statusCode;
            let str = '';
            str = `Result from DB server: ${value.body}`;
            res.end(str);
          })
    
        })
  
        break;
    
      case 'DELETE':
        stackFIFO.callFunction(httpRequest, '3001', req.url, req.method, '')
        .then((value) => {
        
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = value.statusCode;
          let str = '';
          str = `Result from DB server: ${value.body}`;
          res.end(str);
        })
        break;
  
      default:
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 404;
        res.end(nonExistingResource);
  
        break;
    }
  
  }    
  
  appServer.on('request', requestAppListener);
  
  appServer.on('listening', () => {
    console.log(`App server running at http://${hostname}:${appPort}/`);
  });
  
  appServer.listen(appPort);
  
  for (let index = 1; index < numCPUs; index++) {
    cluster.fork({APP_PORT: parseInt(appPort)+index});
  }

  cluster.on('listening', (worker) => {
    console.log(`Worker ${worker.id} ready`);

    setTimeout(() => {
      worker.send('Hello Primary');
      }, 2000);
  });

  for (let i in cluster.workers) {
    cluster.workers[i].on(
      'message',
      function (i, msg) {
        console.log(`Worker ${i} => Primary: ${msg}`);
      }.bind(this, i),
    );
  }
} else {

  const appServer = new Server();

  const requestAppChildListener = function (req, res) {
  
    let body =  [];
    let userData = '';
  
    switch (req.method) {
      case 'GET':
  
        httpChildRequest('30000', req.url, req.method, '') 
        .then((value) => {
        
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = value.statusCode;
          let str = '';
          str = `Result from DB server: ${value.body}`;
          res.end(str);
        })
        break;
  
      case 'POST':
        body = []
        req.on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          const userData = JSON.parse(body);
  
          console.log(userData);
  
          httpChildRequest('30000', req.url, req.method, userData) 
          .then((value) => {
            console.log('value', value);
            
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = value.statusCode;
            let str = '';
            str = `Result from DB server: ${value.body}`;
            res.end(str);
          })
    
        })
  
        break;
          
      case 'PUT':
        body = []
        req.on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          body = Buffer.concat(body).toString();
          const userData = JSON.parse(body);
  
          httpChildRequest('30000', req.url, req.method, userData) 
          .then((value) => {
            console.log('value', value);
            
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = value.statusCode;
            let str = '';
            str = `Result from DB server: ${value.body}`;
            res.end(str);
          })
    
        })
  
        break;
    
      case 'DELETE':
        httpChildRequest('30000', req.url, req.method, '') 
        .then((value) => {
        
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = value.statusCode;
          let str = '';
          str = `Result from DB server: ${value.body}`;
          res.end(str);
        })
        break;
  
      default:
        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 404;
        res.end(nonExistingResource);
  
        break;
    }
  
  }    
  
  appServer.on('request', requestAppChildListener);
  
  appServer.on('listening', () => {
    console.log(`App server running at http://${hostname}:${appPort}/`);
  });
  
  appServer.listen(process.env.APP_PORT);
  
  cluster.worker.on('message', (msg) => {
    console.log(`Primary => Worker ${cluster.worker.id}: ${msg}`);
  });

  cluster.worker.send('Hello Primary from port: ' + process.env.APP_PORT);
}
