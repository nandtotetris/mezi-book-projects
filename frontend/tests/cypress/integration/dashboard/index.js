const baseUrl = Cypress.config('baseUrl');
const me = require('../../fixtures/me');
const invoices = require('../../fixtures/invoicesEmpty');
const invoicesScanned = require('../../fixtures/invoicesScanned');

describe('Dashboard', () => {
  context('Kyc', async () => {
    it('No company', () => {
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: null,
              kycStep: null,
            }
          }
        }
      }

      localStorage.setItem('token', me.data.me.token);
      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(1)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(1)').should('not.have.class', 'ant-steps-item-process');
    });

    it('Company', () => {
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: null,
              kycStep: 'COMPANY'
            }
          }
        }
      }

      localStorage.setItem('token', me.data.me.token);
      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(1)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(1)').should('have.class', 'ant-steps-item-process');
    });

    it('Personal information', () => {
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: null,
              kycStep: 'PERSONNAL_INFORMATION',
            }
          }
        }
      }

      localStorage.setItem('token', me.data.me.token);
      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(2)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(2)').should('have.class', 'ant-steps-item-process');
    });

    it('Beneficiary', () => {
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: null,
              kycStep: 'BENEFICIARIES',
            }
          }
        }
      }

      localStorage.setItem('token', me.data.me.token);

      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(3)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(3)').should('have.class', 'ant-steps-item-process');
    });

    it('Sign', () => {
      localStorage.setItem('token', me.data.me.token);

      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: null,
              kycStep: 'SIGN',
            }
          }
        }
      }

      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(4)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(4)').should('have.class', 'ant-steps-item-process');
    });

    it('Iban', () => {
      localStorage.setItem('token', me.data.me.token);
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: null,
              kycStep: 'IBAN',
            }
          }
        }
      }

      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(5)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(5)').should('have.class', 'ant-steps-item-process');
    });

    it('Validated company', () => {
      localStorage.setItem('token', me.data.me.token);
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: 'VALIDATED',
              kycStep: 'IBAN',
            }
          }
        }
      }

      cy.visitStubbed('/', {
        me: me,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('not.exist');
    });

    it('Refused company', () => {
      localStorage.setItem('token', me.data.me.token);
      const getMe = {
        data: {
          ...me.data,
          me: {
            ...me.data.me,
            currentCompany: {
              ...me.data.me.currentCompany,
              kycStatus: 'REFUSED',
              kycStep: 'IBAN',
            }
          }
        }
      }

      cy.visitStubbed('/', {
        me: getMe,
        invoices: invoices
      });

      cy.get('body').find('.ant-steps').should('exist');

      cy.get('body').find('.ant-steps-item:nth-child(5)').should('exist');
      cy.get('body').find('.ant-steps-item:nth-child(5)').should('have.class', 'ant-steps-item-process');

      cy.get('body').find('.ant-steps-item:nth-child(5) .dot-process.error').should('exist');
    });

    it('No invoices', () => {
      localStorage.setItem('token', me.data.me.token);
      cy.visitStubbed('/', {
        me: me,
        invoices: invoices
      });

      cy.get('body').find('.card-dashboard').should('exist');
      cy.get('body').find('.bloc-invoice-count').should('not.exist');
    });

    it('With invoices', () => {
      localStorage.setItem('token', me.data.me.token);
      cy.visitStubbed('/', {
        me: me,
        invoices: invoicesScanned
      });

      cy.get('body').find('.card-dashboard').should('not.exist');
      cy.get('body').find('.bloc-invoice-count').should('exist');
    });
  });
});
