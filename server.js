const axios = require('axios');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { compressAndSaveWebp } = require('./utils/utils');

const app = express();

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

const getLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000,
  max: 3,
  message: 'What the fuck you are trying to do man!!!',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.get('/image/:imgName', getLimiter, (req, res) => {
  const img = req.params.imgName;

  return res.send();
});

app.post('/', (req, res) => {
  res.json('Again Hello world');
});

app.post('/image', async (req, res) => {
  const imageData = await axios.get(
    'https://pixabay.com/api/?key=2718835-1fb7bb1bcc348d35ed344d71e&q=yellow+flowers&image_type=photo'
  );

  const targetImage = imageData.data.hits[0]['largeImageURL'];

  const images = await compressAndSaveWebp({
    image: targetImage,
    targetFolderName: 'public',
    imageInitName: 'cyens-superworld',
  });

  if (!images.isSuccess) {
    return res.status(500).json(images);
  }

  res.status(201).json(images);
});

app.listen(5000);
