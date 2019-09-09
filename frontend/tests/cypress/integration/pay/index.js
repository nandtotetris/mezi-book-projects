const baseUrl = Cypress.config('baseUrl');
const partner = require('../../fixtures/partner');
const me = require('../../fixtures/me');
const invoices = require('../../fixtures/invoicesControlled');
const representatives = require('../../fixtures/representatives');
const invoice = require('../../fixtures/invoice');
const beneficiaries = require('../../fixtures/beneficiaries');

describe('Pay', () => {
    context('Pay ('+baseUrl+')', async () => {
      it('No company', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = null;
        getMe.data.me.currentCompany.kycStep = null;
        delete getMe.currentCompany;
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices
        });
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.onboarding-start-dialog').should('exist');
        cy.get('.close-dialog').click();
        cy.get('body').find('.open.RightSideBar_sidebar-right').should('not.exist');

        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.onboarding-start-dialog').should('exist');
        cy.get('.body-dialog .ant-btn-primary').click();
        cy.url().should('equal', `${baseUrl}/kyc`);
      });

      it('Personal information', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = null;
        getMe.data.me.currentCompany.kycStep = 'PERSONNAL_INFORMATION';
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices,
          representatives: representatives,
          beneficiaries: beneficiaries
        });
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.onboarding-dialog').should('exist');
        cy.get('.body-dialog .ant-btn-primary').click();
        cy.url().should('equal', `${baseUrl}/kyc/personal-information`);
      });

      it('Beneficiary', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = null;
        getMe.data.me.currentCompany.kycStep = 'BENEFICIARIES';
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices,
          representatives: representatives,
          beneficiaries: beneficiaries
        });
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.onboarding-dialog').should('exist');
        cy.get('.body-dialog .ant-btn-primary').click();
        cy.url().should('equal', `${baseUrl}/kyc/beneficiary`);
      });

      it('Sign', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = null;
        getMe.data.me.currentCompany.kycStep = 'SIGN';
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices,
          representatives: representatives,
          beneficiaries: beneficiaries
        });
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.onboarding-dialog').should('exist');
        cy.get('.body-dialog .ant-btn-primary').click();
        cy.url().should('equal', `${baseUrl}/kyc/sign`);
      });

      it('Iban', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = null;
        getMe.data.me.currentCompany.kycStep = 'IBAN';
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices,
          representatives: representatives,
          beneficiaries: beneficiaries
        });
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.onboarding-fund-dialog').should('exist');
        cy.get('.close-dialog').click();
      });

      it('Need fund for company', () => {
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        const payout = {
          data: {
            payout: [{
              ...invoice.data.invoice,
              status: "PLANNED"
            }]
          }
        };

        localStorage.setItem('token', me.data.me.token);
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices,
          payout: payout,
          checkBalance: {data: {checkBalance:false}}
        });
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body').find('.transfert-dialog').should('exist');
        cy.get('.close-dialog').click();
        cy.get('body').find('.open.RightSideBar_sidebar-right').should('exist');
        cy.get('.close-sidebar-right').click();
        cy.get('body').find('.open.RightSideBar_sidebar-right').should('not.exist');
        cy.get('.btn-invoice-planned').should('exist');
      });

      it('Code > 2000', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        const payout = {
          data: {
            payout: [{
              ...invoice.data.invoice,
              status: "PLANNED"
            }]
          }
        };
        const invoices2000 = {...invoices};
        invoices2000.data.invoices.rows[0].total = 2001;
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices2000,
          partner: partner,
          payout: payout,
          checkBalance: {data: {checkBalance:false}},
          generateCode: {data: {generateCode: {id:1051, __typename: 'Invoice'}}}
        })
        cy.get('.btn-invoice-to-pay').click();
        cy.get('body')
          .find('.code-dialog')
          .should('exist');

        cy.get('#code-0').first().type('1');
        cy.get('#code-1').first().type('2');
        cy.get('#code-2').first().type('3');
        cy.get('#code-3').first().type('4');
        cy.get('#code-4').first().type('5');
        cy.get('#code-5').first().type('6');

        cy.get('body').find('.open.RightSideBar_sidebar-right').should('exist');
      });

      it('topup', () => {
        localStorage.setItem('token', me.data.me.token);
        const invoices100 = {...invoices};
        invoices100.data.invoices.rows[0].total = 100;
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        getMe.data.me.currentCompany.provisionningStrategy = 'TOPUP';
        const payout = {
          data: {
            payout: [{
              ...invoice.data.invoice,
              status: "PLANNED"
            }]
          }
        };
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices100,
          payout: payout,
          checkBalance: {data: {checkBalance:true}}
        });
        cy.get('.btn-invoice-to-pay').click();

        cy.get('body').find('.open.RightSideBar_sidebar-right').should('exist');
      });

      it('topup warning balance', () => {
        localStorage.setItem('token', me.data.me.token);
        const invoices100 = {...invoices};
        invoices100.data.invoices.rows[0].total = 100;
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        getMe.data.me.currentCompany.provisionningStrategy = 'TOPUP';
        const payout = {
          data: {
            payout: [{
              ...invoice.data.invoice,
              estimatedBalance: -1000,
              status: "PLANNED"
            }]
          }
        };
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices100,
          payout: payout,
          checkBalance: {data: {checkBalance:true}}
        });
        cy.get('.btn-invoice-to-pay').click();

        cy.get('body').find('.td-estimatedBalance .warning').should('exist');
      });

      it('Autoload', () => {
        localStorage.setItem('token', me.data.me.token);
        const invoices100 = {...invoices};
        invoices100.data.invoices.rows[0].total = 100;
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        getMe.data.me.currentCompany.provisionningStrategy = 'AUTOLOAD';
        const payout = {
          data: {
            payout: [{
              ...invoice.data.invoice,
              status: "PLANNED"
            }]
          }
        };
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices100,
          payout: payout,
          checkBalance: {data: {checkBalance:true}}
        });
        cy.get('.btn-invoice-to-pay').click();

        cy.get('body').find('.open.RightSideBar_sidebar-right').should('exist');
      });

      it('autload no warning balance', () => {
        localStorage.setItem('token', me.data.me.token);
        const invoices100 = {...invoices};
        invoices100.data.invoices.rows[0].total = 100;
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        getMe.data.me.currentCompany.provisionningStrategy = 'AUTOLOAD';
        const payout = {
          data: {
            payout: [{
              ...invoice.data.invoice,
              estimatedBalance: -1000,
              status: "PLANNED"
            }]
          }
        };
        cy.visitStubbed('/purchase/bills', {
          me: getMe,
          invoices: invoices100,
          payout: payout,
          checkBalance: {data: {checkBalance:true}}
        });
        cy.get('.btn-invoice-to-pay').click();

        cy.get('body').find('.td-estimatedBalance .warning').should('not.exist');
      });

      it('Cancel', () => {
        localStorage.setItem('token', me.data.me.token);
        const getMe = {...me};
        getMe.data.me.currentCompany.kycStatus = 'VALIDATED';
        const invoicesPlanned = {...invoices};
        invoicesPlanned.data.invoices.rows[0].status = 'PLANNED';
        const invoiceToPay = JSON.parse(JSON.stringify(invoices.data.invoices.rows[0]));
        invoiceToPay.status = 'TO_PAY';
        cy.visitStubbed('/purchase/bills', {
          me: me,
          invoices: invoicesPlanned,
          updateInvoiceStatus: {data: {updateInvoiceStatus: invoiceToPay}}
        });
        cy.get('.btn-invoice-planned').click();
        cy.get('body')
          .find('.btn-invoice-to-pay')
          .should('exist');
      });
    });
});
