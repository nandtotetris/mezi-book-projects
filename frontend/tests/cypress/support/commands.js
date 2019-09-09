// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
const baseUrl = Cypress.config('baseUrl');

Cypress.Commands.add('visitStubbed', (url, operations = {}) => {
  function responseStub(result) {
    return {
      json() {
        return Promise.resolve(result);
      },
      text() {
        return Promise.resolve(typeof result === 'object' ? JSON.stringify(result) : result);
      },
      ok: true,
    };
  }

  function serverStub(path, req) {
    if(req) {

      const { operationName } = JSON.parse(req.body);

      if (Object.keys(operations).indexOf(operationName) !== false) {
        return Promise.resolve(responseStub(operations[operationName]));
      }
    }

    return fetch(path);
  }

  cy.visit(`${url}?bust=${Math.round(Math.random() * 9999999999)}`, {
    onBeforeLoad: (win) => {
      cy.stub(win, 'fetch').callsFake(serverStub).as('fetch stub');
    },
  })
});

Cypress.Commands.add('initStub', (me) => {
  // cy.visit('/');
  localStorage.setItem('token', me.data.me.token);
});
