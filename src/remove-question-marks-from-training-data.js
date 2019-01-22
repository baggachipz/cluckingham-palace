/**
 * Temporary hack script to fix bad file names during download of training data images.
 * Should not be necessary since the fix to download-training-data.js.
 */
const fs = require('fs'),
  path = require('path')

const DATA_FOLDER = path.resolve(__dirname, process.argv[2]);

if (process.argv.length !== 3) throw new Error('incorrect arguments: node remove-question-marks-from-training-data.js <DATA_FOLDER> ');

const files = fs.readdirSync(DATA_FOLDER)
// const file = files[2]
let cnt = 0;

for (let file of files) {
  fs.renameSync(`${DATA_FOLDER}/${file}`, DATA_FOLDER + '/' + file.trim())
}
