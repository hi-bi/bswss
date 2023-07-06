import WebSocket, { WebSocketServer } from 'ws';
import { userLogin } from './src/users.js';
import { newRoom } from './src/rooms.js';

const port = process.env.SERVER_PORT

const wss = new WebSocketServer({ port: 3000 });

console.log(`Web socket server running on port: ${wss.options.port}`);

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const req = JSON.parse(data);
    const reqCommand = req.type;
    const reqData = req.data;

    let res = req;
    let resData = {};

    console.log(`type-${reqCommand}: ${reqData}`);
    
    switch (reqCommand) {
      case 'reg':
          resData = userLogin(JSON.parse(reqData));
          ws.userId = resData.index;
          res.data = JSON.stringify(resData);
          
          ws.send(JSON.stringify(res));        
        break;

      case 'create_room':
          resData = newRoom(ws.userId);

          res.type = 'update_room';
          res.data = JSON.stringify(resData);
          
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(res));
            }
          });
          
        break;
      
      case 'add_user_to_room':  

      
        break;

      default:
        break;
    }

   
  });
});