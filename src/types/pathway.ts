export interface PathwayConfig {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly requiresAccount: boolean;
  readonly estimatedTime: string;
  readonly documentRequirements: DocumentRequirement[];
  readonly formSections: FormSection[];
  readonly glossary?: Glossary;
  readonly confirmationRequirements: ConfirmationRequirement[];
  readonly submissionText: SubmissionText;
  readonly stepHelp?: { [key: number]: string[] };
  readonly descriptionRequirements: DescriptionRequirements;
  readonly verificationSteps: string[];
  readonly securityNotice: string;
  readonly legalTerms: string;
  readonly submissionGuidance?: string;
  readonly documentGuidance?: string;
}

export interface DocumentRequirement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly acceptedFormats: string[];
  readonly maxSize: number;
  readonly optional?: boolean;
  readonly advisory?: string;
}

export interface FormSection {
  readonly id: string;
  readonly title: string;
  readonly fields: Field[];
  readonly description?: string;
}

export interface Field {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'date' | 'dropdown' | 'textarea' | 'number';
  readonly required: boolean;
  readonly options?: SelectOption[];
  readonly helpContent?: HelpContent;
  readonly legalTerm?: string;
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface HelpContent {
  readonly title: string;
  readonly text: string;
}

interface Glossary {
  readonly [term: string]: {
    readonly definition: string;
    readonly reference: string;
  };
}

export interface DescriptionRequirements {
  readonly charLimit: number;
  readonly minChars: number;
  readonly optional: boolean;
  readonly guidance: string;
  readonly tips: string[];
  readonly showTips?: boolean;
  readonly tipsTitle?: string;
}

export interface ConfirmationRequirement {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface SubmissionText {
  readonly default: string;
  readonly processing: string;
}