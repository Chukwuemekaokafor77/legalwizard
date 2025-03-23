import React from 'react';

const FormDeliveryStep = ({ forms, courtInfo }) => {
  return (
    <div className="delivery-step">
      <h3>Application Package Ready</h3>
      
      <div className="download-section">
        <h4>Generated Forms</h4>
        <div className="form-list">
          {forms.map((form, index) => (
            <div key={index} className="form-item">
              <span>{form.name}</span>
              <a 
                href={form.previewUrl} 
                download={form.name}
                className="download-button"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="submission-instructions">
        <h4>Submission Instructions</h4>
        <p>{courtInfo?.submissionInstructions || `
          1. Print all documents single-sided
          2. Assemble in the order listed
          3. File with ${courtInfo?.courtName || 'the court'} in person or by mail
        `}</p>
      </div>
    </div>
  );
};

export default FormDeliveryStep;