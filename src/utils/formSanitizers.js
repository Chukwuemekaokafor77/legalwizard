import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim());
  }
  return input;
};

export const sanitizeDate = (dateString) => {
  const isoDate = new Date(dateString).toISOString();
  return isoDate.split('T')[0]; // Return YYYY-MM-DD format
};

export const sanitizeFinancial = (value) => {
  return Number(value).toFixed(2);
};

export const sanitizeFormData = (formData, fieldConfig) => {
  return Object.entries(formData).reduce((acc, [key, value]) => {
    const config = fieldConfig[key];
    if (config) {
      acc[key] = config.sanitizer 
        ? config.sanitizer(value)
        : sanitizeInput(value);
    }
    return acc;
  }, {});
};