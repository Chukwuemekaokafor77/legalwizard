export const validateLegalForm = (values, pathway) => {
  const errors = {};
  
  // Dynamic validation based on pathway requirements
  pathway.formSections.forEach(section => {
    section.fields.forEach(field => {
      if (field.required && !values[field.id]) {
        errors[field.id] = 'This field is required';
      }
      
      if (field.type === 'date' && values[field.id]) {
        if (!isValidSeparationDate(values[field.id], pathway.jurisdiction)) {
          errors[field.id] = 'Invalid separation date for jurisdiction';
        }
      }
    });
  });

  return errors;
};

export const validateDocuments = (documents, pathway) => {
  const missing = [];
  const invalid = [];

  pathway.documentRequirements.forEach(req => {
    const doc = documents.find(d => d.type === req.id);
    
    if (!doc) {
      missing.push(req.title);
      return;
    }

    if (doc.size > req.maxSize) {
      invalid.push(`${req.title} (File too large)`);
    }

    if (!req.acceptedFormats.includes(doc.extension)) {
      invalid.push(`${req.title} (Invalid format)`);
    }
  });

  return { missing, invalid };
};

// Legal-specific validators
export const isValidSeparationDate = (dateString, jurisdiction) => {
  const separationDate = new Date(dateString);
  const today = new Date();
  const minDate = new Date(today.setFullYear(today.getFullYear() - 1));
  
  // Basic 1-year separation requirement
  if (jurisdiction === 'ontario' && separationDate > minDate) {
    return false;
  }
  
  return true;
};

export const validateFinancialDisclosure = (values) => {
  const errors = {};
  
  if (values.income && !/^\d+(\.\d{1,2})?$/.test(values.income)) {
    errors.income = 'Invalid income format';
  }

  if (values.netWorth && values.liabilities > values.assets) {
    errors.netWorth = 'Liabilities cannot exceed assets';
  }

  return errors;
};