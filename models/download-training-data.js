const fs = require('fs'),
  fetch = require('node-fetch'),
  path = require('path')


const TRAINING_DATA_ROOT = '../models/training_data'
const TRAINING_DATA_TYPE = process.argv[2];
const TRAINING_DATA_URL = process.argv[3];
const TRAINING_DATA_OUTPUT_DIR = path.resolve(__dirname, TRAINING_DATA_ROOT, TRAINING_DATA_TYPE);

if (process.argv.length !== 4) throw new Error('incorrect arguments: node download-training-data.js <TRAINING_DATA_TYPE> <TRAINING_DATA_URL>');

fetch(TRAINING_DATA_URL)
  .then(res => {
    if (!fs.existsSync(TRAINING_DATA_OUTPUT_DIR)) {
      fs.mkdirSync(TRAINING_DATA_OUTPUT_DIR)
    }
    return res
  })
  .then(res => res.text())
  .then(body => {
    const imgSrc = body.split('\n');
    if (imgSrc && imgSrc.length) {
      return imgSrc.filter(el => {
        return el.length && el.trim() !== ''
      })
    } else {
      throw 'No Image urls found in source url.'
    }
  })
  .then(imgArray => {
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;
      for (let img of imgArray) {
        fetch(img, {timeout: 5000})
          .then(res => {
            processedCount++
            if (res.ok) {
              const filename = path.basename(img).trim()
              const dest = fs.createWriteStream(`${TRAINING_DATA_OUTPUT_DIR}/${filename}`);
              res.body.pipe(dest)
              successCount++
            } else {
              console.error(res.statusText)
              errorCount++
            }
          })
          .catch(err => {
            console.error(err.code)
            processedCount++
            errorCount++
          })
          .finally(() => {
            console.log(processedCount, imgArray.length);
            if (processedCount >= imgArray.length) {
              console.debug(`${successCount} success, ${errorCount} errors.`)
              process.exit()
            }
          })
      }
    }
  )
  
