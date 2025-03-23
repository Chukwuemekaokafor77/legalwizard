import { useState, useCallback } from 'react';
import { validateFileType, validateFileSize } from '../utils/fileValidators';

const useDocumentValidator = (validationRules) => {
  const [validationErrors, setValidationErrors] = useState([]);
  
  const validateDocument = useCallback(async (file) => {
    const errors = [];
    
    // Type validation
    if (validationRules.allowedTypes) {
      const typeValid = validateFileType(file, validationRules.allowedTypes);
      if (!typeValid) errors.push(`Invalid file type. Allowed: ${validationRules.allowedTypes.join(', ')}`);
    }

    // Size validation
    if (validationRules.maxSize) {
      const sizeValid = validateFileSize(file, validationRules.maxSize);
      if (!sizeValid) errors.push(`File too large. Max size: ${validationRules.maxSize}MB`);
    }

    // Advanced validation (e.g., PDF structure)
    if (validationRules.validatePDF && file.type === 'application/pdf') {
      const pdfValid = await validatePDFStructure(file);
      if (!pdfValid) errors.push('Invalid PDF structure');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [validationRules]);

  return { validateDocument, validationErrors };
};

// Helper functions
const validateFileType = (file, allowedTypes) => 
  allowedTypes.includes(file.type);

const validateFileSize = (file, maxSizeMB) =>
  file.size <= maxSizeMB * 1024 * 1024;

const validatePDFStructure = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const arr = new Uint8Array(buffer);
    return arr.length > 4 && 
      arr[0] === 0x25 && arr[1] === 0x50 && 
      arr[2] === 0x44 && arr[3] === 0x46;
  } catch {
    return false;
  }
};

export default useDocumentValidator;