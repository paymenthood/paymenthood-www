---
title: "Why Payments Fail, and What to Do About Each One"
description: "A failed payment is three different problems with three different fixes. How to tell them apart, what to retry, when to retry it, and what to tell the customer."
date: 2026-08-12
tags: [payments, reliability]
---

Most checkouts treat a failed payment as one event: the charge did not go
through, so show an error and let the customer try again. That single response is
wrong for two of the three ways a payment actually fails. Retrying the wrong
failure wastes money and irritates the card networks. Not retrying the right one
throws away revenue you had already earned.

The three categories are **hard declines**, **soft declines**, and **technical
failures**. They need opposite handling, and the difference is visible in the
response you already receive.

## 1. Hard declines: the issuer said no, and will say no again

The issuer made a permanent decision about this card. Nothing about waiting
changes it.

| Code | Meaning |
|------|---------|
| 04, 07 | Pick up card (the second is the fraud-flagged variant) |
| 14 | Invalid card number |
| 15 | No such issuer |
| 41 | Lost card |
| 43 | Stolen card |
| 54 | Expired card |
| 57 | Transaction not permitted to cardholder |
{: .table}

**Do not retry these. Not later, not through another provider.** The correct
response is to ask the customer for a different payment method — not to try the
same card again with different framing.

## 2. Soft declines: the issuer said not now

Same card, same customer, different moment, plausibly a different answer.

| Code | Meaning |
|------|---------|
| 51 | Insufficient funds |
| 61 | Exceeds withdrawal amount limit |
| 65 | Exceeds withdrawal count limit |
| 62 | Restricted card |
| 91 | Issuer or switch inoperative |
| 05 | Do not honour |
{: .table}

Code 05 deserves its own note. It is the most common decline and the least
informative — issuers use it as a catch-all when they do not want to tell you
why. Treat it as soft, but cap the attempts rather than retrying it like an
insufficient-funds decline.

One caveat on all of these: **your gateway's normalised codes are what you should
actually branch on.** Providers map the underlying network codes differently, and
some collapse several into one. Build your classification against the codes your
provider documents, then check it against real traffic.

## 3. Technical failures: nobody said anything

Timeouts, 502s, connection resets, TLS errors, a provider having a bad hour.

This category is different from the other two in a way that matters more than
anything else in this article: **a decline is an answer, and a timeout is not.**
When a provider declines, you know the customer was not charged. When a request
times out, the charge may have succeeded, may have failed, or may still be in
flight. You do not know, and you must not guess.

## Never retry a hard decline

This is the rule that costs real money when it is broken. Card networks monitor
repeated attempts on codes that cannot succeed, and excessive retries can attract
fees or penalties. The exact caps and windows change, so confirm the current
figures with your provider rather than trusting a number in a blog post,
including this one.

The commercial argument is simpler anyway: each pointless retry may carry a
per-attempt fee, and a stream of failed authorisations on the same card does your
standing with the issuer no favours.

## Retry timing that matches the reason

Retrying is not one behaviour with one delay. Match the schedule to what you are
waiting for:

- **Technical failure** — retry once, immediately, ideally through a *different*
  provider. You are not waiting for anything to change; you are routing around
  something broken.
- **Insufficient funds (51)** — you are waiting for money to arrive in an
  account. Retrying five minutes later is noise. Retry on a scale of days, and
  where you can, aligned with local pay cycles.
- **Velocity limits (61, 65)** — you are waiting for a rolling limit to reset.
  Hours, not minutes.
- **Issuer unavailable (91)** — you are waiting for someone else's system to come
  back. Minutes.

For subscriptions the same logic drives your dunning schedule: attempts spread
over days for funding problems, and a much shorter cycle for technical ones.

## Retries create double charges unless you stop them

Every retry mechanism needs an **idempotency key** — a value you send with the
charge so that a repeated request returns the original result instead of creating
a second payment. Without one, a timeout followed by a retry is a genuine risk of
charging a real customer twice.

The subtlety that catches people out is **which** retries share a key:

- A retry after a **timeout** is the *same* payment attempt. It must reuse the
  original key, so the provider can tell you what happened to the first request
  rather than performing a new charge.
- A retry after a **definitive decline** is a *new* attempt. It needs a new key —
  reuse the old one and you will get the cached decline back forever and conclude,
  wrongly, that the card is dead.

Derive the key from the order and the attempt, never randomly per HTTP request.
A key that changes on every request provides no protection at all, which is the
most common way this gets implemented wrong.

## When failing over to another provider helps

Failover is powerful for exactly one of the three categories.

**It helps for technical failures.** If a provider is timing out, another one
probably is not, and the customer never needs to know.

**It does nothing for hard declines.** The issuer rejected the card, and the
issuer is the same institution no matter which acquirer asks. Retrying a stolen
card elsewhere is not a routing strategy.

**It is a judgement call for soft declines.** A different acquirer can present a
transaction differently — local versus cross-border, a different descriptor, a
different MCC — and that occasionally changes the outcome. It is worth testing
with your own traffic, and it is not worth assuming.

## What to tell the customer

Your error copy is part of your recovery rate. Two rules cover most of it.

**Do not explain the decline.** You usually do not know the real reason, and
"insufficient funds" is a humiliating thing to display to someone standing at a
counter when you are guessing. "That card was declined — please try another card
or payment method" is accurate for every hard and soft decline.

**Never tell a customer they were not charged unless you have verified it.** For
declines you can say it safely, because a decline is an answer. For a timeout you
cannot, because the charge may have gone through. Say something honest about the
uncertainty — that you are confirming and will email them — and then go and
confirm it server-side.

That second rule follows from a broader one worth stating plainly: **an order is
paid when your server asks the provider and the provider says so.** Not when the
browser reached your success URL, which an attacker controls.

## Measure the right number

The metric is **authorisation rate**: approved authorisations divided by
attempted ones. The aggregate figure is nearly useless on its own — what makes it
actionable is the segmentation:

- **By provider.** Two providers on the same traffic rarely perform identically.
- **By country and currency.** A cross-border transaction routed through a
  domestic acquirer often behaves very differently.
- **By payment method and card BIN.** One issuer behaving badly can hide inside a
  healthy average.
- **By decline code, over time.** A shift in the *mix* of codes is a signal well
  before the total moves. Rising 05s look like nothing; rising 91s are somebody's
  outage.

Alert separately on technical failure rate. It is the only one of the three that
is definitely yours to fix.

## The checklist

- Every failure is classified as hard, soft or technical before anything else happens.
- Hard declines are never retried.
- Retry delays match the reason, not one global backoff.
- Every charge carries an idempotency key derived from the order and attempt.
- Timeout retries reuse the key; post-decline retries use a new one.
- Failover is wired for technical failures only.
- Orders are marked paid from a server-side confirmation, never a redirect.
- Customer-facing copy never states a reason you have not verified.
- Authorisation rate is broken down by provider, country, method and code.

## Where PaymentHood fits

Everything above is implementable yourself, and the classification table is the
easy part — the work is keeping it correct across providers as each one changes
its codes, plus idempotency, failover health checks and server-side confirmation
for every one of them.

[PaymentHood](/) handles that layer: decline classification, retry and failover
rules, idempotency and webhook signature verification across
{{ site.provider_floor }} providers behind one API. If you are running
WooCommerce, WHMCS, VirtueMart, Phoca Cart or J2Commerce, the
[free plugins](/integrations/) mean it is a plugin install rather than a
development project, and the retry and routing rules live in a dashboard instead
of in your checkout code.

If the broader idea is new to you, [What Is Payment
Orchestration?](/blog/what-is-payment-orchestration/) covers the layer this sits
in, and the [provider directory](/providers.html) lists what is available in your
market.
