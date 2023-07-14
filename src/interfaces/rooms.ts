    import { users } from "./users";

    interface RoomUsers {
        name: string;
        index: number
    }

    interface Room {
        roomId: number;
        roomUsers: RoomUsers[];
    }

    let roomsId: number = 0;
    const rooms: Room[] = [];

    export const newRoom = function (userId: any) {

        const rmItem = rooms.findIndex((item) => item.roomUsers[0].index === userId);
        if (rmItem >= 0) {
            return;
        }

        const currentUser: any = users.get(userId);

        roomsId++;

        const room: Room = {
            roomId: roomsId,
            roomUsers: [{name: currentUser.name, index: userId}]
        }

        rooms.push(room);
        
        return rooms;
    };

    export const addUserToRoom = function (roomId: any, userId: any) {

        const currentUser: any = users.get(userId);

        const currentRoomUsers: any = [];
        const currentRoom = rooms.filter(item => item.roomId == roomId);

        if (currentRoom.length > 0 && currentRoom[0].roomUsers[0].index != userId) {

            currentRoomUsers.push(currentRoom[0].roomUsers[0].index);
            currentRoomUsers.push(userId);
            
            currentRoom[0].roomUsers.push({name: currentUser.name, index: userId})


            let roomUser = userId
            let rmItem = rooms.findIndex((item) => item.roomUsers.length === 1 && item.roomUsers[0].index === roomUser);
            while (rmItem >= 0) {
                rooms.splice(rmItem, 1);
                rmItem = rooms.findIndex((item) => item.roomUsers.length === 1 && item.roomUsers[0].index === roomUser);
            }
        
        };

        return currentRoomUsers;
    };

    export const updateRooms = function () {

        let rmItem = rooms.findIndex((item) => item.roomUsers.length === 2);
        while (rmItem >= 0) {
            rooms.splice(rmItem, 1);
            
            rmItem = rooms.findIndex((item) => item.roomUsers.length === 2);
        }

        return rooms;
    };