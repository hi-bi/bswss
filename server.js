  import WebSocket, { WebSocketServer } from 'ws';
  import { userLogin } from './src/users.js';
  import { newRoom, addUserToRoom, updateRooms } from './src/rooms.js';
  import { newGame, newGameUser, setShips, getGamePartnerData } from './src/games.js';

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
          
          console.log('add_user_to_room');
          
          const addRoom = JSON.parse(reqData);
          const addUser = ws.userId;

          const currentRoomUsers = addUserToRoom(addRoom.indexRoom, addUser);

          console.log('currentRoomUsers: ', currentRoomUsers);
          
          if (currentRoomUsers.length == 2) {

            const newGameId = newGame();

            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                if (client.userId == currentRoomUsers[0] || client.userId == currentRoomUsers[1]) {

                  res.type = 'create_game';

                  const resNewGameData = newGameUser(newGameId, client.userId);
                  res.data = JSON.stringify(resNewGameData);

                  console.log('create_game res: ',  res);
                  
                  client.send(JSON.stringify(res));
                }
              }
            });

            res.type = 'update_room';
            
            const resNewGameRooms = updateRooms();
            res.data = JSON.stringify(resNewGameRooms);

            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {

                console.log('update_room res: ',  res);

                
                client.send(JSON.stringify(res));
              }
            });

          }

          break;

        case 'add_ships':
          
          console.log('add_ships');
    
          const addShipsData = JSON.parse(reqData);

          const resSetShips = setShips(addShipsData)

          console.log('resSetShips: ',resSetShips);

          if (resSetShips.init == 2) {

            res.type = 'start_game';

            const newGamePartnerData = getGamePartnerData(addShipsData.gameId, addShipsData.indexPlayer);
            
            const newGameCurrentUserData = getGamePartnerData(addShipsData.gameId, newGamePartnerData.currentPlayerIndex);

            res.data = JSON.stringify(newGameCurrentUserData);

            ws.send(JSON.stringify(res));

            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {

                if (client.userId == newGamePartnerData.currentPlayerIndex) {

                  res.data = JSON.stringify(newGamePartnerData);
              
                  client.send(JSON.stringify(res));


                  res.type = 'turn';

                  const turnPlayerId = {
                    currentPlayer: addShipsData.indexPlayer
                  };
        
                  res.data = JSON.stringify(turnPlayerId);
      
                  client.send(JSON.stringify(res));

                }
              }
            });

            res.type = 'turn';

            const turnPlayerId = {
              currentPlayer: addShipsData.indexPlayer
            };
  
            res.data = JSON.stringify(turnPlayerId);

            ws.send(JSON.stringify(res));

          } 

          break;

        default:
          break;
      }

    
    });
  });