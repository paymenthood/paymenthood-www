---
title: "How to Improve Your Payment Approval Rate"
description: "A few percent of your legitimate payments get declined for no good reason — silent lost revenue. Why good cards get refused, and how to recover those sales."
date: 2026-08-27
tags: [payments]
hero: /assets/images/blog/how-to-improve-your-payment-approval-rate.svg
image: /assets/images/og/blog/how-to-improve-your-payment-approval-rate.jpg
---

Most stores watch for payments that *fail loudly* — the error message, the stuck
order. Far more revenue leaks out quietly, through payments that were perfectly
legitimate and simply weren't approved. A shopper with a good card taps pay, the
issuer says no for a reason that has nothing to do with them, and the sale is gone.
No error to investigate, no ticket — just a slightly lower number at the end of the
month.

That number has a name: your **payment approval rate** (or authorisation rate) — the
share of attempted payments that actually get approved. Even a checkout that "works
fine" leaves a few percent on the table, and at any real volume a few percent is a
salary, or a runway.

## Why good customers get declined

Not every decline is the customer's fault or the customer's choice. The recoverable
ones cluster around a few causes:

- **Soft declines.** The issuer returns a temporary "no" — a risk-model flag, a
  *do-not-honour*, a velocity check. The card is fine; the same payment often
  succeeds moments later or through a different path.
- **A single provider's ceiling.** Your one payment provider has one relationship
  with the card networks and one risk profile. Its approval rate *is* your ceiling —
  and a different provider or acquirer may well approve the exact same card.
- **Cross-border penalties.** A card issued in one country, charged through an
  acquirer in another, is more likely to be declined or flagged. A local acquirer for
  that market would have approved it.
- **Expired or reissued cards.** Without network tokens or an account-updater path, a
  card that was reissued this month fails a payment that a refreshed credential would
  have cleared.
- **No retry.** A payment that would have succeeded on a second attempt is written off
  after the first, because nothing tried again.

The theme across all of them: the payment was *recoverable*, and nothing recovered it.

## What actually moves the number

Improving approval rate isn't one trick; it's a handful of disciplines:

1. **Tell soft declines from hard ones.** A timeout or a do-not-honour is worth
   retrying; *insufficient funds* or a *stolen card* is not — retrying a genuine hard
   decline just annoys the issuer and can look like card testing. The distinction is
   everything.
2. **Retry recoverable declines through another provider.** A soft decline on
   provider A is often an approval on provider B. This alone recovers a meaningful
   slice.
3. **Route to the strongest provider for that payment.** Send a card to the acquirer
   most likely to approve it — by region, card type or historical performance.
4. **Use local acquiring where you can**, so cross-border penalties don't apply.
5. **Keep credentials fresh** with network tokenisation / account updater, so
   reissued cards don't silently fail.

## The catch: this needs more than one provider

Every lever above assumes you can send a payment down more than one path, decide
which, and retry across them — which means multiple providers, retry logic that
classifies declines correctly, and routing rules that live somewhere you can change.
Build that per-provider and it's a project on its own; it's also exactly what a
[payment orchestration platform](/blog/what-is-payment-orchestration/) does, and the
same machinery that provides
[failover when a provider goes down](/blog/payment-gateway-downtime-failover/).

## How PaymentHood lifts your approval rate

[PaymentHood](/) sits in front of your providers, so a recoverable decline doesn't
end the sale: a **soft-declined payment can be retried through another provider**,
and transactions can be **routed to the provider most likely to approve** them for a
given market or card — all through one integration, across {{ site.provider_floor }}
providers. It distinguishes technical and soft declines from genuine hard ones, so it
recovers the sales worth recovering and leaves the real declines alone. Webhook
verification and server-side confirmation are handled once, centrally, and there's no
per-transaction fee from PaymentHood.

Because the routing and retry logic lives in configuration rather than your checkout,
raising your approval rate becomes a matter of connecting the right providers — not
rebuilding your payment stack.

## Where PaymentHood fits

If your checkout "works" but a few percent of good payments quietly don't go through,
that gap is recoverable revenue, not a cost of doing business. PaymentHood connects
your store to {{ site.provider_floor }} providers through one free integration, with
decline-aware retries, routing, failover, webhook verification and server-side
confirmation built in. Free plugins are available for
[WooCommerce](/integrations/woocommerce/), [WHMCS](/integrations/whmcs/), VirtueMart,
Phoca Cart and J2Commerce.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see what you could route across.
