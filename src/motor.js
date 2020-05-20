const raspi = require('raspi-io').RaspiIO
const five = require('johnny-five')
const board = new five.Board({
  io: new raspi()
})

const MOTOR_TIME = 3000 // # of ms to run the motor for in either direction
const MOTOR_SPEED = 255 // 0-255, for speed


const motor = new five.Motor({
  pins: {
    pwm: 1,
    dir: 4
  },
  invertPWM: true
})

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
        motor.forward(MOTOR_SPEED)
        board.wait(MOTOR_TIME, function() {
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
        motor.reverse(MOTOR_SPEED)
        board.wait(MOTOR_TIME, function() {
          motor.stop()
          resolve(true)
        })
      } catch (e) {
        reject(e.message)
      }
    })
  }
}
