export const validateRegisterInput = (data) => {
  const errors = [];
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }
  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (data.role && !['learner', 'teacher', 'admin'].includes(data.role)) {
    errors.push('Role must be one of: learner, teacher, admin');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLoginInput = (data) => {
  const errors = [];
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }
  if (!data.password || data.password.trim() === '') {
    errors.push('Password is required');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};
