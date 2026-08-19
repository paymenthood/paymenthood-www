---
title: "Payment Reconciliation Across Multiple Providers: Why the Numbers Never Match"
description: "Your store says one number, your providers say another, the bank a third. Why multi-provider reconciliation breaks and how to fix it for good."
date: 2026-08-19
tags: [payments, orchestration]
---

It is the first working day of the month. You open your store's orders report and it
says you took £48,200. You open the first provider's dashboard: £31,540. The second
provider: £14,900. That is £46,440, and you are £1,760 short. Then the bank
statement arrives and matches neither figure, because the payouts landed net of fees
on days that do not line up with the orders that produced them.

So you build a spreadsheet. You export three CSVs with three different column
layouts, three different timestamp formats and three different ideas of what a
transaction ID is. Two hours later you find most of it — a batch of refunds, a
handful of chargebacks, some FX rounding — and you give up on the last £180 because
it costs more to find than it is worth.

This is not an accounting failure. It is a structural one, and it gets linearly
worse with every provider you add.

## Why the numbers disagree

Nothing here is a bug. Each system is reporting something slightly different, and
nobody is reporting the same thing twice:

- **Gross versus net.** Your store records the order value. The provider reports the
  captured amount. The bank shows the payout — gross minus processing fees, minus
  refunds already deducted, batched across several days of orders.
- **Authorisation is not settlement.** An order authorised on the 31st may settle on
  the 1st. Your store counts it in one month, the provider's payout report in the
  next. Every month-end boundary produces this discrepancy.
- **Refunds and chargebacks move backwards.** A refund issued in August against a
  July order shows up in August's provider report but nowhere near July's order in
  your store.
- **Every provider has its own reference.** One returns `ch_xxx`, another a numeric
  transaction ID, a third a merchant reference you had to generate yourself. Unless
  your order ID travels with the payment and comes back intact, there is no join
  key — so you match on amount and date, which fails the moment two customers pay
  the same amount on the same day.
- **Currency conversion and rounding.** An order priced in EUR, settled in GBP,
  converted at the provider's rate on the provider's date, will not equal the number
  your store calculated at checkout.
- **Missed webhooks.** A status change that never arrived leaves the order in one
  state in your store and another at the provider. This one is the most dangerous,
  because it is not a reporting difference — it is a genuinely wrong record.

## How to diagnose it

Work down from the largest gap rather than chasing every penny:

- **Reconcile against one provider at a time.** A combined total hides which
  provider is drifting. Pull a single provider's settlement report for a fixed date
  range and match it to your orders for that provider alone.
- **Use settlement date, not order date.** Realign both sides to when money actually
  moved, and a surprising share of the gap disappears immediately.
- **Separate the three categories.** Timing differences (will resolve themselves),
  fee and FX differences (expected, should be recorded as costs), and genuine
  mismatches (an order marked paid with no matching transaction, or the reverse).
  Only the third category is a problem.
- **Check for orphaned transactions.** A payment at the provider with no
  corresponding paid order in your store almost always means a webhook was missed —
  which usually also means a customer paid and did not get their goods.
- **Confirm your order reference is actually reaching the provider.** If it is not
  in the provider's record, you have no reliable join key and every future month
  will be manual.

## How to fix it

- **Put your order ID on every transaction, at every provider.** This is the single
  highest-value change. One consistent reference makes reconciliation a lookup
  rather than a search.
- **Reconcile weekly, not monthly.** Discrepancies are far cheaper to resolve while
  the surrounding context is still fresh, and a missed webhook gets caught in days
  rather than at quarter-end.
- **Record fees as fees.** Do not try to make gross equal net. Book the processing
  cost explicitly so the two figures are allowed to differ by a known amount.
- **Verify payment status server-side.** Never treat a browser redirect as proof of
  payment; confirm against the provider before marking an order paid.
- **Stop reconciling per provider dashboard.** If every provider you add means
  another export format and another spreadsheet tab, the process does not scale —
  the reporting needs to be unified above the providers, not below them.

That last point is what a
[payment orchestration platform](/blog/what-is-payment-orchestration/) is for: one
integration sitting in front of several providers, with one transaction record per
payment regardless of which provider handled it.

## How PaymentHood helps

PaymentHood gives you a **single transaction ledger across every connected
provider**. Each payment carries your order reference, records which provider
processed it, and keeps its status in one place — so month-end is one report rather
than one export per provider stitched together by hand.

Because status changes are verified server-side and webhooks are validated before
anything is marked paid, the most damaging category of mismatch — an order whose
real state differs from your record — largely stops happening. Adding a provider for
a new market does not add a new reconciliation process; it adds rows to the same
ledger.

Free plugins are available for [WooCommerce](/integrations/woocommerce/),
[WHMCS](/integrations/whmcs/), VirtueMart, Phoca Cart and J2Commerce, with
{{ site.provider_floor }} providers supported through one integration.

## Where PaymentHood fits

If you run more than one payment provider — and most sellers eventually do, whether
for currency coverage, local methods or failover — reconciliation is the hidden tax
you pay for it. PaymentHood removes that tax by making multiple providers look like
one system to your books, and there is **no per-transaction fee from PaymentHood**,
so consolidating your reporting does not cost you a slice of every sale.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which providers you can bring under a
single ledger.
