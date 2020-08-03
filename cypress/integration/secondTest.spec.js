/// <reference types="cypress" />

const { getSyntheticLeadingComments } = require("typescript")
const { listenerCount } = require("process")

describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        // cy.server()
        cy.loginTopApplication()
    })

    it('very user can log out succesfully', () => {
        cy.contains('Settings').click()
        cy.contains('Or click here to logout').click()
        cy.get('.navbar-nav').should('contain', 'Sign up')
    })
})