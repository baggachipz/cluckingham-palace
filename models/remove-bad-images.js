/**
 * This script reads a directory, and ensures that the jpg files can be read and that they
 * are not duplicates of other images (via checksum). In either error case, the image is
 * deleted from the folder. The result should be a collection of images that can be used
 * by the tensorflow retrain script without issue.
 */

const fs = require('fs'),
  jpeg = require('jpeg-js'),
  path = require('path'),
  md5File = require('md5-file')

const DATA_FOLDER = path.resolve(__dirname, process.argv[2]);

if (process.argv.length !== 3) throw new Error('incorrect arguments: node remove-bad-images.js <DATA_FOLDER> ');
  
const files = fs.readdirSync(DATA_FOLDER)
let checksums = []

for (let file of files) {
  try {
    jpeg.decode(fs.readFileSync(`${DATA_FOLDER}/${file}`))
    const hash = md5File.sync(`${DATA_FOLDER}/${file}`)
    if (checksums.includes(hash)) throw 'duplicate file'
    checksums.push(hash)
  } catch (e) {
    fs.unlinkSync(`${DATA_FOLDER}/${file}`)
    console.log(`deleted ${file}`)
  }
}