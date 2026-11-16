export const validateEventInput = (data) => {
  const errors = [];
  if (!data.title && !data.event_title) {
    errors.push('Event title is required');
  }
  if (!data.eventDate && !data.event_date) {
    errors.push('Event date is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
