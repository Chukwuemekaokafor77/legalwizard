import React from 'react';
import { useDropzone } from 'react-dropzone';

const DocumentUploadStep = ({ pathway, documents, onUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: pathway.documentRequirements.reduce((acc, req) => {
      req.acceptedFormats.forEach(format => {
        acc[format] = [];
      });
      return acc;
    }, {}),
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach(file => {
        onUpload(file);
      });
    }
  });

  return (
    <div className="document-step">
      <h3>Required Documents</h3>
      <div className="document-requirements">
        {pathway.documentRequirements.map(req => (
          <div key={req.id} className="requirement-card">
            <h4>{req.title}</h4>
            <p>{req.description}</p>
            <div className="specs">
              <span>Accepted Formats: {req.acceptedFormats.join(', ')}</span>
              <span>Max Size: {(req.maxSize / 1024 / 1024).toFixed(1)}MB</span>
            </div>
          </div>
        ))}
      </div>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop documents here, or click to select</p>
      </div>

      <div className="uploaded-files">
        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            <span>{doc.name}</span>
            <span className="file-size">
              {(doc.size / 1024 / 1024).toFixed(2)}MB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUploadStep;