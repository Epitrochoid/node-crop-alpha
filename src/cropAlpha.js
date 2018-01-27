const Promise = require('bluebird')

const { PNG } = require('pngjs')
const Jimp = Promise.promisifyAll(require('jimp'))

function getCropDimensions(imagePixelData, height, width) {
  // Number of pixels from the specified edge to crop to
  let left, above, right, below

  // Handle the left side
  outerLoop: for (let vline = 0; vline < width; vline++) {
    for (let hline = 0; hline < height; hline++) {
      // Gets the current pixel, factor of 4 is because each pixel
      // is four bytes of the form RGBA
      const pixel = ((hline * width) + vline) * 4
      // Add 3 to the index since we want the fourth byte for the alpha channel
      if (imagePixelData[pixel+3] > 0) {
        left = vline
        break outerLoop
      }
    }
  }

  // Handle the right side
  outerLoop: for (let vline = width; vline > 0; vline--) {
    for (let hline = 0; hline < height; hline++) {
      const pixel = ((hline * width) + vline) * 4
      if (imagePixelData[pixel+3] > 0) {
        right = vline + 1
        break outerLoop
      }
    }
  }

  // Handle above
  outerLoop: for (let hline = 0; hline < height; hline++) {
    for (let vline = 0; vline < width; vline++) {
      const pixel = ((hline * width) + vline) * 4
      if (imagePixelData[pixel+3] > 0) {
        above = hline
        break outerLoop;
      }
    }
  }

  // Handle below
  outerLoop: for (let hline = height; hline > 0; hline--) {
    for (let vline = 0; vline < width; vline++) {
      const pixel = ((hline * width) + vline) * 4
      if (imagePixelData[pixel+3] > 0) {
        below = hline + 1
        break outerLoop;
      }
    }
  }
  return { 
    x: left,
    y: above,
    w: right - left,
    h: below - above
  }
}

module.exports = async function cropAlpha(imageBuffer) {
  const png = Promise.promisifyAll(new PNG({}))
  
  const imageData = await png.parseAsync(imageBuffer)
  const image = await Jimp.readAsync(imageBuffer)

  const cropDimensions = getCropDimensions(imageData.data, imageData.width, imageData.height)
  image.crop(cropDimensions.x, cropDimensions.y, cropDimensions.w, cropDimensions.h)

  Promise.promisifyAll(image)
  const imageOut = await image.getBufferAsync(Jimp.MIME_PNG)

  return {
    spriteSourceSize: cropDimensions,
    sourceSize: {
      w: imageData.width,
      h: imageData.height
    },
    image: imageOut
  }
}
