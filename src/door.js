const motor = require('./motor')
const state = require('./state')

const Door = {
  getStatus: (req, res) => {
    res.json(state.get('door'))
  },
  setStatus: (req, res) => {
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
  getMotor: (req, res) => {
    res.json({
      speed: state.get('motor-speed'),
      time: state.get('motor-time')
    })
  },
  setMotor: (req, res) => {
    const motorTime = parseInt(req.body.time)
    const motorSpeed = parseInt(req.body.speed)

    if (isNaN(motorTime) && isNaN(motorSpeed)) {
      return res.status(400).json(`Time and Speed ${req.body.time}, ${req.body.speed} is not valid.`)
    }

    if (!isNaN(motorTime)) {
      state.set('motor-time', motorTime)
    }
    if (!isNaN(motorSpeed)) {
      state.set('motor-speed', motorSpeed)
    }
    state.save()
    return Door.getMotor(req, res)
  },
  runAction: async (req, res) => {
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
  }
}

module.exports = Door
