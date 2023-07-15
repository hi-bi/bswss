import WebSocket, { WebSocketServer } from 'ws';
import { addNewBot, botName, botPass, setRootBotId, userLogin } from './interfaces/users';
import { newRoom, addUserToRoom, updateRooms } from './interfaces/rooms';
import { newGame, newGameUser, setShips, getGamePartnerData, startGame, attackResponse, getTurnUserId, setTurnUserId } from './interfaces/games';
import { getSessionUser, getUserSession } from './interfaces/user_session';
import { addUserWin, getWinners } from './interfaces/winners';

const serverPort: number = parseInt(process.env.SERVER_PORT || '3000'); 

const wss = new WebSocketServer ({port: serverPort});

console.log(`Web socket server running on port: ${wss.options.port}`);

const bs = new WebSocket("ws://localhost:3000");

bs.onopen = function(event) {
  console.log("Bot socket opened");
  const botReg = {
    type: "reg",
    data: JSON.stringify(
      {
        name: botName,
        password: botPass,
      },
    ),
    id: 0,
  }
  bs.send(JSON.stringify(botReg) );

};

bs.onmessage = function(event) {
  console.log(`[bot message] Received data: ${event.data}`);
  let body = '';
  body += event.data;

  const req = JSON.parse(body);
    
  const reqCommand = req.type;
  const reqData = req.data;

  switch (reqCommand) {
    case 'reg':
      setRootBotId();
      console.log('Bot socket connection established: ', reqData);

      break;
  
      case 'create_game':


        console.log('create_game: ', JSON.parse(reqData))
      break;

      default:
      break;
  }

};


wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    let body = '';
    body += data;
    
    const req = JSON.parse(body);
    
    const reqCommand = req.type;
    const reqData = req.data;

    let res = req;
    let resData: any = {};
    let userId: number | undefined;
    let userWs: WebSocket | undefined;

    let resNewGameRooms = updateRooms();

    console.log(`type-${reqCommand}: ${reqData}`);
    
    switch (reqCommand) {
      case 'single_play':

        res.type = 'create_game';

        const newGameId = newGame();

        userId = getSessionUser(ws);
        let resNewGameData = newGameUser(newGameId, userId);
        res.data = JSON.stringify(resNewGameData);
        ws.send(JSON.stringify(res));

        const newBotId = addNewBot().index;
        resNewGameData = newGameUser(newGameId, newBotId);
        res.data = JSON.stringify(resNewGameData);
        userWs = getUserSession(newBotId);
        if (userWs) {
          userWs.send(JSON.stringify(res));
        }

        //!! remove userId room 
        res.type = 'update_room';
        
        resNewGameRooms = updateRooms();
        res.data = JSON.stringify(resNewGameRooms);

        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(res));
          }
        });

        break

      case 'reg':

        resData = userLogin(JSON.parse(reqData), ws);
        res.data = JSON.stringify(resData);
        ws.send(JSON.stringify(res));
        
        if (!resData.error) {
          res.type = 'update_room';
          resNewGameRooms = updateRooms();
          res.data = JSON.stringify(resNewGameRooms);
          ws.send(JSON.stringify(res));

          res.type = 'update_winners';
          res.data = JSON.stringify(getWinners());
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(res));
            }
          });

        }

        break;

      case 'create_room':

        userId = getSessionUser(ws);
        
        resData = newRoom(userId);

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
        const addUser = getSessionUser(ws);

        const currentRoomUsers = addUserToRoom(addRoom.indexRoom, addUser);

        console.log('currentRoomUsers: ', currentRoomUsers);
        
        if (currentRoomUsers.length == 2) {

          const newGameId = newGame();

          res.type = 'create_game';
        
          userWs = getUserSession(currentRoomUsers[0]);
          let resNewGameData = newGameUser(newGameId, currentRoomUsers[0]);
          res.data = JSON.stringify(resNewGameData);
          if (userWs) {
            userWs.send(JSON.stringify(res));
            console.log('create_game res: ',  res);
          }

          userWs = getUserSession(currentRoomUsers[1]);
          resNewGameData = newGameUser(newGameId, currentRoomUsers[1]);
          res.data = JSON.stringify(resNewGameData);
          if (userWs) {
            userWs.send(JSON.stringify(res));
            console.log('create_game res: ',  res);
          }


          res.type = 'update_room';
          
          resNewGameRooms = updateRooms();
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

        //console.log('resSetShips: ',resSetShips);

        if (resSetShips.init == 2) {

          res.type = 'start_game';

          const newGamePartnerData = getGamePartnerData(addShipsData.gameId, addShipsData.indexPlayer);
          const newGameCurrentUserData = getGamePartnerData(addShipsData.gameId, newGamePartnerData.currentPlayerIndex);

          res.data = JSON.stringify(newGameCurrentUserData);
          ws.send(JSON.stringify(res));

          userId = newGamePartnerData.currentPlayerIndex;
          res.data = JSON.stringify(newGamePartnerData);
          if (userId) {
            userWs = getUserSession(userId);
            if (userWs) {
              userWs.send(JSON.stringify(res));
            }
          }

          startGame(addShipsData.gameId);

          res.type = 'turn';
          
          setTurnUserId(addShipsData.gameId, addShipsData.indexPlayer)
          const turnPlayerId: any = {
            currentPlayer: addShipsData.indexPlayer
          };
          res.data = JSON.stringify(turnPlayerId);

          if (userWs) {
            userWs.send(JSON.stringify(res));
          }
          ws.send(JSON.stringify(res));

        } 

        break;

      case 'attack':          

        console.log('attack');
    
        const attackData = JSON.parse(reqData);

        if (attackData.indexPlayer != getTurnUserId(attackData.gameId)) {
          return;
        }

        const resultAttack = attackResponse(attackData);
        const resAttackData = resultAttack.resData;
        const attackedPlayerId = resultAttack.partnerId;

        console.log('AttackData: ', attackData);

        res.data = JSON.stringify(resAttackData);

        ws.send(JSON.stringify(res));

        userWs = getUserSession(attackedPlayerId);
        if (userWs) {
          userWs.send(JSON.stringify(res));
        }


        if (resAttackData.status == 'miss') {

          res.type = 'turn';
          
          setTurnUserId(attackData.gameId, attackedPlayerId)
          
          res.data = JSON.stringify({currentPlayer: attackedPlayerId});
          ws.send(JSON.stringify(res));

          userWs = getUserSession(attackedPlayerId);
          if (userWs) {
            userWs.send(JSON.stringify(res));
          }

        } else {
          if (resAttackData.status == 'killed') {
            
            const aroundCells = resultAttack.aroundCells;
            for (let index = 0; index < aroundCells.length; index++) {
              
              const item = aroundCells[index];
              res.data = JSON.stringify(item);

              ws.send(JSON.stringify(res));

              userWs = getUserSession(attackedPlayerId);
              if (userWs) {
                userWs.send(JSON.stringify(res));
              }
        
            }

            const finish = resultAttack.finish
            if (finish) {
              res.type = 'finish';
              res.data = JSON.stringify({winPlayer: attackData.indexPlayer});
  
              ws.send(JSON.stringify(res));

              userWs = getUserSession(attackedPlayerId);
              if (userWs) {
                userWs.send(JSON.stringify(res));
              }

              addUserWin(attackData.indexPlayer);

              res.type = 'update_winners';
              res.data = JSON.stringify(getWinners());
              wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(res));
                }
              });


            }
            
          }
        }

        break;
        
      default:
        break;
    }
  
  });
});