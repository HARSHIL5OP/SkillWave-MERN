export const validateChallengeInput = (data) => {
  const errors = [];
  if (!data.title && !data.content_title) {
    errors.push('Challenge title is required');
  }
  if (!data.problemStatementUrl && !data.problemStatementURL) {
    errors.push('Problem statement PDF URL is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
