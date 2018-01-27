const Promise = require('bluebird')

const Jimp = Promise.promisifyAll(require('jimp'))
 
module.exports = async function packImages(images) {
  const atlasLocations = []

  // Sort images by height to pack efficiently later
  function compareImageHeights(imageA, imageB) {
    const heightA = imageA.spriteSourceSize.h
    const heightB = imageB.spriteSourceSize.h

    return heightB - heightA
  }

  images.sort(compareImageHeights)

  // Hacky temp implementation
  // Get total width of all images to create a blank image to composite to
  const outputWidth = images.reduce((acc, image) => image.spriteSourceSize.w + acc, 0)
  const outputHeight = images[0].spriteSourceSize.h

  const outputImage = await new Jimp(outputWidth, outputHeight)

  let nextOrigin = [0, 0]
  await Promise.each(images, async image => {
    const srcImage = await Jimp.read(image.image)
    outputImage.composite(srcImage, nextOrigin[0], nextOrigin[1])

    atlasLocations.push({x: nextOrigin[0], y: nextOrigin[1]})

    nextOrigin[0] += image.spriteSourceSize.w
  })

  Promise.promisifyAll(outputImage)
  return { textureAtlas: outputImage.getBufferAsync(Jimp.MIME_PNG), atlasLocations }
}
