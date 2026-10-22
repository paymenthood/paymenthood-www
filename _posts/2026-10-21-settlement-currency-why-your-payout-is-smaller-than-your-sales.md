---
title: "Settlement Currency: Why Your Payout Is Smaller Than Your Sales"
description: "Your sales total doesn't match what lands in your bank account. Why settlement-currency conversion quietly costs margin, and how to stop losing it."
date: 2026-10-21
tags: [payments, orchestration]
hero: /assets/images/blog/settlement-currency-why-your-payout-is-smaller-than-your-sales.jpg
image: /assets/images/og/blog/settlement-currency-why-your-payout-is-smaller-than-your-sales.jpg
# Held back until the two images above exist in assets/images/blog/ and assets/images/og/blog/.
# Without them the post would publish with a broken hero and a broken social card.
# Delete this line when they are in place.
published: false
related:
  - /blog/single-payment-processor-limitations/
  - /blog/payment-method-not-available-for-your-currency/
  - /blog/payment-reconciliation-across-multiple-providers/
---

Finance closes the month and pulls two numbers that should roughly agree: gross
sales from the store, and the total actually deposited by the payment provider.
They don't agree, and the gap isn't a missing transaction or a hidden refund.
Every sale is accounted for. The money is simply smaller than it was when the
customer paid it, and nobody signed off on that.

The usual explanation is "fees," and everyone moves on, because processing fees
are expected and budgeted for. But fees are a known percentage, applied
consistently, and this gap doesn't behave like that. It is bigger on some months
than others, bigger in some currencies than others, and it never shows up as a
line item anyone can point to. That's the signature of **settlement-currency
conversion**: the provider took payment in the currency the customer paid in, and
paid *you* in a different one, converting at a rate and a margin that lived
entirely on their side of the transaction.

## Why it happens

- **The provider has one settlement currency, and everything funnels into it.**
  Plenty of accounts are set up to settle in a single home currency: open an
  account configured for USD, and every EUR, GBP or NGN sale gets converted to USD
  before it reaches you, whether or not you asked for that.
- **The conversion rate is the provider's, not the market's.** The rate applied is
  rarely the mid-market rate you'd see on a currency converter. It carries a
  spread, and that spread is the provider's margin on money that was never theirs
  to begin with, on top of whatever processing fee they already charge.
- **Conversion happens at payout time, not sale time.** A card network or local
  rail settles with the provider in batches, so the rate used is whatever it was
  on the day of the payout, not the day of the sale. Two identical sales a week
  apart can convert to noticeably different amounts, for reasons that have nothing
  to do with your business.
- **Nobody itemises it.** A payout report typically shows one net figure in your
  settlement currency. The conversion, the rate used and the spread taken are
  rarely broken out on the statement the way a processing fee line is, which is
  exactly why it's easy to dismiss as noise.
- **It compounds as you grow into new markets.** Every new country usually means a
  new currency of sale, and without a deliberate decision about settlement, all of
  it defaults into the same conversion rather than being something you chose.

## How to diagnose it

- **Reconcile per currency, not in aggregate.** Take a period's sales in a single
  foreign currency, convert that total at the genuine mid-market rate for the same
  period, and compare it to what actually landed. The difference is the spread,
  isolated from processing fees.
- **Read the payout statement for a conversion line, not just a net amount.** If
  the provider shows the rate it applied, note it; if it only shows a net figure in
  your settlement currency, that absence is itself informative.
- **Ask the provider directly what their FX margin is**, as a percentage over
  mid-market. Several will answer only when asked outright, and the figure is
  commonly in the low single digits per conversion, which sounds small until it's
  applied to every foreign-currency sale, every month.
- **Check whether the account even supports settling in other currencies.** Some
  providers offer multi-currency payout accounts and simply never surface the
  option unless it's requested.

## How to fix it

- **Settle in the currency you sold in, wherever a provider supports it.** A
  provider that can pay out in EUR for EUR sales removes the conversion entirely
  for that revenue; there's no spread on a conversion that never happens.
- **Match each currency of sale to whichever connected provider settles it best.**
  Different providers have different strengths by currency and market, in the
  same way they differ on [approval rates and coverage](/blog/single-payment-processor-limitations/).
  A provider worth using for USD and GBP isn't automatically the right one to
  settle NGN or BRL.
- **Treat the spread as a cost to negotiate, not accept.** Once it's isolated
  per-currency, it's a number a provider can be asked to improve, in the same way
  a processing rate is.
- **For currencies too small to justify a dedicated settlement account, at least
  measure the spread**, so it's a known, budgeted cost rather than a monthly
  surprise finance keeps re-discovering.

## How PaymentHood addresses settlement currency

PaymentHood never touches the money: a payment moves from the customer's bank or
card network straight into your own account at your own connected provider, under
your own contract. What changes is which provider a given sale is routed to.
Because PaymentHood is a
[payment orchestration platform](/blog/what-is-payment-orchestration/) sitting in
front of {{ site.provider_floor }} providers, you can send EUR sales to a provider
that settles EUR natively, GBP sales to one that settles GBP, and so on, instead
of every currency being forced through whichever single gateway you happened to
integrate first. Adding the provider that settles a currency properly is a
routing rule, not a second integration project.

## Where PaymentHood fits

If your payout report has never quite matched your sales report, check the
currencies before the fees. PaymentHood connects your store to
{{ site.provider_floor }} providers through one free integration, routes each
transaction to the provider best suited to it, and charges **no per-transaction
fee**, so moving a currency's volume to a better-settling provider doesn't trade
one spread for another cut. Free plugins are available for
[WooCommerce](/integrations/woocommerce/) and [WHMCS](/integrations/whmcs/)
alongside the other major carts and billing systems.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which providers settle natively in
the currencies your sales actually come in.
