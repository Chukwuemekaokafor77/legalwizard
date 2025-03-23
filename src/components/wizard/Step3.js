// src/components/wizard/Step3.js
import React, { useEffect } from 'react';
import { PathwayCard, PathwayAlert, PathwayTextarea } from '../ui/pathways';
import { FileText, HelpCircle, Clock } from 'lucide-react';
import { validateField } from '../../utils/validation';

const Step3 = ({ pathway, answers, onChange }) => {
  const descConfig = pathway.descriptionRequirements;
  const [error, setError] = useState('');

  const validateDescription = (value) => {
    const validation = validateField(value, descConfig.rules);
    setError(validation.message);
    return validation.isValid;
  };

  const handleChange = (value) => {
    const isValid = validateDescription(value);
    onChange({
      caseDescription: value,
      isValid: isValid && (value ? true : descConfig.optional)
    });
  };

  useEffect(() => {
    validateDescription(answers.caseDescription);
  }, []);

  return (
    <PathwayCard title="Case Narrative" icon={FileText}>
      <div className="space-y-6">
        <PathwayAlert type="info">
          {descConfig.guidance || 'Provide a clear description of your legal situation'}
        </PathwayAlert>

        <PathwayTextarea
          label={descConfig.label}
          value={answers.caseDescription}
          onChange={handleChange}
          placeholder={descConfig.placeholder}
          charLimit={descConfig.charLimit}
          minChars={descConfig.minChars}
          helpText={descConfig.helpText}
        />

        {descConfig.showTips && (
          <div className="pathway-tips">
            <h4 className="flex items-center gap-2 font-medium">
              <HelpCircle size={16} />
              {descConfig.tipsTitle}
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {descConfig.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <PathwayAlert type="error">
            {error}
          </PathwayAlert>
        )}
      </div>
    </PathwayCard>
  );
};

export default Step3;