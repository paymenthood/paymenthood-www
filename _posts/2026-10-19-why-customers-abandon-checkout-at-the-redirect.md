---
title: "Why Customers Abandon Checkout at the Redirect"
description: "Customers click Pay, land on an unfamiliar provider page, and leave without entering a card. Why redirect checkouts lose sales, and how to reduce it."
date: 2026-10-19
tags: [payments, orchestration]
hero: /assets/images/blog/why-customers-abandon-checkout-at-the-redirect.jpg
image: /assets/images/og/blog/why-customers-abandon-checkout-at-the-redirect.jpg
image_alt: "A checkout page sends the customer to an unfamiliar payment page, marked with a question mark, and the customer walks away"
---

A customer has done all the hard work. They found the product, chose a size, typed
their address, and clicked **Place order**. Your page goes blank for a second or two.
Then a different page loads: another company's logo, a different typeface, a domain
they have never seen, and a form asking for a card.

Most of them pay anyway. A meaningful number close the tab.

What makes this hard to spot is that nothing failed. No declined transaction, no error
in your logs, no support ticket. Your store has an order sitting in "pending payment"
and your provider has no record of the customer at all, because they never got as far
as entering a card number. In your analytics it looks like a vague checkout conversion
problem. It is actually a specific, measurable drop-off at one step: the handover.

## Why it happens

Redirect checkouts are not badly designed. For the provider, a hosted payment page is
the right answer — they control the form, card data stays inside their own PCI scope,
and they can change it without touching your site. The cost of that design lands on
you, at the moment a customer is least willing to absorb friction.

- **The brand breaks.** The customer trusted *your* shop, not the company now in the
  address bar. If they have never heard of the provider, a reasonable person pauses.
- **Mobile makes it worse.** A mobile redirect can mean a browser hop, then a bank app
  opening to authenticate, then a return to a tab that may no longer hold the session.
  Every hop is a chance to be interrupted and not come back.
- **The redirect is slow.** A blank interstitial for three or four seconds reads as
  "the site has broken", not "the payment is loading".
- **The methods are a surprise.** Customers often cannot see which methods exist until
  after they have left your store. Someone expecting a local wallet who lands on a
  card-only page does not switch to a card — they leave. That is the same dynamic as
  [local payment methods](/blog/local-payment-methods-why-cards-lose-sales/) generally:
  what is on offer has to match what people actually pay with.
- **3-D Secure stacks on top.** One handover gets them to the provider; authentication
  moves them again. Two is noticeably worse than one.
- **The way back is unreliable.** A customer who hesitates and hits back often finds an
  empty basket and an order they cannot resume. They do not rebuild it.

## How to diagnose it

The useful thing about this problem is that it is cleanly measurable, provided you
measure the right gap.

- **Count orders created against payment attempts initiated.** Your store knows how
  many orders reached the redirect; your provider knows how many customers started
  filling the form. The difference *is* redirect abandonment — a different number from
  your decline rate. Mixing the two is why this gets mistaken for a
  [payment approval rate](/blog/how-to-improve-your-payment-approval-rate/) problem.
- **Split it by device and country.** Abandonment at the handover is almost always far
  worse on mobile, and worse where the provider is not a known brand. An aggregate
  figure hides both.
- **Time the handover on a real device and network**, not a throttled desktop browser.
  Measure from the click to the provider's page being interactive.
- **Watch what customers actually do.** A session-recording tool shows the hesitation
  and the back button more honestly than a funnel chart.
- **Read the provider page as a customer.** Right language? The currency they saw in
  the basket? Your trading name, or a legal entity nobody recognises?

## How to fix it

- **Show the payment methods before the redirect**, with logos, on your own checkout.
  A customer who has already chosen "pay by local wallet" expects the handover and is
  far more likely to complete it.
- **Say what is about to happen.** One line — "You will be taken to our payment
  provider to complete payment securely" — removes most of the surprise and costs
  nothing.
- **Reduce the number of hops.** Where a provider offers embedded or hosted fields
  instead of a full redirect, and your
  [PCI obligations](/blog/do-you-need-pci-compliance-to-accept-payments/) allow it, one
  fewer handover usually beats any copy change.
- **Make the return path survivable.** Someone who abandons and comes back should find
  their basket intact and the same order resumable, not a duplicate order and an empty
  cart. That is the same order-state discipline that stops a
  [paid order sitting as pending](/blog/payment-successful-order-still-pending/).
- **Change one thing at a time and re-measure.** This step has a specific number
  attached to it, so you can tell whether a change actually worked.

## Where PaymentHood fits

PaymentHood is a [payment orchestration platform](/blog/what-is-payment-orchestration/),
which means the provider and method are chosen *before* the customer leaves your
checkout rather than discovered by them afterwards. Methods are presented in your
store, under your branding, and the handover happens once the customer has already
decided how they want to pay.

Because one integration connects you to {{ site.provider_floor }} providers, you can
test a different provider's hosted page — a faster one, or a familiar name in your
customer's country — without re-integrating anything or touching checkout code. That
turns "our payment page is costing us sales" from a development project into a
configuration change.

Return and webhook handling is verified and signed, so the order state a returning
customer sees reflects what actually happened at the provider. And there is **no
per-transaction fee from PaymentHood**, so reducing abandonment does not come with a
platform cut on each order you rescue. [Free plugins](/integrations/) are available for
the major carts and billing systems, including
[WooCommerce](/integrations/woocommerce/).

## Frequently asked questions

**Is abandonment at the redirect the same as a declined payment?**

No, and conflating them hides the problem. A decline means the customer entered a card
and the issuer refused it. Redirect abandonment means they never entered one. The fixes
are entirely different.

**Does a hosted payment page always mean worse conversion?**

No. A fast, localised, well-branded hosted page converts perfectly well. The damage
comes from a handover that is slow, unexpected, in the wrong currency, or branded with
a name the customer does not recognise.

**Can I avoid the redirect entirely?**

Sometimes — some providers offer embedded fields that keep the customer on your site,
though this may change your PCI obligations. Where a redirect is unavoidable, make it
expected, fast and recoverable rather than trying to remove it.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which providers you could offer at
checkout without adding a second integration.
