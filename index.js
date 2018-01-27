const Promise = require('bluebird')

const Jimp = Promise.promisifyAll(require('jimp'))
const zipWith = require('lodash.zipwith')

const cropAlpha = require('./src/cropAlpha')
const packImages = require('./src/packImages')
const genAtlasJson = require('./src/genAtlasJson')

const { inspect } = require('util')

process.on('unhandledRejection', (reason) => {
    console.log('Reason: ' + reason);
});

function attachFrameName(imageObject, fileName) {
  imageObject.name = fileName
  return imageObject
}

;(async () => {
  const imageFiles = ['test.png', 'test2.png']
  // Trivial lambda to avoid `this` shennanigans
  const inputImages = await Promise.map(imageFiles, x => Jimp.readAsync(x))

  inputImages.map(Promise.promisifyAll)

  const images = await Promise.map(inputImages, x => x.getBufferAsync(Jimp.MIME_PNG))
  const croppedImages = await Promise.map(images, cropAlpha)
  
  const imageList = zipWith(croppedImages, imageFiles, attachFrameName)
  const { textureAtlas, atlasLocations } = await packImages(croppedImages)

  console.log(inspect(genAtlasJson(croppedImages, atlasLocations), false, null))
})()

