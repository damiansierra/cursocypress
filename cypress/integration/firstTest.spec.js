/// <reference types="cypress" />

const { getSyntheticLeadingComments } = require("typescript")
const { listenerCount } = require("process")

describe('Test with backend', () => {

    beforeEach('login to the app', () => {
        cy.server()
        cy.route('GET', '**/tags', 'fixture:tags.json')
        cy.loginTopApplication()
    })

    it.skip('verify correct request and response', () => {

        cy.server()
        cy.route('POSt', '**/articles').as('postArticles')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('this is a title')
        cy.get('[formcontrolname="description"]').type('this is a description')
        cy.get('[formcontrolname="body"]').type('this is a body of the Article')
        cy.contains('Publish Article').click()

        cy.wait('@postArticles')
        cy.get('@postArticles').then(xhr => {
            console.log(xhr)
            expect(xhr.status).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('this is a body of the Article')
            expect(xhr.response.body.article.description).to.equal('this is a description')
        })
    })

    it.only('should gave tags  with routing object', () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')
    })

    it('very global feed likes count', () => {

        cy.route('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
        cy.route('GET', '**/articles*', 'fixture:articles.json')

        cy.contains('Global Feed').click()
        cy.get('app-article-list button').then(listofbuttons => {
            expect(listofbuttons[0]).to.contain('0')
            expect(listofbuttons[1]).to.contain('1')

        })

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            cy.route('POST', '**/articles/' + articleLink + 'favorite', file)
        })

        cy.get('app-article-list button').eq(1).click()
            .should('contain', '2')
    })

    it('delete a new article in a global feed', () => {

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "test",
                "description": "test",
                "body": "test"
            }
        }


        cy.get('@token').then(token => {

            cy.request({
                url: 'https://conduit.productionready.io/api/articles',
                headers: { 'Authorization': 'Token ' + token },
                method: 'POST',
                body: bodyRequest
            }).then(response => {
                expect(response.status).to.equal(200)
            })

            // cy.contains('Global Feed').click()
            // cy.get('.article-preview').first().click()
            // cy.get('.article-actions').contains('Delete Article').click()

            cy.request({
                url: 'https://conduit.productionready.io/api/articles?limit=10&offset=0',
                headers: { 'Authorization': 'Token ' + token },
                method: 'GET'
            }).its('body').then(body => {
                expect(body.articles[0].title.not.to.equal('test'))
            })
        })
    })
})