import React from 'react';

const ReviewSubmitStep = ({ pathway, answers, documents, forms, courtInfo, onSubmit, onEdit }) => {
  return (
    <div className="review-step">
      <h3>Review Application</h3>
      
      <div className="review-section">
        <h4>Application Summary</h4>
        <div className="summary-grid">
          <div className="court-info">
            <h5>Filing Court</h5>
            <p>{courtInfo?.courtName}</p>
            <p>{courtInfo?.address}</p>
          </div>
          
          <div className="filing-fee">
            <h5>Estimated Fees</h5>
            <p>${courtInfo?.filingFee || 'Contact court for exact amount'}</p>
          </div>
        </div>
      </div>

      <div className="review-section">
        <h4>Documents to Submit</h4>
        <ul>
          {documents.map((doc, index) => (
            <li key={index}>{doc.name}</li>
          ))}
          {forms.map((form, index) => (
            <li key={`form-${index}`}>{form.name}</li>
          ))}
        </ul>
      </div>

      <div className="action-buttons">
        <button onClick={onEdit}>Edit Application</button>
        <button onClick={onSubmit} className="submit-button">
          {pathway.submissionText.default}
        </button>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;