import React, { useState, useEffect } from 'react';
import { Info, AlertCircle, ChevronRight } from 'lucide-react';

export const DynamicFormAssistant = ({ 
  sections, 
  answers, 
  onUpdate, 
  onHelpRequest 
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    setInputValues(answers[sections[currentSection]?.id] || {});
  }, [currentSection, sections, answers]);

  const handleFieldChange = (fieldId, value) => {
    setInputValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitSection = () => {
    onUpdate(sections[currentSection].id, inputValues);
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  return (
    <div className="dynamic-form-container">
      <div className="form-header">
        <h3>{sections[currentSection]?.title}</h3>
        <button 
          onClick={() => onHelpRequest(sections[currentSection]?.helpContent)}
          className="help-button"
        >
          <AlertCircle size={18} />
        </button>
      </div>

      <div className="form-fields">
        {sections[currentSection]?.fields.map(field => (
          <div key={field.id} className="form-field">
            <label>
              {field.label}
              {field.required && <span className="required-star">*</span>}
            </label>
            
            {field.type === 'dropdown' ? (
              <select
                value={inputValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
              >
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={inputValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
              />
            )}

            {field.legalTerm && (
              <div className="term-tooltip">
                <Info size={16} />
                <span className="tooltip-text">
                  {field.legalTerm.definition}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="form-navigation">
        <button
          onClick={handleSubmitSection}
          disabled={!sections[currentSection]?.fields.every(
            f => !f.required || inputValues[f.id]
          )}
        >
          Continue
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};