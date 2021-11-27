const md5 = require("md5")

const firstCell = {
    foodRequiredToClone: 1, //food required to reproduction
    ageRequiredToClone: 3, //at with age can make children
    negativeMutationFactor: 0.1, //percentage to born with negative mutation and die.
    parentVariationFactor: 0.5, //percentage of mutation other infos!    
    foodRequiredToLive: 1, //how much food consume per day
    maxAge: 6, //how much day can live
    huntingSustainLoss: 0.3, //susytain loss for hunting
    maxSustain: 5,
    speed: 1,
    power: 1,
    defence: 1,
    sustainFromAmbient: 1 // from 0 to 1. >this value, cells cann acquire sustain from ambient, else need to hunt others cells
    , ambientSustainxDay: 3, // how maximum food can be acquired from ambient (not hunt) per day    
}

let idref = 0
const emptyids = []
module.exports = function(world) {
    const $world = world
    const $this = {
        ...firstCell, ...{
            age: 0
            , sustain: 0
            , parents: undefined
            , setParents: function(cells) {
                $this.parents = cells
                let parent
                for (const prop in firstCell) {
                    parent = cells[Math.floor(Math.random() * (cells.length - 1))]
                    $this[prop] = parent[prop] * (1 + (Math.random() * parent.parentVariationFactor - parent.parentVariationFactor * 0.5))
                    if ($this[prop] < firstCell[prop] * 0.1) {
                        $this[prop] = firstCell[prop] * 0.1
                    }
                    //console.log('  Cell %s change "%s" from %s to %s', $this.id, prop, parent[prop], $this[prop])
                }
                if ($this.ambientSustainxDay > $this.maxSustain * 4) {
                    this.ambientSustainxDay = $this.maxSustain * 4
                }
                if ($this.sustainFromAmbient > 1.0) {
                    this.sustainFromAmbient = 1.0
                }
                if ($this.parentVariationFactor > 1.0) {
                    this.parentVariationFactor = 1.0
                }
                if ($this.negativeMutationFactor > 1.0) {
                    this.negativeMutationFactor = 1.0
                }
                parent = cells[Math.floor(Math.random() * (cells.length - 1))]
                $this.sustain = parent.foodRequiredToClone * 0.9
            }
            , birth: function() {
                const mutations = Math.random() > $this.negativeMutationFactor
                if (!mutations) {
                    //console.log('  Cell %s has negative mutations.', $this.id)
                    $world.addResources($this.sustain * 0.9)
                    $world.addDead4Mutations()
                    $this.die()
                    return
                }
            }
            , die: function() {
                $this.dead = true
                emptyids.push($this.id)
                $world.removeCell($this)
                //console.log('  Cell %s is dead.', $this.id/*, JSON.stringify($this, undefined, 2)*/)
            }
            , godCreation: function() {
                //god create this cell from NOTHING
                $this.sustain = firstCell.foodRequiredToClone
            }
            , live: async function() {

                if (Math.random() <= $this.sustainFromAmbient) {
                    $this.eat()
                } else {
                    const pray = $this.hunt()
                    $this.eat(pray) //in not pray it will eat from ambient
                }
                $this.consume()
                if (!$this.dead) {
                    $this.makeChild()
                    $this.age++
                    if ($this.age > $this.maxAge) {
                        //console.log('  Cell %s is too old and die.', $this.id)
                        $world.addResources($this.sustain * 0.8)
                        $world.addElder()
                        $this.die();
                    }
                }

            }
            , hunt: function() {
                if ($this.sustain >= $this.maxSustain) {
                    return false //no need to hunt
                }
                if ($this.sustain < $this.huntingSustainLoss) {
                    return false
                }
                const pray = $world.getPray($this)
                $this.sustain -= $this.huntingSustainLoss
                if (!pray) {
                    return
                }
                const lem = $this.speed + $this.power - pray.defence - pray.speed
                const per = 0.5 - 0.5 * lem
                if (Math.random() >= per) {
                    return pray
                }
                return
            }
            , consume: function() {
                $this.sustain -= $this.foodRequiredToLive
                if ($this.sustain <= 0) {
                    //console.log('  Cell %s gone out of food and die.', $this.id)
                    $world.addDead4Food()
                    $this.die();
                }
            }
            , eat: function(pray) {
                if (pray) {
                    pray.die()
                    $world.addHunted()
                    $world.addResources(pray.sustain * 0.1)
                    $this.sustain += pray.sustain
                } else {
                    $this.sustain += $world.consumeResources(Math.random() * $this.ambientSustainxDay * $this.sustainFromAmbient)
                }
                if ($this.sustain > $this.maxSustain) {
                    $this.sustain = $this.maxSustain
                }
                //erbivori
                /*
                if ($this.sustain < $this.maxSustain) {
                    $this.sustain += Math.random() * $this.eatFactor
                    if ($this.sustain > $this.maxSustain) {
                        $this.sustain = $this.maxSustain
                    }
                }*/
                //console.log('Cell %s, eat from %s to %s', $this.id, oldsustain, $this.sustain)
            }
            , makeChild: function() {
                if ($this.age > $this.ageRequiredToClone && $this.sustain >= $this.foodRequiredToClone) {
                    //console.log('  Cell %s has enought feed and it will clone.', $this.id)
                    $this.sustain -= $this.foodRequiredToClone
                    const child = world.createCell()
                    child.setParents([$this])
                    child.birth()
                }
            }
            , getInfo: function() {
                const ret = { ...$this }
                delete ret.parents
                return ret;
            }
        }
    }
    if (emptyids.length > 0) {
        $this.id = emptyids.shift()
    } else {
        $this.id = idref
        idref++
    }
    return $this
}