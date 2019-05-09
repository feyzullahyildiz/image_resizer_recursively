const fs = require('fs-extra')

const sharp = require('sharp');
const { getDirectoriesRecursive } = require('./file_directory_creator');

const folders = getDirectoriesRecursive('./resize_folder/input');

folders.forEach(inputPath => {

  // console.log(inputPath);
  const outputFolderPath = inputPath.replace('resize_folder\\input', 'resize_folder\\output')
  fs.ensureDirSync('./' + outputFolderPath);
  // console.log(outputFolderPath)
  // console.log(fs.readdirSync(inputPath))
  fs.readdirSync(inputPath).forEach(img => {
    if (img.endsWith('png') || img.endsWith('jpeg') || img.endsWith('jpg')) {
      const imagePath = inputPath + '/' + img;
      console.log('imagePath', imagePath)
      const image = sharp(imagePath);
      image.metadata()
        .then((metadata) => {
          const max = metadata.height > metadata.width ? metadata.height : metadata.width;
          const ratio = max / 64;
          image.resize({
              width: metadata.width / ratio,
              height: metadata.height / ratio,
              fit: 'contain',
          })
          .toFile('./' + outputFolderPath + '/' + img);
      }).catch((err) => {
        console.log('ERR', err);
      })
    } else if(img.includes('.')) {
      console.log('not an image: ', inputPath + '/' + img);
    } 
  })

})


