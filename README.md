In this study I have used the following packages:
"axios": "^1.1.2",
"express": "^4.18.1",
"express-rate-limit": "^6.6.0",
"sharp": "^0.31.1"

main package of the study is sharp, target of the study was to fetch an image from a link, compress it and convert it
to webp and create two files (compressed image and thumbnail of the image) in filesystem under the created folder
and also to create link to each image.

This is a test study to compress image and create link to use the link in MongoDB. instead of file system, the images
can be uploaded to SW3 but to have images in files system with target link without SW3, compressAndSaveWebp function have
been created.

Utils folder also contain :
validateURL => to check if the given image param is from a valid link
detectMimeType => to detect image mime type from image buffer
createFolder => to create a new folder inside file system

compressAndSaveWebp function will be improved
