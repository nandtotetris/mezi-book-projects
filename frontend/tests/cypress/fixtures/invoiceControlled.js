module.exports = {
  data: {
    invoice: {
      ...(require('./invoice.js').data.invoice),
      status: 'TO_PAY'
    }
  }
}
