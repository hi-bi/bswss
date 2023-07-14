import { WebSocket } from 'ws';
import {addUserSession, getSessionUser, getUserSession} from './user_session';

export interface InternalUser {
    userId: number;
    name: string;
    password: string;
}

export const users = new Map<number, InternalUser>();
let usersId = 0;

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

