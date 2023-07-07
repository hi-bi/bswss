
let gamesId = 0;
const games = new Map();

export const newGame = function () {

    gamesId++;
    games.set(gamesId, {
        boards: new Map(),
        init: 0
    })

    return gamesId;
};

export const newGameUser = function (gameId, userId) {

    const boards = games.get(gameId).boards;

    boards.set( userId,
        {
            gameId: gameId,
            ships: [],
            indexPlayer: userId,
        }
    );

    console.log(gamesId, games);
    
    return {idGame: gameId, idPlayer: userId};
};

export const setShips = function (data) {

    const inGameId = data.gameId;
    const inShips = data.ships;
    const inUserId = data.indexPlayer;

    const currentGame = games.get(inGameId);
    const currentBoard = currentGame.boards.get(inUserId);

    currentBoard.ships = inShips
    currentGame.init ++;

    return { 
        init: currentGame.init, 
        data: {
            ships: currentBoard.ships,
            currentPlayerIndex: inUserId
        }
    }
};

export const getGamePartnerData = function (gameId, userId) {

    const currentGame = games.get(gameId);
    let gamePartnerData = {};

    for (let item of currentGame.boards.values()) {
        if (item.indexPlayer != userId) {
            gamePartnerData.ships = item.ships;
            gamePartnerData.currentPlayerIndex = item.indexPlayer;
        }
    } 

    return gamePartnerData;
};
