# Payout webhooks from treezor

First, read page 80 of the treezor implementation guide. You can find it on the drive.

The payout_webhook paylaod has the IPayout type (check in `src/payment/interface/treezor/payout.interface.ts`).
An example of the _json_ file is in `payout_webhook.json`.

In the Webhook controller, we check the field `object` of the _json_, then we check the status of the `payoutStatus`of the payload.
