export const users = [];

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
        console.log(user);

        const isName = users.filter(item => item.name == user.name);
        
        if (isName.length > 0) {

            const isPassword = users.filter(item => item.name == user.name  && item.password == user.password);

            if (isPassword.length > 0) {
                resUser.index = users.findIndex((item) => item.name == user.name);

            } else {
                resUser.error = true;
                resUser.errorText = 'Invalid password or enter another name';
            }
    
        } else {

            users.push(user);
            resUser.index = users.findIndex((item) => item.name == user.name);

        }
    
        console.log(users);

        return resUser;
            
    } catch (error) {
        resUser.error = true;
        resUser.errorText = error.message;

        return resUser;
    }
    
};

