import React from 'react';

const CaseTypeStep = ({ pathway, answers, onUpdate }) => {
  const handleFieldChange = (sectionId, fieldId, value) => {
    const updatedAnswers = {
      ...answers,
      [sectionId]: {
        ...answers[sectionId],
        [fieldId]: value
      }
    };
    onUpdate(sectionId, updatedAnswers);
  };

  return (
    <div className="case-type-step">
      <h3>Case Details</h3>
      {pathway.formSections.map(section => (
        <div key={section.id} className="form-section">
          <h4>{section.title}</h4>
          {section.fields.map(field => (
            <div key={field.id} className="form-field">
              <label>{field.label}</label>
              {field.type === 'dropdown' ? (
                <select
                  value={answers[section.id]?.[field.id] || ''}
                  onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={answers[section.id]?.[field.id] || ''}
                  onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CaseTypeStep;