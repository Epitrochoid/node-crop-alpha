const sharp = require('sharp')

const cropAlpha = require('./src/cropAlpha')

process.on('unhandledRejection', (reason) => {
    console.log('Reason: ' + reason);
});

;(async () => {
  const inputImage = await sharp('test.png').toBuffer()
  await console.log(cropAlpha(inputImage))
})()

