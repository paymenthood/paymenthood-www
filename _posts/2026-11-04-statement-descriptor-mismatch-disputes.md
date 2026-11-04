---
title: "The Charge Your Customer Doesn't Recognise: How Statement Descriptors Create Disputes"
description: "A customer disputes a charge they genuinely made because your name isn't what shows on their bank statement. Why descriptor mismatches happen, and how to fix them."
date: 2026-11-04
tags: [payments, orchestration]
hero: /assets/images/blog/statement-descriptor-mismatch-disputes.jpg
image: /assets/images/og/blog/statement-descriptor-mismatch-disputes.jpg
image_alt: "A card statement line the customer does not recognise, next to the store they actually bought from"
related:
  - /blog/chargebacks-across-multiple-payment-providers/
  - /blog/why-payments-fail/
  - /blog/switch-payment-providers-without-losing-sales/
---

A customer emails support, annoyed: there's a charge on their card statement they
don't recognise, and they want it explained or refunded right now. You look up
the order. It's theirs. It shipped. It was fine three weeks ago. The only thing
wrong is the six words sitting next to the amount on their banking app, which
read nothing like your brand — a payment processor's trading name, an acronym,
a city nobody associates with your store.

Some of these customers email first. A meaningful share skip the email and go
straight to their bank and call it fraud. The bank opens a dispute, you lose the
sale, the processing fee, and a dispute fee on top, and the only thing that was
actually wrong is a line of text nobody at your company chose on purpose.

## Why it happens

- **The descriptor is set by the provider, by default, not by you.** Unless
  someone explicitly configured it, a payment provider ships a statement
  descriptor derived from its own account naming — the provider's legal entity,
  a generic processing alias, or a reseller's brand — not the name a customer
  typed into a search bar to find your store.
- **Every provider formats it differently.** Card networks cap the descriptor at
  a short, fixed length — commonly 22 characters including the prefix — and each
  provider truncates, prefixes or abbreviates your name to fit in its own way.
  Run two providers side by side and the same store can show up as two
  completely different strings on two different customers' statements.
- **The name on the storefront and the name on the statement quietly drift
  apart.** A rebrand, a new trading name, a domain change, or simply using a
  reseller or marketplace plan under the hood — any of these can leave the
  checkout saying one thing and the bank statement saying another, with nobody
  noticing because nobody at the company ever sees their own statement
  descriptor from the customer's side.
- **It looks identical to real fraud.** A customer scanning a statement for
  anything unfamiliar has no way to distinguish "a legitimate purchase with a
  bad descriptor" from "someone else used my card." The safe, rational move for
  them is to dispute first and ask questions never, and most banks make
  disputing a two-tap process inside the app.
- **Nobody measures it until it's a dispute.** There's no dashboard that flags
  "our descriptor confuses people." The first signal is almost always a support
  ticket calling it fraud, or a chargeback with a reason code that translates to
  "cardholder does not recognise transaction" — which is a different, and far
  more preventable, problem than a stolen card.

## How to diagnose it

- **Pull your own card and look.** Make a real purchase through your own
  checkout with a personal card on each provider you run, and read exactly what
  shows up in your banking app a day later. Most teams have never actually done
  this.
- **Check chargeback reason codes, not just chargeback counts.** A cluster
  coded as "transaction not recognised" or "customer disputes quality/receipt of
  goods" immediately after a provider change, a rebrand, or a domain switch
  points at the descriptor, not at fraud or dissatisfied customers.
- **Compare descriptor strings across providers if you run more than one.** If
  the same storefront shows a clean, recognisable name through one provider and
  something cryptic through another, the losses will cluster on whichever
  provider is routing the confusing version.
- **Ask a few recent disputing customers what they actually saw.** Support
  teams rarely ask this question, but "what did your statement say" is usually
  enough to confirm or rule out the descriptor as the cause in under a minute.

## How to fix it

- **Set the descriptor explicitly, on every provider, instead of accepting the
  default.** Most providers let you configure a custom statement descriptor per
  account; the default is a starting point, not a requirement.
- **Keep it short, recognisable, and consistent with how the customer found
  you.** If people search for and recognise "Acme Candles," a descriptor should
  lead with that, not with the holding company name three brands removed from
  the storefront.
- **Re-check it every time you add or switch a provider.** A descriptor that was
  fine on your previous provider does not carry over automatically; it's
  provider-level configuration, and switching providers without resetting it is
  exactly how the drift described above happens.
- **Put the descriptor in your own order confirmation and receipt emails.**
  Telling a customer up front, in writing, "this will appear on your statement
  as X" closes most of the gap before it ever becomes a support ticket, let
  alone a dispute.

## How PaymentHood addresses this

PaymentHood is a [payment orchestration platform](/blog/what-is-payment-orchestration/)
sitting in front of {{ site.provider_floor }} providers, and because every
provider you connect keeps its own account and its own descriptor settings,
switching or adding a provider through PaymentHood doesn't quietly reset what a
customer sees on their statement to a new default. It's one more setting worth
checking per provider at connection time, rather than something that drifts
unnoticed across a growing stack of payment accounts.

## Where PaymentHood fits

If disputes keep arriving coded as "didn't recognise the transaction" rather
than genuine fraud, check what your own statement descriptor actually says
before assuming the customer or the card is the problem. PaymentHood connects
your store to {{ site.provider_floor }} providers through one free integration,
with routing, failover and webhook verification built in, and **no
per-transaction fee** from PaymentHood at any volume. Free plugins are
available for [WooCommerce](/integrations/woocommerce/) and
[WHMCS](/integrations/whmcs/) alongside the other major carts and billing
systems.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which providers let you set a
clean, recognisable descriptor before the next unfamiliar line on a statement
turns into an avoidable chargeback.
