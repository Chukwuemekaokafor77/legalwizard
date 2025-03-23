// types/document.d.ts
interface LegalDocument {
    id: string;
    title: string;
    type: 'affidavit' | 'contract' | 'certificate';
    content: string;
    metadata: {
      jurisdiction: string;
      effectiveDate: Date;
      parties: string[];
    };
    validationRules: DocumentValidationRule[];
  }