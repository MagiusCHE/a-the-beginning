const cellProto = require('./cell')
const cell = require('./cell')

module.exports = function(initialcells) {
    const cells = []
    const $this = {
        live_cycle_index: 0
        , life_cycles: 0
        , deathsxcycle: 0
        , bhirthsxcycle: 0
        , deadbymutagen: 0
        , deadbyage: 0
        , huntedxcycle: 0
        , dead4food: 0
        , totalAmbientSustain: 10000
        , ambientSustainxDay: 10
        , live: async function() {
            $this.live_cycle_index = 0
            $this.deathsxcycle = 0
            $this.bhirthsxcycle = 0
            $this.deadbymutagen = 0
            $this.deadbyage = 0
            $this.huntedxcycle = 0
            $this.dead4food = 0
            console.log('World: Begin cycle %s, Cells: %s', $this.life_cycles, cells.length)
            while ($this.live_cycle_index < cells.length) {
                await cells[$this.live_cycle_index].live()
                $this.live_cycle_index++;
            }
            console.log('World: End cycle %s, Cells: %s. Deaths: %s, Births: %s, Resources: %s', $this.life_cycles, cells.length, $this.deathsxcycle, $this.bhirthsxcycle, $this.totalAmbientSustain)
            console.log(' Dead by Mutagen: %s', $this.deadbymutagen)
            console.log(' Dead by age: %s', $this.deadbyage)
            console.log(' Dead by hunt: %s', $this.huntedxcycle)
            console.log(' Dead for food: %s', $this.dead4food)
            if (cells.length > 0) {
                console.log('Random cell: %s', JSON.stringify(cells[0].getInfo(), undefined, 2))
            }
            $this.life_cycles++
            $this.totalAmbientSustain += $this.ambientSustainxDay
        }
        , createCell: function() {
            $this.bhirthsxcycle++
            const cell = cellProto($this)
            cells.push(cell)
            //console.log('Cell %s is born.', cell.id)
            return cell
        }
        , cellsCount: function() {
            return cells.length
        }
        , removeCell: function(cell) {
            const idx = cells.indexOf(cell)

            cells.splice(idx, 1)

            if (idx < $this.live_cycle_index) {
                $this.live_cycle_index--
            }
            $this.deathsxcycle++
        }
        , getPray: function(hunter) {
            let i = 0
            while (cells[i] == hunter && i < cells.length) {
                i++
            }
            if (i < cells.length) {
                return cells[i]
            }
        }
        , consumeResources: function(sustain) {
            if (sustain > $this.totalAmbientSustain) {
                sustain = $this.totalAmbientSustain
            }
            $this.totalAmbientSustain -= sustain
            return sustain
        }
        , addResources: function(sustain) {
            $this.totalAmbientSustain += sustain
        }
        , addHunted: function() {
            $this.huntedxcycle++
        }
        , addElder: function() {
            $this.deadbyage++
        }
        , addDead4Mutations: function() {
            $this.deadbymutagen++
        }
        , addDead4Food: function() {
            $this.dead4food++;
        }
    }
    while (cells.length < initialcells) {
        const cell = $this.createCell()
        cell.godCreation()
    }
    return $this
}