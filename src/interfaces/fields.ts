export const initField = function (ships: any) {

    const fld = new Map();
    let dx = 0;
    for (let x = 0; x < 10; x++) {
        dx = x*10;

        for (let y = 0; y < 10; y++) {

            fld.set(dx+y, {
                attack: 0,
                status: '',
                isShip: false,
                ship: {},
            })
        }
    }

    for (let item = 0; item < ships.length; item++) {

        const ship = ships[item];
        ship.attack = 0;

        let strtX = ship.position.x;
        let strtY = ship.position.y;

        let dx = -1;
        let dy = -1;

        if (!ship.direction) {
            dx = 1; 
            dy = 0;
        } else {
            dx = 0; 
            dy = 1;
        }

        for (let index = 0; index < ship.length; index++) {

            fld.set(strtX*10 + strtY, {
                attack: 0,
                status: '',
                isShip: true,
                ship: ship
            })

            strtX = strtX + dx;
            strtY = strtY + dy;
        }
        
    }

    return fld;
};
