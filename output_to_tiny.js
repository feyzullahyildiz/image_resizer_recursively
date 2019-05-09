const tinify = require("tinify");
const {token} = require('./env.json');
console.log('TOKEN -> ', token);
if(!token) {
    return;
}
tinify.key = token;

const fs = require('fs-extra')
const { getDirectoriesRecursive } = require('./file_directory_creator');

const folders = getDirectoriesRecursive('./resize_folder/output');

folders.forEach(inputPath => {
    const outputFolderPath = inputPath.replace('resize_folder\\output', 'resize_folder\\tiny_output')
    fs.ensureDirSync('./' + outputFolderPath);
    const files = fs.readdirSync(inputPath)
    console.log('files', files)
    files.forEach(fileName => {
        if (fileName.endsWith('png') || fileName.endsWith('jpeg') || fileName.endsWith('jpg')) {
            const fileInputPath = inputPath + '/' + fileName;
            const source = tinify.fromFile(fileInputPath);
            source.toFile('./' + outputFolderPath + '/' + fileName)
        } else if(fileName.includes('.')) {
            console.log('not an image ', inputPath + '/' + fileName);
        }
        
    })
})


// const inputFolder = './kgm_yeni/';
// const outputFolder = './tiny64/';
// fs.readdir(inputFolder, (err, layers) => {
//   layers.forEach(layer => {
//     fs.mkdir(outputFolder + layer, () => { })
//     fs.readdir(inputFolder + layer, (err, images) => {
//       images.forEach(image => {
//         console.log(inputFolder + layer + '/' + image);
//         const source = tinify.fromFile(inputFolder + layer + '/' + image);
//         source.toFile(outputFolder + layer + '/' + image);
//       })
//     })

//   });
// });


// console.log(walkSync('./kgm_yeni'));