const motor = require('./motor')
const state = require('./state')

module.exports = {
  getStatus: (req, res) => {
    res.json(state.get('door'))
  },
  setStatus: async (req, res) => {
    let newStatus
    switch (req.body.status) {
      case 'open':
        newStatus = 1
        break
      case 'closed':
        newStatus = 0
        break
      default:
        return res.status(400).json(`Status ${req.body.status} is not allowed.`)
    }
    try {
      state.set('door', newStatus).save()
      res.json(state.get('door'))
    } catch (e) {
      res.status(500).json(e.message)
    }
  },
  runAction: (req, res) => {
    switch(req.body.action) {
      case 'open':
        return this.open(req, res)
      case 'close':
        return this.close(req, res)
      default:
        res.status(400).json(`Action ${req.body.action} is not allowed.`)
    }
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
  },
  
  setOpen: async (req, res) => {
    try {
      state.set('door', 1).save()
      res.json(state.get('door'))
    } catch (e) {
      res.status(500).json(e.message)
    }
  },
  setClosed: async (req, res) => {
    try {
      state.set('door', 0).save()
      res.json(state.get('door'))
    } catch (e) {
      res.status(500).json(e.message)
    }
  }
}
