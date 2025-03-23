export const familyLawPathways = [
    {
      id: 'joint-divorce',
      title: 'Joint Divorce Application',
      description: 'File for divorce with mutual agreement',
      requiresAccount: true,
      estimatedTime: '45 minutes',
      documentRequirements: [
        {
          id: 'marriage-certificate',
          title: 'Marriage Certificate',
          acceptedFormats: ['.pdf', '.jpg'],
          maxSize: 5242880
        }
      ],
      formSections: [],
      steps: ['jurisdiction', 'documents', 'review']
    }
  ];