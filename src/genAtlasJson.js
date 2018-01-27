const zipWith = require('lodash.zipwith')
const { inspect } = require('util')

module.exports = function genAtlasJson(images, atlasLocations) {
  function combine(image, location) {
    const outJson = {}
    outJson.frame = {x: location.x, y: location.y, w: image.spriteSourceSize.w, h: image.spriteSourceSize.h}
    outJson.rotated = false
    outJson.trimmed = true
    outJson.sourceSpriteSize = image.sourceSpriteSize
    outJson.sourceSize = image.sourceSize

    return { [image.name]: outJson }
  }

  const frames = zipWith(images, atlasLocations, combine)
  const outJson = {}

  frames.forEach(frame => {
    Object.assign(outJson, frame)
  })

  return outJson
}
