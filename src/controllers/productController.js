const mongoose = require('mongoose');
const errors = require('../helpers/errors');
const { uploadFileToS3 } = require('../helpers/uploadToS3');

const productController = {};

productController.uploadImages = async (req, res) => {
  try {
    const images = req.files || [];
    const { existingImages } = req.body;

    const urlArray = existingImages ? existingImages.split(',') : [];

    const uploadedImages = await Promise.all(images.map(async (image) => {
      return await uploadFileToS3(image);
    }));
    const imageUrls = [...urlArray, ...uploadedImages]
    // req.body.imageUrls = imageUrls;

    // const data = await productDal.update(req.params.id, req.body, req.user);
    res.json(imageUrls);
  } catch (error) {
    const message = 'Update product error';

    // errors.handleError(res, error, message);
  }
};

module.exports = productController;

// nodeCron.schedule('*/1 * * * *', async () => {
//   console.log('Products fetching...');
//   await processDataInBatches();
// });
