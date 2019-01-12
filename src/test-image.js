/**
 * 
 * Example taken from: http://jamesthom.as/blog/2018/08/07/machine-learning-in-node-dot-js-with-tensorflow-dot-js/
 * Additional help from: https://github.com/tensorflow/tfjs/issues/740
 */

const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
require('@tensorflow/tfjs-node')

const fs = require('fs');
const jpeg = require('jpeg-js');

const path = require('path');
const nodeFetch = require('node-fetch');
const Request = nodeFetch.Request;
const Response = nodeFetch.Response;

//override fetch to enable use of local files
global.fetch = function (url, options) {
    const request = new Request(url, options);
    if (request.url.substring(0, 5) === 'file:') {
      return new Promise((resolve, reject) => {
        const filePath = path.normalize(url.substring('file:///'.length));
        if (!fs.existsSync(filePath)) {
          reject(`File not found: ${filePath}`);
        }
        const readStream = fs.createReadStream(filePath);
        readStream.on('open', function () {
          resolve(new Response(readStream, {
            url: request.url,
            status: 200,
            statusText: 'OK',
            size: fs.statSync(filePath).size,
            timeout: request.timeout
          }));
        });
      });
    } else {
      return nodeFetch(url, options);
    }
};

const NUMBER_OF_CHANNELS = 3
const MODEL_PATH = '/models/mobilenet/model.json'

const readImage = path => {
  const buf = fs.readFileSync(path)
  const pixels = jpeg.decode(buf, true)
  return pixels
}

const imageByteArray = (image, numChannels) => {
  const pixels = image.data
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values
}

const imageToInput = (image, numChannels) => {
  const values = imageByteArray(image, numChannels)
  const outShape = [image.height, image.width, numChannels];
  const input = tf.tensor3d(values, outShape, 'int32');

  return input
}

const loadModel = async () => {
  const mn = new mobilenet.MobileNet(1, 1);
  mn.path = `file://${MODEL_PATH}`
  await mn.load()
  return mn
}

const classify = async (path) => {
  const image = readImage(path)
  const input = imageToInput(image, NUMBER_OF_CHANNELS)

  const  mn_model = await loadModel()
  const predictions = await mn_model.classify(input)

  console.log('classification results:', predictions)
}

if (process.argv.length !== 3) throw new Error('incorrect arguments: node test-image.js <IMAGE_FILE>')

classify(process.argv[2])