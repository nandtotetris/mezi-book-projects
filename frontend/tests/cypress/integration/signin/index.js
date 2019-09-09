const baseUrl = Cypress.config('baseUrl');
const me = require('../../fixtures/me');
const invoicesEmpty = require('../../fixtures/invoicesEmpty');

describe('Signin', () => {
  context('Signin ('+baseUrl+')', async () => {
    it('Signin invalid back', () => {
      const signin = {
        "errors": [
          {
            "message": "api.error.signin",
            "locations": [{ "line": 63, "column": 3 }],
            "path": ["signin"],
            "extensions": {
              "code": "INTERNAL_SERVER_ERROR",
              "exception": {
                "response": "api.error.signin",
                "status": 400,
                "message": "api.error.signin",
                "stacktrace": [
                  "Error: api.error.signin",
                  "    at AuthResolvers.<anonymous> (/var/www/html/src/auth/auth.resolvers.ts:42:13)",
                  "    at Generator.next (<anonymous>)",
                  "    at fulfilled (/var/www/html/src/auth/auth.resolvers.ts:16:58)",
                  "    at process.internalTickCallback (internal/process/next_tick.js:77:7)"
                ]
              }
            }
          }
        ],
        "data": { "signin": null }
      };

      cy.visitStubbed('/login', {
        signin: signin
      });
      cy.get('#form-signin #email').first().type('Hello2@hello.fr');
      cy.get('#form-signin #password').first().type('Hello2@hello.fr');
      cy.get('#form-signin button').click();
      cy.get('body').find('.ant-alert-message').should('exist');
    });

    it('Signin invalid front', () => {
      cy.visitStubbed('/login', {
        signin: {
          data: {
            signin: me.data.me
          }
        }
      });
      cy.get('#form-signin button').click();
      cy.get('#form-signin').submit();
      cy.get('.ant-form-explain').should('have.length', 2);
      cy.get('#email').first().type('Hello1@hello.fr');
      cy.get('#form-signin').submit();
      cy.get('.ant-form-explain').should('have.length', 1);
      cy.get('#form-signin button').click();
      cy.get('#form-signin').submit();
      cy.get('.ant-form-explain').should('have.length', 1);
      cy.get('#password').first().type('Hello1@hello.fr');
      cy.get('#form-signin').submit();
      cy.get('.ant-form-explain').should('have.length', 0);
    });

    it('Signin', () => {
      cy.visitStubbed('/login', {
        signin: { data: { signin: me.data.me } },
        me: me,
        invoices: invoicesEmpty
      });
      cy.get('#form-signin #email').first().type('Hello1@hello.fr');
      cy.get('#form-signin #password').first().type('Hello1@hello.fr');
      cy.get('#form-signin button').click();
      cy.url().should('equal', `${baseUrl}/`);
    });
  });
});
