import * as yup from 'yup';

const baseSchema = yup.object().shape({
  jurisdiction: yup.string().required('Jurisdiction is required'),
  caseType: yup.string().required('Case type must be selected')
});

export const getValidationSchema = (pathwayId) => {
  switch (pathwayId) {
    case 'divorce':
      return baseSchema.shape({
        marriageDate: yup.date().required(),
        separationDate: yup.date().required()
      });
    case 'child-support':
      return baseSchema.shape({
        children: yup.array().min(1).required(),
        incomeDocuments: yup.array().min(1)
      });
    default:
      return baseSchema;
  }
};