require('dotenv').config()
const path = require('path')
const fs = require('fs-extra');
const sharp = require('sharp');
const FileType = require('file-type');

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const { getDirectoriesRecursive } = require('./file_directory_creator');

const resizeFolder = path.join(__dirname, '..', 'resize_folder')
const inputPath = path.join(resizeFolder, 'input');
const outputPath = path.join(resizeFolder, 'output');
const tinyOutputPath = path.join(resizeFolder, 'tiny_output');

function defaultValue(val, _defaultvalue) {
  if (typeof val === 'undefined') {
    return _defaultvalue;
  }
  return val;
}

const maxWidth = defaultValue(process.env.MAX_WIDTH, 128);
const maxHeight = defaultValue(process.env.MAX_HEIGHT, 128);
async function start() {
  const folderList = getDirectoriesRecursive(inputPath);
  console.log('folders', folderList);
  console.log('maxWidth', maxWidth);
  console.log('maxHeight', maxHeight);
  await fs.remove(outputPath)
  await fs.remove(tinyOutputPath)
  for (const folder of folderList) {
    const files = await fs.readdir(folder)
    for (const f of files) {
      await startProcessFile(path.join(folder, f))
    }
  }

  await startTinify();
  console.log('DONE')
}

async function startTinify() {
  const folderList = getDirectoriesRecursive(outputPath);
  console.log('folders', folderList);
  console.log('maxWidth', maxWidth);
  console.log('maxHeight', maxHeight);
  for (const folder of folderList) {
    const files = await fs.readdir(folder)
    for (const f of files) {
      await startTinifyImage(path.join(folder, f))
    }
  }

}

async function startTinifyImage(filepath) {
  const isFile = await fs.stat(filepath).then(s => s.isFile())
  if (!isFile) {
    return;
  }
  const relativePath = path.relative(outputPath, filepath);
  const tinyOutputFilePath = path.join(tinyOutputPath, relativePath)
  await imagemin([filepath], {
    destination: path.dirname(tinyOutputFilePath),
    plugins: [
      imageminJpegtran({
        quality: [0.6, 0.8]
      }),
      imageminPngquant({
        quality: [0.6, 0.8]
      })
    ]
  });
}
async function getMetaDataWithoutCrash(filepath) {
  try {
    return sharp(filepath).metadata()
  } catch (error) {
    console.log('metadata error', filepath, error);
    return null;
  }
}

async function resizeImage(metadata, inputImagePath, outputImagePath) {
  const max = metadata.height > metadata.width ? metadata.height : metadata.width;
  const ratioX = max / maxWidth;
  const ratioY = max / maxHeight;
  const compressionLevel = 9;
  if (ratioX < 1 || ratioY < 1) {
    // await sharp(inputImagePath).toFile(outputImagePath)
    await sharp(inputImagePath)
      // .png({ compressionLevel })
      .toFile(outputImagePath)
  } else {
    const options = {
      width: metadata.width / ratioX,
      height: metadata.height / ratioY,
      fit: 'contain',
    }
    await sharp(inputImagePath)
      .resize(options)
      // .png({ compressionLevel })
      .toFile(outputImagePath);
  }

}
/**
 * 
 * @param {string} filepath 
 */
async function startProcessFile(filepath) {
  const isFile = await fs.stat(filepath).then(s => s.isFile())
  if (!isFile) {
    // console.log('not a file')
    return;
  }
  const fileType = await FileType.fromFile(filepath)
  if (!fileType) {
    console.log('fileType not valid')
    console.log('excluded path: ', filepath)
    return;
  }
  if (!['image/png', 'image/jpg'].includes(fileType.mime)) {
    console.log('FILE TYPE IS NOT ALLOWED')
    console.log('fileType', fileType);
    return;
  }
  const relativePath = path.relative(inputPath, filepath);
  const outputFilePath = path.join(outputPath, relativePath)
  await fs.ensureDir(path.dirname(outputFilePath))

  const metadata = await getMetaDataWithoutCrash(filepath)
  if (!metadata) {
    return;
  }
  await resizeImage(metadata, filepath, outputFilePath)
}


start();


