// src/components/wizard/Step2.jsx
import React, { useEffect } from 'react';
import { 
  ErrorMessage,
  PathwayInput,
  PathwaySelect,
  PathwaySection 
} from '../ui/pathways';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase 
} from 'lucide-react';
import { validateLegalField } from '../../utils/validation';

const Step2 = ({ pathway, answers, onChange }) => {
  const [errors, setErrors] = useState({});
  const personalInfoConfig = pathway.formSections.find(s => s.id === 'personal');

  const validateSection = () => {
    const newErrors = {};
    personalInfoConfig.fields.forEach(field => {
      if (field.required && !answers[field.id]) {
        newErrors[field.id] = field.errorMessage || `${field.label} is required`;
      }
      if (field.validation && answers[field.id]) {
        const isValid = validateLegalField(answers[field.id], field.validation);
        if (!isValid) newErrors[field.id] = field.errorMessage;
      }
    });
    
    setErrors(newErrors);
    onChange({ isValid: Object.keys(newErrors).length === 0 });
  };

  const handleChange = (fieldId, value) => {
    onChange({ [fieldId]: value });
    validateSection();
  };

  useEffect(() => validateSection(), []);

  return (
    <div className="pathway-step">
      <PathwaySection 
        title="Personal Information" 
        description={personalInfoConfig.description}
        icon={User}
      >
        <div className="form-grid">
          {personalInfoConfig.fields.map(field => (
            <div key={field.id} className="form-field">
              {field.type === 'select' ? (
                <PathwaySelect
                  label={field.label}
                  value={answers[field.id] || ''}
                  options={field.options}
                  onChange={(value) => handleChange(field.id, value)}
                  icon={field.icon && eval(field.icon)}
                  error={errors[field.id]}
                  required={field.required}
                />
              ) : (
                <PathwayInput
                  label={field.label}
                  type={field.type}
                  value={answers[field.id] || ''}
                  onChange={(value) => handleChange(field.id, value)}
                  placeholder={field.placeholder}
                  icon={field.icon && eval(field.icon)}
                  error={errors[field.id]}
                  required={field.required}
                  helpText={field.helpText}
                />
              )}
            </div>
          ))}
        </div>
      </PathwaySection>
    </div>
  );
};

export default Step2;