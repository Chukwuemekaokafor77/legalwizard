import React from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentAnalysisService } from '../../services/pathways';

const IntelligentDocumentUpload = ({ onUpload }) => {
  const documentAnalyzer = new DocumentAnalysisService();

  const processDocument = async (file) => {
    try {
      return await documentAnalyzer.processDocument(file);
    } catch (error) {
      console.error('Document processing failed:', error);
      throw error;
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        const result = await processDocument(file);
        onUpload(result);
      }
    }
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag & drop documents here, or click to select</p>
    </div>
  );
};

export default IntelligentDocumentUpload;