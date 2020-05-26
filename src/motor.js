const raspi = require('raspi-io').RaspiIO
const five = require('johnny-five')
const board = new five.Board({
  io: new raspi()
})
const state = require('./state')

const motor = new five.Motor(state.get('motor'))

board.on('ready', function () {
  
  board.repl.inject({ motor })

  motor.on('start', function() {
    console.log('motor start', Date.now())
  });

  motor.on('stop', function() {
    console.log('motor stop', Date.now());
  });

})

module.exports = {
  openDoor: function () {
    return new Promise((resolve, reject) => {
      try {
        console.log('starting door open')
        motor.forward(state.get('motor-speed'))
        board.wait(state.get('motor-time'), function() {
          motor.stop()
          console.log('stop door open')
          resolve(true)
        })
      } catch (e) {
        reject(e)
      }
    })
  },
  closeDoor: function () {
    return new Promise((resolve, reject) => {
      try {
        motor.reverse(state.get('motor-speed'))
        board.wait(state.get('motor-time'), function() {
          motor.stop()
          resolve(true)
        })
      } catch (e) {
        reject(e.message)
      }
    })
  }
}
