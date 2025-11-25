const {
  S3Client,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

const uploadFileToS3 = async (image) => {

  const bucketName = process.env.HETZNER_BUCKET;
  const s3 = new S3Client({
    endpoint: process.env.HETZNER_URL,
    region: process.env.HETZNER_REGION, // Can be anything, Hetzner ignores it
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.HETZNER_ACCESS_KEY,
      secretAccessKey: process.env.HETZNER_SECRET_KEY,
    },
  });

  const { buffer, originalname, mimetype, folder = '' } = image
  const params = {
    Bucket: bucketName,
    Key: `${folder}${originalname}`,
    Body: buffer,
    ContentType: mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    const fileUrl = `https://${bucketName}.${process.env.HETZNER_S3_LOCATION}/${params.Key}`;

    return fileUrl;
  } catch (err) {
    throw new Error(`Error uploading file to S3: ${err.message}`);
  }
}

module.exports = {
  uploadFileToS3
};
