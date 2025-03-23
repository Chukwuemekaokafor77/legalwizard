import React from 'react';

const DocumentChecklist = ({ requirements, completed }) => (
  <div className="document-checklist">
    <h4>Required Documents</h4>
    {requirements.map(req => (
      <div key={req.id} className={`doc-item ${completed.some(d => d.type === req.id) ? 'completed' : ''}`}>
        <span>{req.title}</span>
        <span className="doc-status">
          {completed.some(d => d.type === req.id) ? '✓' : '✗'}
        </span>
      </div>
    ))}
  </div>
);

export default DocumentChecklist;