---
title: "Payment Approved, Then Declined at Capture: When the Authorization Expires Before You Ship"
description: "A card payment was authorized weeks ago, but the capture now fails. Why authorization holds expire, how to catch it, and how to stop losing paid orders."
date: 2026-11-03
tags: [payments, orchestration]
# Held back (2026-11-04): the 'How PaymentHood addresses this' section says PaymentHood surfaces an
# expired authorization as its own state and re-authorizes the order. It does not: PaymentHood has no
# expired-authorization state and no automatic re-authorization (the only re-authorize is the Plaid bank
# link). Rewrite that section to what the product does, add a hero and social card, then delete this line.
published: false
related:
  - /blog/why-payments-fail/
  - /blog/single-payment-processor-limitations/
  - /blog/switch-payment-providers-without-losing-sales/
---

A custom order comes in. The card authorizes cleanly at checkout, the order shows
as paid in your admin, and production starts. Three weeks later — because the item
is made to order, or the part was on backorder, or it shipped from a supplier with
a long lead time — you go to capture the payment on dispatch, and it fails. Not a
decline with a reason you recognise. Something closer to "authorization no longer
valid."

The card was good. The customer didn't cancel anything. Nothing about the order
changed. The only thing that happened is time: the original authorization simply
expired before you asked for the money, and now the hold that used to sit on the
customer's card is gone, as if it never existed.

This is one of the quieter ways a "successful" payment turns into no payment at
all, and it only shows up for businesses that don't capture the moment they
authorize — which is most businesses with any delay between order and dispatch.

## Why it happens

Authorizing a card and capturing the money are two separate steps. An
authorization places a temporary hold and reserves the funds; a capture is the
actual instruction to move them. Card networks only guarantee that hold for a
limited window, and once it passes, the authorization is void whether or not you
ever tried to capture it.

- **The hold window is shorter than people assume.** Most card schemes void an
  uncaptured authorization after roughly a week for ordinary retail. A handful of
  categories — car rental, hotels, some travel — get a longer window by agreement
  with the networks, but a standard e-commerce merchant account doesn't get that
  by default.
- **The window isn't the same everywhere.** It varies by card network, by issuer,
  and sometimes by how your specific provider has configured the merchant
  category. A hold that survives ten days on one processor can vanish on day seven
  through another, for the exact same card.
- **Nothing tells you it's happening.** There's no notification when an
  authorization quietly expires. The hold just disappears from the customer's
  statement, and the first your system hears about it is when the capture call
  comes back declined, days or weeks after the order looked perfectly settled.
- **Fulfilment timelines and payment timelines were designed separately.** A
  made-to-order, backordered, or import-heavy product line can easily take longer
  to ship than any card network's authorization survives, and nobody designed the
  checkout with that mismatch in mind.

The order doesn't fail at checkout, where you'd notice it immediately. It fails at
dispatch, when the goods are ready to go and the business is the least prepared
to chase the customer for a second payment.

## How to diagnose it

- **Look at the gap between authorization time and capture attempt**, order by
  order. If the failures cluster around a particular number of days — seven,
  fourteen — that's the hold window for whatever card or provider processed them,
  not a coincidence.
- **Check the actual decline code on the failed capture**, not just "declined."
  Providers that support delayed capture usually return a specific code for an
  expired or voided authorization, distinct from an insufficient-funds or
  do-not-honour decline. If your capture logic treats all declines the same, this
  is invisible until someone reads the raw response.
- **Correlate against your fulfilment lead time, not your payment logs alone.**
  If average days-to-ship crept up — a supplier delay, a seasonal backlog, a new
  made-to-order product — that's usually the trigger, even though nothing changed
  in your payment integration.

## How to fix it

- **Capture as close to authorization as the business allows.** If goods ship
  same-day or within a couple of days, capture on dispatch and the expiry window
  is rarely a problem. The risk is specific to genuinely delayed fulfilment.
- **Know your actual hold window per provider, not a guess.** Ask the provider
  directly what it is for your merchant category and card mix; "about a week" is
  not a number you can build alerting around.
- **Alert before the window closes, not after.** An order still unshipped as it
  approaches the expiry threshold should raise a flag for someone to act on, so
  you re-authorize the card proactively instead of discovering the failure at the
  worst possible moment — when the item is packed and ready to go.
- **Re-authorize rather than resubmit the same stale capture.** A fresh
  authorization for the same order, taken before the original expires, resets the
  clock; retrying a capture against an authorization that's already void will
  simply fail again.

## How PaymentHood addresses this

PaymentHood is a [payment orchestration platform](/blog/what-is-payment-orchestration/)
sitting in front of {{ site.provider_floor }} providers, and capture is one of the
operations it normalises rather than leaving to each provider's own quirks. Because
the authorization and capture calls for every connected provider go through the
same layer, a capture that fails because the original hold expired is something
the orchestration can surface clearly — as an expired authorization, not a generic
decline — and retry as a fresh authorization against the same order reference
rather than a stale, already-void one.

For businesses where delayed fulfilment is the normal case rather than the
exception, having that distinction visible, and a consistent way to re-authorize
across whichever provider is handling the order, removes a failure mode that
otherwise only turns up weeks after the sale looked complete.

## Where PaymentHood fits

If your order-to-dispatch time regularly stretches past a week, a standing
authorization is not something to assume will still be there when you need it.
PaymentHood connects your store to {{ site.provider_floor }} providers through one
free integration, with routing, failover and webhook verification built in, and
**no per-transaction fee** at any volume. A free plugin is available for
[WooCommerce](/integrations/woocommerce/), alongside WHMCS and the other major
carts and billing systems.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which providers fit a longer
fulfilment cycle before the next delayed order is the one that finds out the hard
way.
