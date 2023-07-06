import { WebSocketServer } from 'ws';

const port = process.env.SERVER_PORT

const wss = new WebSocketServer({ port: port });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});