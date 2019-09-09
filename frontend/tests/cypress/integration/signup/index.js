const baseUrl = Cypress.config('baseUrl');
const me = require('../../fixtures/me');
const invoicesEmpty = require('../../fixtures/invoicesEmpty');

describe('Signup', () => {
    context('Signup ('+baseUrl+')', async () => {
      it('Check input', () => {
        cy.visitStubbed('/signup', {
          signup: {
            data: {
              signup: me.data.me
            }
          }
        });
        cy.get('.form-signup button').click();
        cy.get('.ant-form-explain').should('have.length', 5);
        cy.get('.form-signup #firstname').first().type('Hello');
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 4);
        cy.get('.form-signup #lastname').first().type('Hello');
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 3);
        cy.get('.form-signup #email').first().type('Hello1@hello.fr');
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 3);
        cy.get('.form-signup #password').first().type('Hello1@hello.fr');
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 2);
        cy.get('.form-signup #confirm-password').first().type('Hello2@hello.fr');
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 2);
        cy.get('.form-signup #confirm-password').first().clear();
        cy.get('.form-signup #confirm-password').first().type('Hello1@hello.fr');
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 1);
        cy.get('.form-signup #cgu').first().check();
        cy.get('.form-signup').submit();
        cy.get('.ant-form-explain').should('have.length', 0);
      });

      it('Invalid input values', () => {

        const signup = {
          "errors": [
            {
              "message": [
                {
                  "target": {
                    "enabled": true,
                    "lastCguAccept": "2019-02-07T06:28:57.568Z",
                    "lastLogin": "2019-02-07T06:28:57.568Z",
                    "createdAt": "2019-02-07T06:28:57.568Z",
                    "updatedAt": "2019-02-07T06:28:57.568Z",
                    "firstname": "Hello1@hello.fr",
                    "lastname": "Hello1@hello.fr",
                    "email": "Hello1@hello.fr",
                    "password": "Hello1@hello.fr"
                  },
                  "value": "Hello1@hello.fr",
                  "property": "firstname",
                  "children": [],
                  "constraints": {
                    "matches": "firstname must match /^[a-zA-Z-\\s]+$/ regular expression"
                  }
                },
                {
                  "target": {
                    "enabled": true,
                    "lastCguAccept": "2019-02-07T06:28:57.568Z",
                    "lastLogin": "2019-02-07T06:28:57.568Z",
                    "createdAt": "2019-02-07T06:28:57.568Z",
                    "updatedAt": "2019-02-07T06:28:57.568Z",
                    "firstname": "Hello1@hello.fr",
                    "lastname": "Hello1@hello.fr",
                    "email": "Hello1@hello.fr",
                    "password": "Hello1@hello.fr"
                  },
                  "value": "Hello1@hello.fr",
                  "property": "lastname",
                  "children": [],
                  "constraints": {
                    "matches": "lastname must match /^[a-zA-Z-\\s]+$/ regular expression"
                  }
                }
              ],
              "locations": [{ "line": 63, "column": 3 }],
              "path": ["signup"],
              "extensions": {
                "code": "INTERNAL_SERVER_ERROR",
                "exception": {
                  "response": [
                    {
                      "target": {
                        "enabled": true,
                        "lastCguAccept": "2019-02-07T06:28:57.568Z",
                        "lastLogin": "2019-02-07T06:28:57.568Z",
                        "createdAt": "2019-02-07T06:28:57.568Z",
                        "updatedAt": "2019-02-07T06:28:57.568Z",
                        "firstname": "Hello1@hello.fr",
                        "lastname": "Hello1@hello.fr",
                        "email": "Hello1@hello.fr",
                        "password": "Hello1@hello.fr"
                      },
                      "value": "Hello1@hello.fr",
                      "property": "firstname",
                      "children": [],
                      "constraints": {
                        "matches": "firstname must match /^[a-zA-Z-\\s]+$/ regular expression"
                      }
                    },
                    {
                      "target": {
                        "enabled": true,
                        "lastCguAccept": "2019-02-07T06:28:57.568Z",
                        "lastLogin": "2019-02-07T06:28:57.568Z",
                        "createdAt": "2019-02-07T06:28:57.568Z",
                        "updatedAt": "2019-02-07T06:28:57.568Z",
                        "firstname": "Hello1@hello.fr",
                        "lastname": "Hello1@hello.fr",
                        "email": "Hello1@hello.fr",
                        "password": "Hello1@hello.fr"
                      },
                      "value": "Hello1@hello.fr",
                      "property": "lastname",
                      "children": [],
                      "constraints": {
                        "matches": "lastname must match /^[a-zA-Z-\\s]+$/ regular expression"
                      }
                    }
                  ],
                  "status": 400,
                  "message": [
                    {
                      "target": {
                        "enabled": true,
                        "lastCguAccept": "2019-02-07T06:28:57.568Z",
                        "lastLogin": "2019-02-07T06:28:57.568Z",
                        "createdAt": "2019-02-07T06:28:57.568Z",
                        "updatedAt": "2019-02-07T06:28:57.568Z",
                        "firstname": "Hello1@hello.fr",
                        "lastname": "Hello1@hello.fr",
                        "email": "Hello1@hello.fr",
                        "password": "Hello1@hello.fr"
                      },
                      "value": "Hello1@hello.fr",
                      "property": "firstname",
                      "children": [],
                      "constraints": {
                        "matches": "firstname must match /^[a-zA-Z-\\s]+$/ regular expression"
                      }
                    },
                    {
                      "target": {
                        "enabled": true,
                        "lastCguAccept": "2019-02-07T06:28:57.568Z",
                        "lastLogin": "2019-02-07T06:28:57.568Z",
                        "createdAt": "2019-02-07T06:28:57.568Z",
                        "updatedAt": "2019-02-07T06:28:57.568Z",
                        "firstname": "Hello1@hello.fr",
                        "lastname": "Hello1@hello.fr",
                        "email": "Hello1@hello.fr",
                        "password": "Hello1@hello.fr"
                      },
                      "value": "Hello1@hello.fr",
                      "property": "lastname",
                      "children": [],
                      "constraints": {
                        "matches": "lastname must match /^[a-zA-Z-\\s]+$/ regular expression"
                      }
                    }
                  ],
                  "stacktrace": [
                    "Error: An instance of User has failed the validation:",
                    " - property firstname has failed the following constraints: matches ",
                    ",An instance of User has failed the validation:",
                    " - property lastname has failed the following constraints: matches ",
                    "",
                    "    at UsersService.<anonymous> (/var/www/html/src/common/services/users.service.ts:34:13)",
                    "    at Generator.next (<anonymous>)",
                    "    at fulfilled (/var/www/html/src/common/services/users.service.ts:16:58)",
                    "    at process.internalTickCallback (internal/process/next_tick.js:77:7)"
                  ]
                }
              }
            }
          ],
          "data": { "signup": null }
        };
        cy.visitStubbed('/signup', {
          signup: signup
        });
        cy.get('.form-signup #firstname').first().type('Hello@hello.fr');
        cy.get('.form-signup #lastname').first().type('Hello@hello.fr');
        cy.get('.form-signup #email').first().type('Hello1@hello.fr');
        cy.get('.form-signup #password').first().type('Hello1@hello.fr');
        cy.get('.form-signup #confirm-password').first().type('Hello1@hello.fr');
        cy.get('.form-signup #cgu').first().check();
        cy.get('.form-signup button').click();
        cy.get('body').find('.ant-alert-message').should('exist');
        cy.get('.ant-alert-message').should('have.length', 2);
      });

      it('Email exist', () => {
        const signup = {
          "errors": [
            {
              "message": "api.error.signup_email_exist",
              "locations": [{ "line": 63, "column": 3 }],
              "path": ["signup"],
              "extensions": {
                "code": "INTERNAL_SERVER_ERROR",
                "exception": {
                  "response": "api.error.signup_email_exist",
                  "status": 400,
                  "message": "api.error.signup_email_exist",
                  "stacktrace": [
                    "Error: api.error.signup_email_exist",
                    "    at AuthResolvers.<anonymous> (/var/www/html/src/auth/auth.resolvers.ts:25:13)",
                    "    at Generator.next (<anonymous>)",
                    "    at fulfilled (/var/www/html/src/auth/auth.resolvers.ts:16:58)",
                    "    at process.internalTickCallback (internal/process/next_tick.js:77:7)"
                  ]
                }
              }
            }
          ],
          "data": { "signup": null }
        };
        cy.visitStubbed('/signup', {
          signup: signup
        });
        cy.get('.form-signup #firstname').first().type('Hello');
        cy.get('.form-signup #lastname').first().type('Hello');
        cy.get('.form-signup #email').first().type('Hello1@hello.fr');
        cy.get('.form-signup #password').first().type('Hello1@hello.fr');
        cy.get('.form-signup #confirm-password').first().type('Hello1@hello.fr');
        cy.get('.form-signup #cgu').first().check();
        cy.get('.form-signup button').click();
        cy.get('body').find('.ant-alert-message').should('exist');
      });

      it('Invalid resend email', () => {
        const refreshConfirmationTokenUserError = {
          "errors": [
            {
              "message": "api.error.user.invalid_confirmation_token",
              "locations": [{ "line": 2, "column": 3 }],
              "path": ["activateUser"],
              "extensions": {
                "code": "INTERNAL_SERVER_ERROR",
                "exception": {
                  "response": "api.error.user.invalid_confirmation_token",
                  "status": 400,
                  "message": "api.error.user.invalid_confirmation_token",
                  "stacktrace": [
                    "Error: api.error.user.invalid_confirmation_token",
                    "    at UsersService.<anonymous> (/var/www/html/src/common/services/users.service.ts:120:13)",
                    "    at Generator.next (<anonymous>)",
                    "    at fulfilled (/var/www/html/src/common/services/users.service.ts:16:58)",
                    "    at process.internalTickCallback (internal/process/next_tick.js:77:7)"
                  ]
                }
              }
            }
          ],
          "data": { "activateUser": null }
        };

        cy.visitStubbed('/signup-confirm-email', {
          refreshConfirmationTokenUser: refreshConfirmationTokenUserError
        });
        cy.get('.form-signup-activate #email').first().type('Hello1@hello.fr');
        cy.get('.form-signup-activate button').click();
        cy.get('body').find('.ant-alert-message').should('exist');
      });

      it('Confirm error', () => {
        const activateUser = {
          "errors": [
            {
              "message": "api.error.user.invalid_confirmation_token",
              "locations": [{ "line": 2, "column": 3 }],
              "path": ["activateUser"],
              "extensions": {
                "code": "INTERNAL_SERVER_ERROR",
                "exception": {
                  "response": "api.error.user.invalid_confirmation_token",
                  "status": 400,
                  "message": "api.error.user.invalid_confirmation_token",
                  "stacktrace": [
                    "Error: api.error.user.invalid_confirmation_token",
                    "    at UsersService.<anonymous> (/var/www/html/src/common/services/users.service.ts:120:13)",
                    "    at Generator.next (<anonymous>)",
                    "    at fulfilled (/var/www/html/src/common/services/users.service.ts:16:58)",
                    "    at process.internalTickCallback (internal/process/next_tick.js:77:7)"
                  ]
                }
              }
            }
          ],
          "data": { "activateUser": null }
        };

        cy.visitStubbed('/login/965dd5b6f70874ab6a511ea6591a30d1debe6ee28b53eaad68fa64e5def8bf24', {
          activateUser: activateUser
        });
        cy.get('#form-signin #email').first().type('Hello1@hello.fr');
        cy.get('#form-signin #password').first().type('Hello1@hello.fr');
        cy.get('#form-signin button').click();
        cy.get('body').find('.ant-alert-message').should('exist');
      });

      it('Confirm success', () => {
        cy.visitStubbed('/login/965dd5b6f70874ab6a511ea6591a30d1debe6ee28b53eaad68fa64e5def8bf24', {
          activateUser: { data: { activateUser: true } },
          signin: { data: { signin: me.data.me } },
          invoices: invoicesEmpty
        });
        cy.get('#form-signin #email').first().type('Hello1@hello.fr');
        cy.get('#form-signin #password').first().type('Hello1@hello.fr');
        cy.get('#form-signin button').click();
        cy.url().should('equal', `${baseUrl}/`);
      });

      it('Success', () => {
        cy.visitStubbed('/signup', {
          signup: { data: { signup: me.data.me } },
        });
        cy.get('.form-signup #firstname').first().type('Hello');
        cy.get('.form-signup #lastname').first().type('Hello');
        cy.get('.form-signup #email').first().type('Hello1@hello.fr');
        cy.get('.form-signup #password').first().type('Hello1@hello.fr');
        cy.get('.form-signup #confirm-password').first().type('Hello1@hello.fr');
        cy.get('.form-signup #cgu').first().check();
        cy.get('.form-signup button').click();
        cy.url().should('equal', `${baseUrl}/signup-success`);
      });
    });
});
