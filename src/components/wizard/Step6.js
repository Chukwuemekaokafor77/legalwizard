// src/components/wizard/Step6.js
import React, { useState } from 'react';
import { 
  PathwayCard, 
  PathwayAlert,
  PathwayCheckbox,
  LegalDisclaimer
} from '../ui/pathways';
import { CheckCircle, Lock, AlertCircle } from 'lucide-react';

const Step6 = ({ pathway, onSubmit, isSubmitting, error }) => {
  const [confirmations, setConfirmations] = useState({});
  const confirmationConfig = pathway.confirmationRequirements;

  const handleConfirmation = (key) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isReady = confirmationConfig.every(req => confirmations[req.id]);

  return (
    <PathwayCard title="Final Submission" icon={CheckCircle}>
      <div className="space-y-6">
        <PathwayAlert type="info">
          {pathway.submissionGuidance || 'Review and confirm before final submission'}
        </PathwayAlert>

        {error && (
          <PathwayAlert type="error">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          </PathwayAlert>
        )}

        <div className="confirmation-grid">
          {confirmationConfig.map((req) => (
            <PathwayCheckbox
              key={req.id}
              label={req.label}
              description={req.description}
              checked={confirmations[req.id]}
              onChange={() => handleConfirmation(req.id)}
              required
            />
          ))}
        </div>

        <div className="security-notice">
          <Lock size={16} />
          <span>{pathway.securityNotice}</span>
        </div>

        <button
          onClick={onSubmit}
          disabled={!isReady || isSubmitting}
          className="pathway-submit-button"
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              {pathway.submissionText?.processing || 'Processing...'}
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              {pathway.submissionText?.default || 'Submit Application'}
            </>
          )}
        </button>

        <LegalDisclaimer terms={pathway.legalTerms} />
      </div>
    </PathwayCard>
  );
};

export default Step6;