## Move TicketStatus enum to core constants

move enum TicketStatus to @core/src/constants folder

## Add WEBHOOK_SECRET guard to middleware

@server/src/middleware/require-webhook-secret.ts should check WEBHOOK_SECRET, if it is not exist, return 500 with error

## Simplify webhook secret verification

remove token, signature, we need webhook secret only

webhook secret is mailgun secret, it is encrypted already, we don't need to encrypt it again

## Extract validate utility and update CLAUDE.md

extract validate function in @server/src/routes/users.ts as a utility function and also update @CLAUDE.md to add an instruction for using this

## Write E2E tests for the webhook

write e2e tests for the webhook

## Read secrets and base URL from env file

read webhook_secret and webhook_url from env file. changed webhook_url to api_base_url as well

## Creating a Testing Agent

Create a new agent with:

- Name: e2e-test-writer
- Description: write e2e tests using Playwright

Prompts:

- Write e2e tests for the authentication system. Cover all scenarios and edge cases.
- create a registration page

## Verify inbound-email route rename

I've updated mailgun to inbound-email route, verify changes

## Filtering Tickets

add filtering and make sure filtering part should be a separate component

## Sorting Tickets

- add sorting to tickets table using tanstack table. sorting should happen on the server.
- create 100 tickets using real-life examples. Diversify them so we can see sorting and filtering.

## Pagination

add filtering and make sure filtering part should be a separate component

## Viewing Ticket Details

on the ticket list, when we click on the subject of a ticket, we should see the ticket details in a separate page.

## Assigning Tickets

add the ability to assign a ticket to an agent

## Replying to Tickets

add the ability to reply to tickets. On the ticket details page, show the reply thread below the message and add a form to submit new replies.
