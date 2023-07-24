import { users } from './users'

interface UserScore {
    name: string;
    wins: number;
}

const winnersTables: Array<UserScore> = [];
    
export const addUserWin = function (userId: number) {

    let regUser: any = users.get(userId);

    let winIndx = winnersTables.findIndex((item) => item.name === regUser?.name);
    if (winIndx >= 0) {
        winnersTables[winIndx].wins ++;
    } else {
        winnersTables.push({ name: regUser.name, wins: 1 });
    }
}

export const getWinners = function () {

    return winnersTables;
}
