const axios = require('axios');
const URL = require('url').URL;
const fs = require('fs');
const sharp = require('sharp');

const validateURL = (url, whiteList = []) => {
  try {
    const origin = new URL(url).origin;

    if (
      whiteList !== undefined &&
      whiteList instanceof Array &&
      whiteList.length > 0
    ) {
      return whiteList.includes(origin);
    }

    return true;
  } catch (error) {
    return false;
  }
};

const detectMimeType = (imgBuffer) => {
  const signFromHex = imgBuffer.toString('hex').substring(0, 8);
  const typeSignatures = {
    ffd8ffe0: 'image/jpg',
    ffd8ffee: 'image/jpg',
    ffd8ffdb: 'image/jpg',
    ffd8ffe1: 'image/jpg',
    '89504e47': 'image/png',
    52494646: 'image/webp',
  };

  for (let sign in typeSignatures) {
    if (sign.toString().toLowerCase() === signFromHex.toLowerCase()) {
      return typeSignatures[sign];
    }
  }

  return null;
};

const createFolder = (folderName) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
  }
  return folderName;
};

const compressAndSaveWebp = async ({
  image,
  whiteList,
  targetFolderName,
  imageInitName = 'cyens-superworld',
}) => {
  try {
    if (image && validateURL(image, whiteList)) {
      //Get image as buffer
      const response = await axios.get(image, {
        responseType: 'arraybuffer',
      });

      const timestamp = new Date().getTime();
      const date = new Date();
      const ref = `${imageInitName}-${date.getFullYear()}-${date.getDate()}-${timestamp}.webp`;

      //Create folder
      const folder = createFolder(targetFolderName);

      //detect mime type of image: will return "image/jpg" or "image/png" or image/webp
      const imgType = detectMimeType(response.data);

      //compress image && convert image to webp buffer
      if (imgType) {
        const originalCompressedImage = await sharp(response.data)
          .webp({ quality: 70 })
          .toBuffer({ resolveWithObject: true });

        const thumbnailWidth =
          parseInt(originalCompressedImage.info.width * 0.45) || 300;
        const thumbnailHeight =
          parseInt(originalCompressedImage.info.height * 0.45) || 300;

        const imgThumbnail = await sharp(response.data)
          .webp({ quality: 60 })
          .resize(thumbnailWidth, thumbnailHeight)
          .toBuffer({ resolveWithObject: true });

        //create file names
        const imageName = ref;
        const thumbName = `thumbnail-${ref}`;

        if (imageName && thumbName && folder) {
          fs.openSync(`./${folder}/${imageName}`, 'w');
          fs.openSync(`./${folder}/${thumbName}`, 'w');

          fs.writeFileSync(
            `./${folder}/${imageName}`,
            originalCompressedImage.data
          );
          fs.writeFileSync(`./${folder}/${thumbName}`, imgThumbnail.data);

          return {
            isSuccess: true,
            imageLink: `http://localhost:5000/${folder}/${imageName}`,
            thumbLink: `http://localhost:5000/${folder}/${thumbName}`,
            message: 'Image links created successfully',
          };
        } else {
          throw new Error('Unexpected error occured.');
        }
      } else {
        throw new Error('Not a valid image type');
      }
    } else {
      throw new Error('Not a valid image link');
    }
  } catch (error) {
    return {
      isSuccess: false,
      message: error.message,
      imageLink: null,
      thumbLink: null,
    };
  }
};

module.exports = { compressAndSaveWebp };
