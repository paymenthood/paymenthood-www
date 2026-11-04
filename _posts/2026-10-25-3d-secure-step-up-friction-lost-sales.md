---
title: "3-D Secure: Why Customers Vanish at the Bank's Verification Screen"
description: "A customer reaches your checkout, gets sent to their bank to verify, and never comes back. Why 3-D Secure step-ups fail, and how to reduce them."
date: 2026-10-25
tags: [payments, checkout]
hero: /assets/images/blog/3d-secure-step-up-friction-lost-sales.jpg
image: /assets/images/og/blog/3d-secure-step-up-friction-lost-sales.jpg
# Held back until the two images above exist in assets/images/blog/ and assets/images/og/blog/.
# Without them the post would publish with a broken hero and a broken social card.
# Delete this line when they are in place.
published: false
related:
  - /blog/why-customers-abandon-checkout-at-the-redirect/
  - /blog/how-to-improve-your-payment-approval-rate/
  - /blog/why-payments-fail/
---

A customer has done everything right. They filled the basket, entered their card
details without a typo, and pressed pay. Then the screen changes to their bank's
branding and asks for a code sent by SMS. And that is where the order ends. No
decline, no error, no abandoned-basket email trigger — just a payment that sits in
"initiated" forever while the customer closes the tab.

In your dashboard this looks almost like nothing. The payment was never authorised, so
it isn't a failed transaction you can retry, and it often isn't counted as a decline
either. It's a gap between two numbers: how many people pressed pay, and how many
payments you actually got.

## Why it happens

3-D Secure is the authentication step between pressing pay and the card being charged.
The modern version (EMV 3DS) is designed to be invisible most of the time: your
provider sends data about the transaction, the issuing bank scores it, and if the bank
is satisfied the payment clears with no visible step at all — the frictionless flow.
When the bank isn't satisfied it issues a challenge, and the customer has to prove who
they are. That challenge is where customers are lost, for reasons that have little to
do with fraud:

- **The code never arrives.** SMS one-time passwords depend on a mobile network
  delivering a message within the customer's patience. Roaming, poor signal, or a
  carrier delay is indistinguishable from "this shop is broken".
- **The customer isn't enrolled.** Some banks require app-based approval, and the
  customer either doesn't have the app installed or has never activated the feature.
- **The challenge window breaks.** Full-page redirects to the bank fail in in-app
  browsers (Instagram, Facebook, some email clients), and pop-up challenge windows get
  blocked. The customer sees a blank frame.
- **They were challenged when they didn't need to be.** Low-value transactions, repeat
  purchases from a trusted customer, and merchant-initiated charges such as
  subscription renewals can often be exempt or out of scope — if the request is
  flagged correctly. If it isn't, you pay the conversion cost of authentication you
  never owed.
- **The market requires it regardless.** In the UK and EU, strong customer
  authentication is a legal default for most online card payments, and several markets
  including India and Nigeria mandate an additional authentication factor. In much of
  the US and Asia it remains largely optional — so forcing 3-D Secure globally means
  paying for friction in markets that never asked for it.

## How to diagnose it

- **Measure the authentication step as its own funnel stage.** You need two numbers:
  authentications started and authentications completed. If your provider doesn't
  expose both, that is the first thing to ask for. The gap between them is the size of
  the problem.
- **Split that gap by device and browser.** A completion rate that is fine on desktop
  and poor on mobile usually means a broken redirect or a blocked window, not
  reluctant customers.
- **Split it by country and by issuing bank.** Challenge rates vary enormously between
  issuers, and one bank with a bad SMS pipeline can account for a surprising share of
  your losses.
- **Check your challenge rate, not just your completion rate.** If most payments are
  being challenged, the issue may be the data you're sending. Billing address, email,
  phone number, cardholder name and device details all feed the bank's decision, and
  sparse data makes a frictionless outcome less likely.
- **Test on real devices, including in-app browsers.** A desktop sandbox will not
  catch this, and it is the most common cause of "but it works for us".

## How to fix it

- **Send more data in the authentication request.** The highest-leverage change
  available, and it costs nothing: more context for the issuer means more payments
  clear frictionlessly and never see a challenge screen at all.
- **Claim the exemptions you're entitled to** rather than challenging everything, but
  be deliberate: a completed challenge shifts fraud liability to the issuer, while an
  exemption keeps it with you. That trade-off is a commercial decision, not a
  technical one.
- **Don't leave "challenge requested" on as a blanket setting.** It is an easy box to
  tick during integration, and it quietly taxes every order afterwards.
- **Prefer an embedded or modal challenge over a full-page redirect** where your
  provider supports it, so the customer never leaves your checkout. We've written
  before about [what redirects cost
  you](/blog/why-customers-abandon-checkout-at-the-redirect/); the bank's verification
  screen is the same problem wearing a different logo.
- **Accept the part you don't control.** The issuer decides whether to challenge, and
  in regulated markets some challenges are mandatory. You can influence the rate and
  improve the experience; you cannot remove the step.

## How PaymentHood addresses this

PaymentHood doesn't authenticate payments itself and cannot overrule a bank's decision
to challenge one. What it changes is that you are no longer stuck with a single
provider's implementation of the step.

Because PaymentHood is a [payment orchestration
platform](/blog/what-is-payment-orchestration/) sitting in front of
{{ site.provider_floor }} providers, the same traffic can be routed by market. If one
provider's 3-D Secure flow completes reliably in Nigeria and another performs better
in the UK, that becomes a routing rule rather than a second integration project. You
keep your own merchant account and contract with each provider, so you can compare
their authentication completion rates on your real traffic instead of taking a sales
deck's word for it.

Verified webhooks matter here too: knowing reliably that a payment was started and
never completed is what lets you follow up, rather than leaving the order in limbo and
silently absorbing the loss.

## Where PaymentHood fits

Step-up friction is a per-market, per-issuer, per-provider problem, which is hard to
fix with one provider connected — you have nothing to compare against, so a bad
authentication experience just looks like weak demand. PaymentHood connects your store
to {{ site.provider_floor }} providers through one free integration, with routing,
failover and webhook verification built in, and **no per-transaction fee** from
PaymentHood at any volume. Free plugins are available for
[WooCommerce](/integrations/woocommerce/) and [WHMCS](/integrations/whmcs/) alongside
the other major carts and billing systems.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which providers you could test against
each other in the markets where authentication is costing you the most.
