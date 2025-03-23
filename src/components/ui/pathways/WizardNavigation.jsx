import React from 'react';
import { ChevronLeft, ChevronRight, Save, Check, Circle, AlertTriangle } from 'lucide-react';

const WizardNavigation = ({
  currentStep,
  totalSteps,
  currentSection,
  onNext,
  onPrevious,
  isLastStep,
  isNextDisabled,
  onSave,
  isSaving,
  completedSteps,
  allowSave,
  isGuest,
  validationErrors
}) => {
  const progress = Math.round((currentStep / totalSteps) * 100);
  const isCompleted = completedSteps.includes(currentStep);

  return (
    <div className="wizard-navigation">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          <div className="progress-indicator">
            {validationErrors > 0 ? (
              <AlertTriangle size={16} className="error-indicator" />
            ) : isCompleted ? (
              <Check size={16} className="completed-indicator" />
            ) : (
              <Circle size={16} className="current-indicator" />
            )}
          </div>
        </div>
      </div>

      <div className="navigation-content">
        <div className="section-info">
          <h4>{currentSection?.title || `Step ${currentStep}`}</h4>
          <span>{currentStep}/{totalSteps}</span>
        </div>

        <div className="control-group">
          <button
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="nav-button"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {allowSave && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="nav-button"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : isGuest ? 'Save Copy' : 'Save'}
            </button>
          )}

          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="nav-button"
          >
            {isLastStep ? 'Submit' : 'Next'}
            {!isLastStep && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardNavigation;