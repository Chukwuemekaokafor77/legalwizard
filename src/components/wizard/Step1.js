// src/components/wizard/Step1.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ErrorMessage,
  LegalTermTooltip,
  PathwayCard,
  PathwayAlert
} from '../ui/pathways';
import { Briefcase, Info, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

const Step1 = ({ pathway, onChange, answers }) => {
  const [selectedCaseType, setSelectedCaseType] = useState(answers.caseType || "");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!selectedCaseType) newErrors.caseType = "Please select a case type";
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    onChange({ 
      caseType: selectedCaseType,
      isValid,
      requirements: getCaseRequirements()
    });
    
    return isValid;
  };

  const getCaseRequirements = () => {
    if (!selectedCaseType) return {};
    return pathway.caseTypes.find(ct => ct.id === selectedCaseType)?.requirements || {};
  };

  const handleCaseTypeChange = (caseTypeId) => {
    setSelectedCaseType(caseTypeId);
    validate();
  };

  useEffect(() => validate(), []);

  return (
    <div className="pathway-step">
      <PathwayCard title="Select Case Type" icon={Briefcase}>
        <div className="space-y-6">
          <PathwayAlert type="info">
            {pathway.selectionGuidance || 'Select the case type that best matches your legal situation'}
          </PathwayAlert>

          <div className="case-type-grid">
            {pathway.caseTypes.map(caseType => (
              <div 
                key={caseType.id}
                className={`case-type-card ${selectedCaseType === caseType.id ? 'active' : ''}`}
                onClick={() => handleCaseTypeChange(caseType.id)}
              >
                <div className="case-type-header">
                  <h4>
                    {caseType.urgent && <AlertTriangle size={16} />}
                    <LegalTermTooltip term={caseType.title} definition={caseType.description} />
                  </h4>
                  <span className="case-type-time">
                    {caseType.estimatedTime} mins
                  </span>
                </div>
                
                <div className="case-type-details">
                  <p>{caseType.description}</p>
                  
                  {caseType.requirements?.documents && (
                    <div className="case-type-documents">
                      <FileText size={14} />
                      <span>Requires: {caseType.requirements.documents.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <ChevronRight className="case-type-chevron" />
              </div>
            ))}
          </div>

          {errors.caseType && <ErrorMessage message={errors.caseType} />}
        </div>
      </PathwayCard>
    </div>
  );
};

export default Step1;