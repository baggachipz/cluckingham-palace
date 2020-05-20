const motor = require('./motor')
const state = require('./state')

module.exports = {
  status: (req, res) => {
    res.json(state.get('door'))
  },
  open: async (req, res) => {
    try {
      if (!state.get('door')) {
        await motor.openDoor()
        state.set('door', 1).save()
      }
      res.json(state.get('door'))
    } catch (e) {
      console.log(`Unable to open door: ${e.message}`)
      res.status(500).json(e.message)
    }
  },
  close: async (req, res) => {
    try {
      if (!!state.get('door')) {
        await motor.closeDoor()
        state.set('door', 0).save()
      }
      res.json(state.get('door'))
    } catch (e) {
      console.log(`Unable to close door: ${e.message}`)
      res.status(500).json(e.message)
    }
  }
}
