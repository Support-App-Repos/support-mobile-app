const {
  S3Client,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');

const uploadFileToS3 = async (image) => {
  // AWS S3 configuration
  const bucketName = process.env.AWS_S3_BUCKET?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region = (process.env.AWS_REGION || 'us-east-1').trim();
  
  // Validate required environment variables
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET is not set in environment variables. Please check env/.env.development file.');
  }

  if (!accessKeyId) {
    throw new Error('AWS_ACCESS_KEY_ID is not set in environment variables. Please check env/.env.development file.');
  }

  if (!secretAccessKey) {
    throw new Error('AWS_SECRET_ACCESS_KEY is not set in environment variables. Please check env/.env.development file.');
  }

  // Validate Access Key ID format (should start with 'AKIA' for IAM users)
  if (!accessKeyId.startsWith('AKIA') && accessKeyId.length !== 20) {
    console.warn(`[S3 Upload] Warning: AWS_ACCESS_KEY_ID format may be incorrect. Expected format: AKIA followed by 16 characters (20 total). Got: ${accessKeyId.substring(0, 4)}... (length: ${accessKeyId.length})`);
  }

  // Validate Secret Access Key format (should be 40 characters)
  if (secretAccessKey.length !== 40) {
    console.warn(`[S3 Upload] Warning: AWS_SECRET_ACCESS_KEY length may be incorrect. Expected: 40 characters. Got: ${secretAccessKey.length} characters`);
  }
  
  const s3Config = {
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  };

  const s3 = new S3Client(s3Config);

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
    
    // Generate AWS S3 file URL
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${params.Key}`;

    return fileUrl;
  } catch (err) {
    // Provide more helpful error messages
    if (err.name === 'InvalidAccessKeyId' || err.message.includes('does not exist in our records')) {
      throw new Error(`Invalid AWS Access Key ID. Please verify your AWS_ACCESS_KEY_ID in env/.env.development is correct. Error: ${err.message}`);
    }
    if (err.name === 'SignatureDoesNotMatch' || err.message.includes('Signature')) {
      throw new Error(`Invalid AWS Secret Access Key. Please verify your AWS_SECRET_ACCESS_KEY in env/.env.development is correct. Error: ${err.message}`);
    }
    if (err.name === 'NoSuchBucket') {
      throw new Error(`S3 bucket "${bucketName}" does not exist or you don't have access to it. Please verify your AWS_S3_BUCKET and IAM permissions. Error: ${err.message}`);
    }
    throw new Error(`Error uploading file to S3: ${err.message}`);
  }
}

module.exports = {
  uploadFileToS3
};
