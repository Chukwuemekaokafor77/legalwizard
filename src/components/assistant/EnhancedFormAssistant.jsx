// src/components/assistant/EnhancedFormAssistant.jsx
import React, { useState, useEffect } from 'react';
import { Info, AlertCircle, ChevronDown, ClipboardCheck, MagicWand } from 'lucide-react';

export const EnhancedFormAssistant = ({
  section,
  fieldDefinitions,
  currentValues,
  onUpdate,
  contextHelp,          // New: Contextual help content
  onHelpRequest,        // New: Help system callback
  documentInsights,     // New: Auto-fill from document analysis
  validationErrors = {} // New: Validation state
}) => {
  const [localValues, setLocalValues] = useState(currentValues || {});
  const [activeField, setActiveField] = useState(null);

  // Sync with parent state
  useEffect(() => {
    setLocalValues(currentValues || {});
  }, [currentValues]);

  // Handle auto-fill from document insights
  const handleAutoFill = (fieldId) => {
    const insightValue = documentInsights?.[fieldId];
    if (insightValue) {
      const updatedValues = { ...localValues, [fieldId]: insightValue };
      setLocalValues(updatedValues);
      onUpdate(updatedValues);
    }
  };

  // Dynamic field rendering
  const renderField = (field) => {
    const hasError = validationErrors[field.id];
    const autoFillAvailable = documentInsights?.[field.id];
    const showCondition = field.condition 
      ? field.condition(localValues)
      : true;

    if (!showCondition) return null;

    return (
      <div 
        key={field.id}
        className={`form-field ${hasError ? 'error' : ''}`}
        onFocus={() => setActiveField(field.id)}
        onBlur={() => setActiveField(null)}
      >
        <div className="field-header">
          <label>
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          
          <div className="field-actions">
            {autoFillAvailable && (
              <button 
                className="auto-fill-btn"
                onClick={() => handleAutoFill(field.id)}
              >
                <MagicWand size={16} />
                <span>Auto-Fill</span>
              </button>
            )}
            {field.helpKey && (
              <button
                className="help-btn"
                onClick={() => onHelpRequest(contextHelp[field.helpKey])}
              >
                <AlertCircle size={16} />
              </button>
            )}
          </div>
        </div>

        {renderInput(field, hasError)}

        {field.legalTerm && (
          <div className="legal-term">
            <Info size={14} />
            <span>{field.legalTerm}</span>
          </div>
        )}

        {hasError && (
          <div className="error-message">
            <AlertCircle size={14} />
            {validationErrors[field.id]}
          </div>
        )}
      </div>
    );
  };

  // Input type handling
  const renderInput = (field, hasError) => {
    switch (field.type) {
      case 'dropdown':
        return (
          <div className="select-wrapper">
            <select
              value={localValues[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className={hasError ? 'error' : ''}
            >
              <option value="">Select {field.label}</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="select-chevron" />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={localValues[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={localValues[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
            rows={4}
          />
        );

      default:
        return (
          <input
            type={field.type || 'text'}
            value={localValues[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={hasError ? 'error' : ''}
            placeholder={field.placeholder}
          />
        );
    }
  };

  // Value change handler
  const handleChange = (fieldId, value) => {
    const updatedValues = { ...localValues, [fieldId]: value };
    setLocalValues(updatedValues);
    onUpdate(updatedValues);
  };

  return (
    <div className="enhanced-form-assistant">
      <div className="form-header">
        <h3>{section}</h3>
        <button 
          className="section-help-btn"
          onClick={() => onHelpRequest(contextHelp?.section)}
        >
          <AlertCircle size={18} />
          Section Help
        </button>
      </div>

      <div className="form-grid">
        {fieldDefinitions.map(renderField)}
      </div>

      {documentInsights?.summary && (
        <div className="document-summary">
          <ClipboardCheck size={18} />
          <p>We found {documentInsights.summary.fieldsFound} auto-fillable fields 
          in your uploaded documents</p>
        </div>
      )}
    </div>
  );
};