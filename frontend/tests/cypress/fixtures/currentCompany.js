module.exports = {
  data: {
    currentCompany: {
      ...(require('./company.js').data.company),
      status: 'SELF',
      kycStatus: 'VALIDATED',
      kycStep: 'IBAN',
      provisionningStrategy: 'TOPUP'
    }
  }
}
