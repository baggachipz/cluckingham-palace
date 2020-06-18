const motor = require('./motor')
const state = require('./state')

const publicip = require('public-ip')
const geoip = require('geoip-lite')
const { getSunrise, getSunset } = require('sunrise-sunset-js')

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
  getAutomatic: (req, res) => {
    return res.json(state.get('automatic', 0))
  },
  setAutomatic: (req, res) => {
    if (!isNan(parseInt(req.body.automatic))) {
      state.set('automatic', parseInt(req.body.automatic)).save()
      autodoor()
      return Door.getAutomatic(req, res)
    } else {
      return res.status(400).json(`Auto-door interval ${req.body.automatic} is not valid`)
    }
  },
  runAction: async (req, res) => {
    switch(req.body.action) {
      case 'open':
        return Door.open(req, res)
      case 'close':
        return Door.close(req, res)
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

async function autodoor() {
  const timeout = state.get('automatic', 0)
  if (timeout) {
    const ip = await getIp()
    const latlon = await getLatLon(ip)
    const door = state.get('door', -1)

    if (door >= 0) {
      const sunrise = getSunrise(...latlon)
      const sunset = getSunset(...latlon)
      const now = Date.now()

      if (now >= sunrise && now < sunset && door === 0) {
        Door.open()
      }

      if (now >= sunset && door === 1) {
        Door.close()
      }

    }
    setTimeout(autodoor, timeout)
  }
}

async function getIp() {
  const ip = state.get('ip', false)
  if (ip !== false) return ip
  const newip = await publicip.v4()
  state.set('ip', newip).save()
  return newip
}

function getLatLon(ip) {
  const latlon = state.get('latlon', false)
  if (latlon !== false) return latlon
  const geo = geoip.lookup(ip)
  state.set('latlon', geo.ll).save()
  return geo.ll
}

// initiate the autodoor on load
autodoor()

module.exports = Door
