import React from 'react';
import { X, LifeBuoy } from 'lucide-react';

const PathwayHelpModal = ({ content, onClose }) => {
  return (
    <div className="help-modal-overlay">
      <div className="help-modal-content">
        <div className="modal-header">
          <div className="title-group">
            <LifeBuoy size={24} className="help-icon" />
            <h3>Pathway Assistance</h3>
          </div>
          <button onClick={onClose} className="close-button">
            <X size={24} className="close-icon" />
          </button>
        </div>

        <div className="modal-body">
          {content?.title && <h4 className="help-title">{content.title}</h4>}
          {content?.text && <p className="help-text">{content.text}</p>}
          
          {content?.examples && (
            <div className="examples-section">
              <h5 className="examples-heading">Examples</h5>
              <ul className="examples-list">
                {content.examples.map((ex, i) => (
                  <li key={i} className="example-item">{ex}</li>
                ))}
              </ul>
            </div>
          )}

          {content?.contact && (
            <div className="contact-section">
              <a href={`mailto:${content.contact}`} className="contact-link">
                Contact Support
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathwayHelpModal;