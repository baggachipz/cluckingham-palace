const Raspi = require('raspi-io');
const five = require('johnny-five');
const board = new five.Board({
  io: new Raspi({
    enableSoftPwm: true
  })
});

board.on("ready", () => {
  //const motor = new five.Motor({
  //  pins: {
  //    pwm: 'GPIO23',
  //    dir: 'GPIO24',
  //    cdir: 'GPIO25'
  //  }
  //});
  const motor = new five.Motor(['GPIO23', 'GPIO24']);

  board.repl.inject({
    motor: motor
  });

  motor.on("start", function() {
    console.log("start", Date.now());
  });

  motor.on("stop", function() {
    console.log("automated stop on timer", Date.now());
  });

  motor.on("forward", function() {
    console.log("forward", Date.now());

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, function() {
      motor.reverse(100);
    });
  });

  motor.on("reverse", function() {
    console.log("reverse", Date.now());

    // demonstrate stopping after 5 seconds
    board.wait(5000, function() {
      motor.stop();
    });
  });

  // set the motor going forward full speed
  //motor.disable(); 
  motor.forward(50);
  //motor.enable();
});

