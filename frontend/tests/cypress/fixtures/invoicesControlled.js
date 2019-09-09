module.exports = {
  data: {
    invoices: {
      total: 1,
      rows: [
        require('./invoiceControlled.js').data.invoice
      ],
      __typename: 'Invoices'
    }
  }
}
