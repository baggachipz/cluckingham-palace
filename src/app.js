const express = require('express')
const path = require('path')
const door = require('./door')

const PORT = process.env.PORT || '3000'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// functional routes
app.post('/api/door', door.runAction)
app.get('/api/door/status', door.getStatus)
app.put('/api/door/status', door.setStatus)
app.get('/api/door/automatic', door.getAutomatic)
app.put('/api/door/automatic', door.setAutomatic)
app.get('/api/door/motor', door.getMotor)
app.put('/api/door/motor', door.setMotor)

// route everything else to the client assets
app.use('/', express.static(path.join(__dirname, 'public/spa')))
app.use('/*', express.static(path.join(__dirname, 'public/spa')))

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`)
})
