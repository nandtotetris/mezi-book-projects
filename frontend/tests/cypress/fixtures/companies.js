module.exports = {
  data: {
    companies: {
      total: 1,
      rows: [
        require('./company.js').data.company
      ],
      __typename: 'Companies'
    }
  }
}
