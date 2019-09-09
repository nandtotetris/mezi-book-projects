module.exports = {
  data: {
    searchCompanies: {
      total: 6,
      rows: [
        {
          ...(require('./company.js').data.company),
          status: 'SELF'
        },
        {
          ...(require('./company.js').data.company),
          status: 'UNKNOWN'
        },
        {
          ...(require('./company.js').data.company),
          status: 'UNKNOWN'
        },
        {
          ...(require('./company.js').data.company),
          status: 'UNKNOWN'
        },
        {
          ...(require('./company.js').data.company),
          status: 'UNKNOWN'
        },
        {
          ...(require('./company.js').data.company),
          status: 'UNKNOWN'
        }
      ],
      __typename: 'Companies'
    }
  }
};
