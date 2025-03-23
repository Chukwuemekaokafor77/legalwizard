// src/data/pathwayConfigurations.ts
import { PathwayConfig } from '@/types/pathway';
import { validatePathwayConfig } from '@/utils/validation';

const baseConfig: Partial<PathwayConfig> = {
  requiresAccount: true,
  securityNotice: 'All documents encrypted using AES-256 standards',
  legalTerms: 'Subject to Family Law Act provisions',
  verificationSteps: [
    'I confirm the accuracy of provided information',
    'I agree to mediation if required'
  ],
  steps: [
    'jurisdiction',
    'case-type',
    'documents',
    'review',
    'submission'
  ]
};

const pathways: PathwayConfig[] = [
  {
    ...baseConfig,
    id: 'joint-divorce',
    title: 'Joint Divorce Application',
    description: 'File for divorce with mutual agreement between spouses',
    estimatedTime: '45 minutes',
    confirmationRequirements: [
      {
        id: 'accuracy',
        label: 'Accuracy Confirmation',
        description: 'I verify all information is correct and accurate'
      },
      {
        id: 'legal-consent',
        label: 'Legal Consent',
        description: 'I understand the legal implications of this filing'
      }
    ],
    submissionText: {
      default: 'Submit Divorce Application',
      processing: 'Filing with Provincial Court'
    },
    descriptionRequirements: {
      charLimit: 2000,
      minChars: 100,
      optional: false,
      guidance: 'Describe your marital situation in detail',
      tips: [
        'Include marriage date and location',
        'Note any previous separation attempts',
        'List all shared assets'
      ]
    },
    documentRequirements: [
      {
        id: 'marriage-certificate',
        title: 'Marriage Certificate',
        description: 'Official government-issued certificate',
        acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
        maxSize: 5242880,
        advisory: 'Must show complete registration details'
      },
      {
        id: 'separation-agreement',
        title: 'Separation Agreement',
        description: 'Signed agreement showing separation date',
        acceptedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 10485760
      }
    ],
    formSections: [
      {
        id: 'marriage-details',
        title: 'Marriage Information',
        fields: [
          {
            id: 'marriage-date',
            label: 'Date of Marriage',
            type: 'date',
            required: true,
            legalTerm: 'marriage'
          },
          {
            id: 'separation-date',
            label: 'Date of Separation',
            type: 'date',
            required: true,
            helpContent: {
              title: 'Separation Date Requirements',
              text: 'Must be at least one year before filing date'
            }
          }
        ]
      }
    ],
    glossary: {
      'marriage': {
        definition: 'Legally recognized union between two people',
        reference: 'Family Law Act, Section 2'
      }
    }
  },
  {
    ...baseConfig,
    id: 'child-support',
    title: 'Child Support Application',
    description: 'Establish or modify child support payments',
    estimatedTime: '60 minutes',
    confirmationRequirements: [
      {
        id: 'income-verification',
        label: 'Income Verification',
        description: 'I confirm all income sources are disclosed'
      }
    ],
    submissionText: {
      default: 'File Support Agreement',
      processing: 'Calculating Support Payments'
    },
    descriptionRequirements: {
      charLimit: 1500,
      minChars: 50,
      optional: true,
      guidance: 'Describe child care arrangements',
      tips: [
        'Include school schedule details',
        'Note special healthcare needs',
        'List extracurricular activities'
      ]
    },
    documentRequirements: [
      {
        id: 'child-birth-certificate',
        title: "Child's Birth Certificate",
        description: 'For each child covered by application',
        acceptedFormats: ['application/pdf', 'image/jpeg'],
        maxSize: 3145728
      },
      {
        id: 'income-statements',
        title: 'Income Verification',
        description: 'Recent pay stubs or tax returns',
        acceptedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        maxSize: 10485760
      }
    ],
    formSections: [
      {
        id: 'child-details',
        title: 'Children Information',
        fields: [
          {
            id: 'children-count',
            label: 'Number of Children',
            type: 'number',
            required: true
          },
          {
            id: 'custody-arrangement',
            label: 'Current Custody',
            type: 'dropdown',
            options: [
              { value: 'sole', label: 'Sole Custody' },
              { value: 'joint', label: 'Joint Custody' }
            ]
          }
        ]
      }
    ]
  }
];

export const familyLawPathways = pathways.map(config => {
  const errors = validatePathwayConfig(config);
  if (errors.length > 0) {
    throw new Error(`Invalid pathway config ${config.id}: ${errors.join(', ')}`);
  }
  return config;
});