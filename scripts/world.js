(async () => {
    //await waitFor(() => core.boolEval('classes.Loggable'))

    class World extends (await core.requireClass('Loggable')) {
        constructor() {
            super()
            this.log('created')
        }
    }
    core.registerClass(World)    
})()