import * as yup from 'yup';

type BaseFormValues = {
  jurisdiction: string;
  caseType: string;
};

type DocumentField = {
  [key: string]: File;
};

type PathwaySchemaType = yup.ObjectSchema<any>;

const createBaseSchema = () => {
  return yup.object().shape({
    jurisdiction: yup.string().required('Jurisdiction is required'),
    caseType: yup.string().required('Case type must be selected')
  }) as any;
};

const createValidationSchema = (documentRequirements: Array<{
  id: string;
  title: string;
  optional?: boolean;
  acceptedFormats: string[];
  maxSize: number;
}>): PathwaySchemaType => {
  let schema = createBaseSchema();

  documentRequirements.forEach(req => {
    if (!req.optional) {
      const documentSchema = yup.mixed<File>()
        .test('fileType', 'Invalid file type', value => 
          req.acceptedFormats.some(format => value?.type?.includes(format))
        )
        .test('fileSize', 'File too large', value => 
          (value?.size || 0) <= req.maxSize
        )
        .required(`${req.title} is required`);

      schema = schema.shape({
        [req.id]: documentSchema
      }) as any;
    }
  });

  return schema;
};

export const familyLawPathways = [
  {
    id: 'joint-divorce',
    title: 'Joint Divorce Application',
    description: 'File for divorce with mutual agreement between spouses',
    requiresAccount: true,
    estimatedTime: '45 minutes',
    steps: ['jurisdiction', 'documents', 'review'],
    documentRequirements: [
      {
        id: 'marriage-certificate',
        title: 'Marriage Certificate',
        description: 'Original government-issued certificate',
        acceptedFormats: ['application/pdf', 'image/jpeg'],
        maxSize: 5242880,
        optional: false,
        fileNameKeywords: ['marriage', 'certificate'],
        templateLink: '/templates/marriage-certificate-guide.pdf',
        requirements: [
          'Must be original or certified copy',
          'Must show complete registration details'
        ]
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
            type: 'date' as const,
            required: true
          }
        ]
      }
    ],
    glossary: {
      'Divorce': {
        definition: 'The legal end of a marriage by court judgment',
        example: 'After living separate for one year, they filed for a divorce.',
        reference: 'Divorce Act (R.S.C., 1985, c. 3)'
      }
    },
    validationSchema: createValidationSchema([
      {
        id: 'marriage-certificate',
        title: 'Marriage Certificate',
        acceptedFormats: ['application/pdf', 'image/jpeg'],
        maxSize: 5242880,
        optional: false
      }
    ])
  }
] satisfies Array<{
  id: string;
  title: string;
  description: string;
  requiresAccount: boolean;
  estimatedTime: string;
  steps: string[];
  documentRequirements: Array<{
    id: string;
    title: string;
    description?: string;
    acceptedFormats: string[];
    maxSize: number;
    optional?: boolean;
    fileNameKeywords?: string[];
    templateLink?: string;
    requirements?: string[];
  }>;
  formSections: Array<{
    id: string;
    title: string;
    fields: Array<{
      id: string;
      label: string;
      type: 'date' | 'number' | 'dropdown' | 'text';
      required?: boolean;
      options?: Array<{ value: string; label: string }>;
    }>;
  }>;
  glossary: Record<string, {
    definition: string;
    example?: string;
    reference?: string;
    relatedTerms?: string[];
  }>;
  validationSchema: PathwaySchemaType;
}>;

// Type exports for consumer components
export type PathwayFormValues = yup.InferType<PathwaySchemaType>;
export type PathwayConfig = typeof familyLawPathways[number];