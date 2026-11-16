import cloudinary from '../config/cloudinary.js';

export const uploadBufferToCloudinary = (fileBuffer, resourceType = 'auto', folder = 'skillwave') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary API credentials exist, use the official SDK upload_stream
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
            duration: result.duration || null,
          });
        }
      );
      uploadStream.end(fileBuffer);
    } else {
      // Fallback using preset via multipart upload
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dakkqbr4g';
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'demo-upload';
      const blob = new Blob([fileBuffer]);
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', preset);
      if (resourceType === 'raw') {
        formData.append('resource_type', 'raw');
      }

      const endpointType = resourceType === 'video' ? 'video' : resourceType === 'raw' ? 'raw' : 'image';
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpointType}/upload`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) return reject(new Error(data.error.message));
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            bytes: data.bytes,
            format: data.format,
            duration: data.duration || null,
          });
        })
        .catch(reject);
    }
  });
};
