const express = require('express')
const path = require('path')
const door = require('./door')

const PORT = process.env.PORT || '3000'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// functional routes
app.get('/api/door', door.status)
app.get('/api/door/open', door.open)
app.get('/api/door/close', door.close)

// route everything else to the client assets
app.use('/', express.static(path.join(__dirname, 'public/spa')))
app.use('/*', express.static(path.join(__dirname, 'public/spa')))

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`)
})
