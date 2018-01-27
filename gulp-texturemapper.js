const Promise = require('bluebird')

const Jimp = Promise.promisifyAll(require('jimp'))
const zipWith = require('lodash.zipwith')

const through2 = require('through2')
const path = require('path')
const File = require('vinyl')

const cropAlpha = require('./src/cropAlpha')
const packImages = require('./src/packImages')
const genAtlasJson = require('./src/genAtlasJson')

const fileList = []
let latestFile

function attachFrameName(imageObject, fileName) {
  imageObject.name = fileName
  return imageObject
}

module.exports = function(file, opt) {

  function collectImages(file, enc, cb) {
    latestFile = file
    fileList.push(file)
    cb()
  }

  function endStream(cb) {
    if (!fileList) {
      cb()
      return
    }

    const pack = async () => {
      const filePaths = fileList.map(x => x.path)
      // Strip the path down to the filename without extension
      const fileNames = filePaths.map(x => path.basename(x, path.extname(x)))
      const inputImages = await Promise.map(filePaths, x => Jimp.readAsync(x))

      inputImages.map(Promise.promisifyAll)

      const images = await Promise.map(inputImages, x => x.getBufferAsync(Jimp.MIME_PNG))
      const croppedImages = await Promise.map(images, cropAlpha)

      const imageList = zipWith(croppedImages, fileNames, attachFrameName)
      const { textureAtlas, atlasLocations } = await packImages(croppedImages)

      const jsonAtlas = genAtlasJson(croppedImages, atlasLocations)

      const jsonFile = new File(file)
      jsonFile.contents = new Buffer(JSON.stringify(jsonAtlas))
      jsonFile.path = path.join(latestFile.base, 'texture-atlas.json')

      const textureFile = new File(file)
      textureFile.contents = await textureAtlas
      textureFile.path = path.join(latestFile.base, 'texture-atlas.png')

      this.push(jsonFile)
      this.push(textureFile)
      cb()
    }

    Promise.resolve(pack()).asCallback(cb)
  }

  return through2.obj(collectImages, endStream)
}
