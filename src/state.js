const fs = require('fs')
const path = require('path')

const FILE_NAME = './state.json'

class State {
  constructor () {
    this.data = {}
  }
  
  load () {
    try {
      this.data = require(FILE_NAME)
    } catch (e) {
      this.data = {
        "door": 0
      }
    }
    return this
  }

  async save () {
    fs.writeFileSync(path.resolve(__dirname, FILE_NAME), JSON.stringify(this.data))
    return this
  }

  get(name, defaultValue) {
    return typeof(this.data[name]) === 'undefined' ? defaultValue : this.data[name]
  }

  set(name, val) {
    this.data[name] = val
    return this
  }
}

const instance = new State()

module.exports = instance.load()
