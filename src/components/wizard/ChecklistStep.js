// src/components/wizard/ChecklistStep.js
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, FileText, ClipboardCheck } from 'lucide-react';
import { PathwayService } from '../../services/PathwayService';
import ProgressStatus from '../ui/ProgressStatus';
import DocumentStatusCard from '../ui/DocumentStatusCard';

const ChecklistStep = ({ pathway, onComplete, onDocumentStatus }) => {
  const [requirements, setRequirements] = useState({
    documents: [],
    account: false,
    eligibility: []
  });
  
  const [checkedItems, setCheckedItems] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadRequirements = () => {
      const service = new PathwayService();
      const pathwayConfig = service.getPathwayConfig(pathway.id);
      
      setRequirements({
        documents: pathwayConfig.documentRequirements,
        account: pathwayConfig.requiresAccount,
        eligibility: pathwayConfig.eligibilityCriteria
      });
    };

    loadRequirements();
  }, [pathway]);

  const handleChecklistChange = (itemId, checked) => {
    const newState = { ...checkedItems, [itemId]: checked };
    const completed = Object.values(newState).filter(Boolean).length;
    const total = requirements.documents.length + requirements.eligibility.length;
    
    setCheckedItems(newState);
    setProgress(Math.round((completed / total) * 100));
    onDocumentStatus?.(newState);
  };

  const allChecked = progress === 100;

  return (
    <div className="pathway-checklist">
      <div className="checklist-header">
        <h2>Preparing Your {pathway.title} Application</h2>
        <ProgressStatus percentage={progress} />
      </div>

      <div className="checklist-sections">
        <DocumentStatusCard 
          documents={requirements.documents}
          checkedItems={checkedItems}
          onChange={handleChecklistChange}
        />

        <div className="eligibility-section">
          <h3><AlertCircle size={20} /> Eligibility Criteria</h3>
          <ul>
            {requirements.eligibility.map(criteria => (
              <li key={criteria.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedItems[criteria.id] || false}
                    onChange={(e) => handleChecklistChange(criteria.id, e.target.checked)}
                  />
                  {criteria.description}
                </label>
                {criteria.legalReference && (
                  <span className="legal-ref">
                    <FileText size={14} />
                    {criteria.legalReference}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {requirements.account && (
          <div className="account-warning">
            <AlertCircle size={24} />
            <p>This pathway requires a verified account to proceed</p>
          </div>
        )}
      </div>

      <button
        className={`proceed-button ${allChecked ? 'active' : 'disabled'}`}
        onClick={onComplete}
        disabled={!allChecked}
      >
        <ClipboardCheck size={20} />
        {allChecked ? 'Start Application' : 'Complete Checklist to Continue'}
      </button>
    </div>
  );
};

export default ChecklistStep;