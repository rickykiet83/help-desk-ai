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

## Verify inbound-email route rename

I've updated mailgun to inbound-email route, verify changes
