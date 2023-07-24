# bswss
Backend implementation of the battleship  frontend using nodejs web sockets  

The backend implements the following logic:

  - Start websocket server
  - Handle websocket connection
  - Handle player requests
  - Handle room requests
  - Handle ships requests
  - Handle game requests
  - Single play bot
    - One websocket connection for all bots
    - A simple algorithm is used to select a random cell from the remaining cells
    - Bots are created with the same name 'Bot' but different id's.
    - Interaction with the bot is logged in consol.log

Installation:

  - Battleship frontend is installed separately
  
  - Clone/download repo
  
  - npm install

  - Create the .env file and set the SERVER_PORT value or 3000 by default will use.

  - Run: npm run start:dev. The server will compile and run using nodemon.
 
