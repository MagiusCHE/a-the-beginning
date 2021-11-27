const world = require('./world')(100)

    ;
(async function() {
    while (true && world.cellsCount() > 0 /*&& world.life_cycles < 100*/) {
        await world.live()
    }
})()