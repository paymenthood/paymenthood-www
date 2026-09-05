---
title: "Card Testing on Signup Forms: Spot It and Stop It"
description: "Card testing turns your signup form into someone else's validation tool. How to recognise the pattern, why CAPTCHA is not the fix, and the rules that actually stop it."
date: 2026-09-05
tags: [fraud, payments]
---

Somebody has a list of stolen card numbers. Most of them are dead. Before they can
be sold or used for anything substantial, the working ones have to be separated
from the cancelled ones — and that requires a merchant willing to attempt a small
charge against each one.

That merchant is you, and your signup form is the tool. **Card testing** is not an
attack on your business in the usual sense; nobody is trying to take anything from
you. You are infrastructure in someone else's workflow, and you pay for the
privilege.

## Why signup forms specifically

The requirements for a good card-testing target are narrow, and a SaaS signup flow
meets all of them:

- **A small charge.** A trial converting at $1, or a low-priced starter plan. Large
  amounts get declined for reasons that tell the attacker nothing.
- **Instant, automated feedback.** The response says approved or declined
  immediately, which is the entire product being extracted.
- **No human between attempt and answer.** Nobody reviews a signup.
- **Cheap accounts.** No shipping address to fake, no identity check, no wait.

Nothing on that list is a flaw in your product. They are all features, and the
same ones that make signup frictionless for real customers.

## The bill

The charges themselves are rarely the expensive part. What follows is:

- **Processing fees on every attempt**, including declines. Thousands of attempts
  is a real invoice for revenue that never existed.
- **Your decline rate**, which your provider watches. Every acquirer has a
  threshold, and crossing it starts a review — and a review of a merchant whose
  traffic looks like card testing does not go well. [The limits of a single
  payment processor](/blog/single-payment-processor-limitations/) covers what an
  account review actually does to a business.
- **Chargebacks later.** The cards that worked get used elsewhere, and some of
  those disputes trace back through your small charge.
- **Poisoned metrics.** Signups, conversion rate and approval rate all become
  fiction for as long as it runs.
- **Infrastructure**, if each signup provisions something before payment clears.

## How to recognise it

Card testing has a shape, and once seen it is unmistakable:

- A **decline rate that jumps** rather than drifts — from a few percent to most of
  your attempts, within an hour.
- **Many distinct card numbers** across few accounts, few IP addresses, or one
  narrow time window.
- **Sequential-looking card numbers**, or many cards sharing a BIN — the first six
  digits, which identify the issuer. A real customer base does not cluster like
  that.
- **Attempts far outside your normal traffic pattern**, geographically or by hour.
- **Disposable or patterned email addresses**, often one per card.
- **Uniform, fast attempts.** Real people hesitate, mistype, and abandon. Automated
  traffic does not.

If you have no view of decline rate over time, that is the first thing to build.
You cannot see this pattern in a metric you do not have.

## Why the obvious defences underperform

**CAPTCHA** raises the cost per attempt and does not change the economics. Solving
services are cheap and readily available, and the attacker's return per successful
card is high enough to absorb it. It is worth having. It is not a control.

**Rate limiting by IP** works for about an hour, until the traffic redistributes
across a residential proxy pool. Also worth having, also not sufficient alone.

**Blocking countries** blocks customers. The traffic originates wherever proxies
are, which is frequently the same places your real customers are.

The reason these underperform is that they all try to identify *who* is attempting.
The reliable signal is not who — it is the **shape of the attempts**.

## What actually works

Controls that count behaviour over a window, and act automatically:

- **Attempts per customer per period.** A real customer retries two or three times
  and stops. Nobody legitimately attempts fifteen payments in an hour.
- **Distinct cards per customer.** This is the strongest single signal available.
  A genuine customer has one or two cards. Six distinct cards on one account in a
  day has no innocent explanation.
- **Reaction to repeated provider rejections.** Not just total attempts, but
  attempts the provider *refused*. A customer accumulating declines is the exact
  population you want to stop before your acquirer notices them.
- **Total amount per period**, which catches the variant that tests with larger
  charges.
- **Automatic action.** The rule has to reject the payment or block the customer
  itself. A rule that files a report is not a control — by the time the report is
  read, the run is finished.

The important property of all of these is that they degrade gracefully for real
customers. A limit of six distinct cards a day is invisible to essentially every
legitimate user and fatal to a testing run.

## Don't provision before the money clears

A separate failure that makes card testing much more expensive: acting on the
browser redirect instead of a confirmed payment. If an account is created, a
resource provisioned or a trial started because a page loaded, you are giving away
the product on attempts that were never paid. Fulfil on server-side confirmation
only — the general version of this mistake is in [customer paid but the order is
still pending](/blog/payment-successful-order-still-pending/).

## How PaymentHood helps

[PaymentHood](/) includes a rule engine that runs on the payment path itself,
which is the only place these controls work — a rule enforced after the charge is
a report, not a defence. Rules are configured per app as fraud policies, and count
over a daily, weekly or monthly window:

- **Payment count** — attempts in the period.
- **Provider reject count** — attempts the provider refused, the signal that most
  directly predicts an acquirer review.
- **Distinct cards** — the strongest single indicator of testing.
- **Total amount** — the variant that uses larger charges.

Each rule either rejects the payment or blocks the customer outright, and can be
scoped to specific providers and currencies. Alongside them, a firewall layer
filters by IP range, specific address and country, can refuse VPN traffic, and can
require a minimum reputation score for the IP, email address or phone number
before a payment is allowed to proceed.

Because it all sits in the payment layer rather than in your application, the same
policy protects every checkout you run — your app, your [WooCommerce
store](/integrations/woocommerce/), your [WHMCS billing](/integrations/whmcs/) —
without being implemented three times.

[Create a free PaymentHood account]({{ site.signup_url }}), or work through the
[payment integration launch checklist](/payment-infrastructure/checklist/) to see
which of these controls your current setup is missing.
