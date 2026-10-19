const getModelNameFromItem = (type) => {
  switch (type) {
    case 'problems':
      return 'Problem';
    case 'solutions':
      return 'Solution';
    case 'applications':
      return 'Application';
    case 'company-products':
      return 'CompanyProduct';
    default:
      return '';
  }
};

module.exports = {
  getModelNameFromItem,
};
