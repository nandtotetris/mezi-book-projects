module.exports = {
  data: {
    partners: {
      total: 1,
      rows: [require('./partner.js').data.company],
      __typename: 'Partners'
    }
  }
}
