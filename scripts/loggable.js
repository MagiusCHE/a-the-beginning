(async () => {
    class Loggable {
        constructor() {
        }
        log() {
            const margs = Array.from(arguments)
            margs.unshift(`${this.getLogName()}`)
            core.log.apply(core, margs)
        }
        logError() {
            const margs = Array.from(arguments)
            margs.unshift(`${this.getLogName()}`)
            core.logError.apply(core, margs)
        }
        getLogName() {
            return `${this.constructor.name}`
        }
    }
    core.registerClass(Loggable)
})()
