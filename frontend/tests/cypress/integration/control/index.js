const baseUrl = Cypress.config('baseUrl');
const me = require('../../fixtures/me');
const invoices = require('../../fixtures/invoicesScanned');
const ibans = require('../../fixtures/ibans');
const accountingPreferences = require('../../fixtures/accountingPreferences');
const companyWithComplementaryInfos = require('../../fixtures/companyWithComplementaryInfos');
const invoice = require('../../fixtures/invoiceScanned');
const partners = require('../../fixtures/partners');
const searchCompanies = require('../../fixtures/searchCompanies');
const company = require('../../fixtures/company');
const checkIban = require('../../fixtures/checkIban');
const createPartner = {
  data: {
    createPartner: {
      ...company.data.company,
      status: 'ALREADY'
    }
  }
}
const updateInvoice = require('../../fixtures/invoice');
updateInvoice.status = 'TO_PAY';

describe('Control', () => {
  context('Draft ('+baseUrl+')', async () => {
    it('Control Invoice', () => {
      localStorage.setItem('token', me.data.me.token);
      cy.visitStubbed('/purchase/draft', {
        me: me,
        invoices: invoices,
        invoice: invoice,
        accountingPreferences: accountingPreferences,
        companyWithComplementaryInfos: companyWithComplementaryInfos,
        ibans: ibans,
        checkIban: checkIban,
        partners: partners,
        searchCompanies: searchCompanies,
        createPartner: createPartner,
        updateInvoice: updateInvoice
      });
      cy.get('body').find('.btn-invoice-scanned').click();
      cy.url().should('equal', `${baseUrl}/invoice/draft/${invoice.data.invoice.id}`);

      cy.get('body').find('.form-partner-selected .ant-btn').click();
      cy.get('body').find('.form-partner-selected .ant-btn').should('have.class', 'cancel');
      cy.get('body').find('.search-autocomplete').should('exist');

      cy.get('body').find('.form-partner-selected .ant-btn').click();
      cy.get('body').find('.form-partner-selected .ant-btn').should('not.have.class', 'cancel');
      cy.get('body').find('.search-autocomplete').should('not.exist');

      cy.get('body').find('.form-partner-selected .ant-btn').click();

      cy.get('body').find('.search-autocomplete input').first().type('adfab');
      cy.get('body').find('.search-autocomplete .ant-btn-primary').click();

      cy.get('body').find('.search-result-item:nth-child(1) .option-cta .ant-btn-default').click();
      cy.get('body').find('.search-autocomplete').should('not.exist');

      cy.get('body').find('.partner-name').contains('TEST');

      cy.get('body').find('#dueDate input').click();
      cy.get('body').find('.ant-calendar-selected-day').click();

      cy.get('body').find('#number').first().type('qsdf');

      cy.get('body').find('.btn-control-validate').click();

      cy.url().should('equal', `${baseUrl}/purchase/bills`);
    });
  });
});
