export const validateVideoInput = (data) => {
  const errors = [];
  if (!data.title && !data.video_title) {
    errors.push('Video title is required');
  }
  if (!data.videoUrl && !data.VideoURL) {
    errors.push('Video URL is required');
  }
  if (!data.category) {
    errors.push('Category is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
