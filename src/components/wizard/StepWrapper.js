// src/components/wizard/StepWrapper.js
import React from 'react';
import { 
  PathwayProgress,
  AutoSaveStatus,
  PathwayHelpPanel,
  PathwayNavigation
} from '../ui/pathways';

export const StepWrapper = ({ 
  pathway,
  stepState,
  children,
  onNavigate,
  onSave
}) => {
  return (
    <div className="pathway-step-wrapper">
      <PathwayProgress
        currentStep={stepState.number}
        totalSteps={pathway.totalSteps}
        completed={stepState.completed}
        onStepClick={onNavigate}
      />

      <div className="step-controls">
        <AutoSaveStatus 
          status={stepState.saveStatus}
          lastSaved={stepState.lastSaved}
        />
        
        <PathwayNavigation
          onSave={onSave}
          helpContent={pathway.stepHelp[stepState.number]}
        />
      </div>

      <div className="step-content">
        {children}
      </div>

      {pathway.showLegalDisclaimer && (
        <div className="step-footer">
          <LegalDisclaimer variant="inline" />
        </div>
      )}
    </div>
  );
};

// StepSection Component
export const StepSection = ({ title, description, children }) => (
  <div className="pathway-step-section">
    {title && (
      <div className="section-header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    )}
    <div className="section-content">
      {children}
    </div>
  </div>
);