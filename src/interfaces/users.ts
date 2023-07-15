import { WebSocket } from 'ws';
import {addUserSession, getSessionUser, getUserSession} from './user_session';

export interface InternalUser {
    userId: number;
    name: string;
    password: string;
}

export const users = new Map<number, InternalUser>();
let usersId = 0;
export const botName = 'Bot';
export const botPass = '';
let rootBotId = -1;

export interface User  {
    name: string;
    password: string;
}

export interface ResponseUser  {
    name: string;
    index: number;
    error: boolean; 
    errorText: string; 
}

export const setRootBotId = function () {

    for (let [key, value] of users) {
        if (value.name === botName) {
            rootBotId = key;
        }
    }

    console.log('rootBotId: ', rootBotId)

}

export const addNewBot = function () {

    usersId++;
    const botId = usersId;

    const resUser: ResponseUser = {
        name: 'Bot',
        index: botId,
        error: false, 
        errorText: '' 
    };

    users.set(usersId, {
        userId: usersId,
        name: botName,
        password: botPass
    });

    const ws = getUserSession(rootBotId);

    if (ws) {
        addUserSession(botId, ws);
    }

    return resUser;

}

export const userLogin = function (user: User, ws: WebSocket) {

    user.name = user.name.trim();
    user.password = user.password.trim();

    let resUser: ResponseUser = {
        name: user.name,
        index: -1,
        error: false, 
        errorText: '' 
    };

    try {

        let currentUser: InternalUser | undefined;

        for (let item of users.values()) {
            if (item.name == user.name) {
                currentUser = item;
            }
        }
        
        if (currentUser) {

            const userPassword = currentUser.password;

            if (userPassword == user.password) {
                
                const userWs = getUserSession(currentUser.userId);
                if (userWs) {
                    if (userWs.readyState === WebSocket.OPEN) {
                        resUser.error = true;
                        resUser.errorText = 'Open session exists! Please, use or close it.';
                    } else {
                        resUser.index = currentUser.userId;
                        addUserSession(resUser.index, ws);
                    }

                } else {
                    resUser.index = currentUser.userId;
                    addUserSession(resUser.index, ws);
                }

            } else {
                resUser.error = true;
                resUser.errorText = 'Invalid password or enter another name';
            }
    
        } else {

            usersId++;

            users.set(usersId, {
                userId: usersId,
                name: user.name,
                password: user.password
            });
            resUser.index = usersId;

            addUserSession(usersId, ws);
        }
    
        return resUser;
            
    } catch (error) {
        if (error instanceof Error) {
            resUser.error = true;
            resUser.errorText = error.message;
        }

        return resUser;
    }
    
};

