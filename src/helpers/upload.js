const axios = require('axios');

const uploadImage = async (image) => {
  const staticImageName = new Date().getTime();

  const imageData = image.buffer
  const nexusUrl = process.env.NEXUX_URL;
  const nexusUsername = process.env.NEXUX_USERNAME;   // Nexus username
  const nexusPassword = process.env.NEXUX_PASSWORD;

  const imageUrl = `${nexusUrl}${staticImageName}`;
  console.log('Image Uploading Start:', imageUrl);

  try {
    const headers = {
      'Content-Type': 'application/octet-stream',  // Binary file type
    };
    const response = await axios.put(
      imageUrl,  // Complete URL for the file upload
      imageData,
      {
        headers: headers,
        auth: {
          username: nexusUsername,
          password: nexusPassword
        }
      }
    );

    if (response.status === 201) {  // HTTP 201 Created
      console.log('Image uploaded successfully.', response?.request?.path);
      return `http://213.210.21.52:8081${response?.request?.path}`;
    } else {
      console.error("Failed to upload image.Status code:", response.status);
    }
  } catch (error) {
    console.error('Error uploading image:', error.message);
  }
}

module.exports = {
  uploadImage
};