module.exports = {
  data: {
    ...(require('./company.js').data.company),
    __typename: 'Partner'
  }
}
