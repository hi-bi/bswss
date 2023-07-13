export const users = new Map();
let usersId = 0;

export const userLogin = function (user) {

    user.name = user.name.trim();
    user.password = user.password.trim();

    let resUser = {
        name: user.name, 
        index: -1, 
        error: false, 
        errorText: '' 
    };

    try {

        let currentUser;

        for (let item of users.values()) {
            if (item.name == user.name) {
                currentUser = item;
            }
        }
      
        if (currentUser) {

            const userPassword = currentUser.password;

            if (userPassword == user.password) {
                resUser.index = currentUser.userId;

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

        }
    
        console.log(users);

        return resUser;
            
    } catch (error) {
        resUser.error = true;
        resUser.errorText = error.message;

        return resUser;
    }
    
};

