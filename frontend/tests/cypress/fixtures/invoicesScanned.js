module.exports = {
  data: {
    invoices: {
      total: 1,
      rows: [
        require('./invoiceScanned.js').data.invoice
      ],
      __typename: 'Invoices'
    }
  }
}
