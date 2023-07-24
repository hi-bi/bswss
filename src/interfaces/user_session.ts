import { WebSocket } from 'ws';

const users_session = new Map<number, WebSocket>();

export const addUserSession = function (user: number, ws: WebSocket) {
    
    let currentSession: WebSocket | undefined;
    
    currentSession = users_session.get(user);

    users_session.set(user, ws);

}

export const getUserSession = function (user: number): WebSocket|undefined {
    
    let currentSession: WebSocket | undefined;
    
    currentSession = users_session.get(user);

    return currentSession; 
}

export const getSessionUser = function (ws: WebSocket): number|undefined {
    
    let currentUser: number | undefined;

    for (let [key, value] of users_session) {
        if (value == ws) {
            currentUser = key;
        }
    }
    
    return currentUser; 
}

export const deleteUserSession = function ( userId: number) {
    users_session.delete(userId);
}
