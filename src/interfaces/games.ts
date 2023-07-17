    import {initField} from './fields';
    import { isBot } from './users';
    import { deleteUserSession } from './user_session';

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

    export const deleteGame = function (userId: number) {

        const gameId = getUserGame(userId);
        
        const currentGame = games.get(gameId);

        if (currentGame) {
            for (let item of currentGame.boards.values()) {
                if (isBot(item.indexPlayer)) {
                    deleteUserSession(item.indexPlayer);
                }
            } 
        }

        games.delete(gameId);
    }

    export const newGameUser = function (gameId: any, userId: any) {

        const boards = games.get(gameId).boards;

        boards.set( userId,
            {
                gameId: gameId,
                turnUserId: 0,
                ships: [],
                indexPlayer: userId,
            }
        );

        return {idGame: gameId, idPlayer: userId};
    };

    export const setShips = function (data: any) {

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

    export const setTurnUserId = function (gameId: any, userId: any) {

        const currentGame = games.get(gameId);
        currentGame.turnUserId = userId;
    };

    export const getTurnUserId = function (gameId: any) {

        const currentGame = games.get(gameId);
        return currentGame.turnUserId;
    };

    export const getUserGame = function (userId: any) {

        let gameId = -1;
        for (let [key, value] of games) {
            for (let [key1, value1] of value.boards) {

                if (value1.indexPlayer == userId) {
                    gameId = value1.gameId;
                    return gameId;
                }
            }
        }

        return gameId;
    }


    export const getGamePartnerData = function (gameId: any, userId: any) {

        const currentGame = games.get(gameId);
        let gamePartnerData: any = {};

        for (let item of currentGame.boards.values()) {
            if (item.indexPlayer != userId) {
                gamePartnerData.ships = item.ships;
                gamePartnerData.currentPlayerIndex = item.indexPlayer;
            }
        } 

        return gamePartnerData;
    };

    export const startGame = function (gameId: any) {
        
        const currentGame = games.get(gameId);

        for (let item of currentGame.boards.values()) {
            item.fld = initField(item.ships);
            
        }

    };

    export const attackResponse = function (attackData: any) {

        const currentGame = games.get(attackData.gameId);

        let finish = true;
        let partnerId = 0;
        let currentBoard: any = {};
        for (let item of currentGame.boards.values()) {
            if (item.indexPlayer != attackData.indexPlayer) {
                partnerId = item.indexPlayer;
                currentBoard = item;
            }
        } 

        const indexCell = attackData.x * 10 + attackData.y;

        let currentCell = currentBoard.fld.get(indexCell);

        const aroundCells = [];

        if (currentCell.isShip) {
            currentCell.attack ++;
            
            const attackedShip = currentCell.ship;
            attackedShip.attack ++;

            if (attackedShip.attack < attackedShip.length) {
                currentCell.status = 'shot';
            } else {
                currentCell.status = 'killed';

                let aX = attackedShip.position.x - 1;
                let aY = attackedShip.position.y - 1;

                let dx = -1;
                let dy = -1;

                for (let k = 0; k < 3; k++) {

                    if (!attackedShip.direction) {
                        dx = 1; 
                        dy = 0;
                    } else {
                        dx = 0; 
                        dy = 1;
                    }
            
                    for (let index = 0; index < attackedShip.length+2; index++) {

                        if (((aX >= 0 && aX <= 9 && aY >= 0 && aY <= 9) && (k == 0 || k == 2))
                            || ((aX >= 0 && aX <= 9 && aY >= 0 && aY <= 9) && k == 1 && (index == 0 || index == attackedShip.length+1))) {

                            currentBoard.fld.set(aX*10 + aY, {
                                attack: 1,
                                status: 'miss'
                            })
                        
                            const missCell = {
                                position:{
                                    x: aX,
                                    y: aY
                                },
                                currentPlayer: attackData.indexPlayer,
                                status: 'miss'
                            }

                            aroundCells.push(missCell);
                        } else {
                            if ( (aX >= 0 && aX <= 9 && aY >= 0 && aY <= 9) && k == 1 && (index > 0 || index < attackedShip.length+1) ) {
                                currentBoard.fld.set(aX*10 + aY, {
                                    attack: 1,
                                    status: 'killed'
                                });

                                const killedCell = {
                                    position:{
                                        x: aX,
                                        y: aY
                                    },
                                    currentPlayer: attackData.indexPlayer,
                                    status: 'killed'
                                }

                                aroundCells.push(killedCell);
                            }
                        }
            
                        aX = aX + dx;
                        aY = aY + dy;
                    }
        
                    if (!attackedShip.direction) {
                        aX = attackedShip.position.x - 1;
                        aY ++; 
                    } else {
                        aX ++; 
                        aY = attackedShip.position.y - 1;
                    }

                } 

                for (let item of currentBoard.fld.values()) {
                    if (item.isShip && item.status == '') {
                        finish = false;
                    }
                }
                
            }

        } else {
            currentCell.attack ++;
            currentCell.status = 'miss';
        };
        
        const resData = {
            position: {
                x: attackData.x,
                y: attackData.y,
            },
            currentPlayer: attackData.indexPlayer,
            status: currentCell.status,
        };
        
        return {resData, partnerId, aroundCells, finish};
    };

    export const getRandomAttack = function (gameId: number, userId: number) {

        let fld;
        let position = { "x": 0, "y": 0};

        const currentGame = games.get(gameId);
        for (let item of currentGame.boards.values()) {
            if (item.indexPlayer != userId) {
                fld = item.fld;
            }
        } 
        
        if (fld) {
            let count = Math.round( Math.random() * 100);
            if (count == 0) {
                count ++;
            }
            
            let gi = 0;
            let item = -1;
            let cell: any;

            for (let i = 0; i < count; i++) {

                item ++;
                gi ++
                if (item > 99) {
                    item = 0;
                }
                
                cell = fld.get(item);
                while (cell.status === 'miss' || cell.status === 'killed' || cell.status === 'shot' || cell.attack > 0) {
                    item ++;
                    gi ++;
                    if (item > 99) {
                        item = 0;
                    }
                    cell = fld.get(item);
                    if (gi > 10000) {
                        return position;
                    }
                }
                
            }
            
            position.x = Math.floor(item / 10);
            position.y = item % 10;
        }

        return position;
    }

