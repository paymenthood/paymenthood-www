---
title: "Payment Gateway Downtime: What to Do When a Provider Fails"
description: "When a payment gateway goes down, every sale fails until it recovers. Why outages happen, and how automatic failover keeps your checkout working."
date: 2026-08-16
tags: [payments, orchestration]
hero: /assets/images/blog/payment-gateway-downtime-failover.svg
image: /assets/images/og/blog/payment-gateway-downtime-failover.jpg
---

Here is the version of this that keeps founders up at night: it is a normal
afternoon, traffic is steady, and your one payment provider has an outage. For as
long as it lasts, **every checkout fails**. You are not losing a few sales — you are
losing *all* of them, and you usually find out not from monitoring but from a
customer asking why their card was declined.

A payment gateway going down is not a rare event. It is a *when*, not an *if*. The
question is only whether their outage automatically becomes your outage.

## Why payment gateways go down

It is rarely just "the server crashed". The common causes are more mundane and more
frequent:

- **Provider outages and maintenance.** Every processor has incident pages for a
  reason. Even the biggest names have partial outages measured in minutes to hours.
- **Account holds and reviews.** A risk flag, a sudden spike in volume, or a
  compliance review can freeze your ability to charge — often with little warning.
- **Regional blocks.** A provider that works everywhere else can be unavailable, or
  quietly decline, in one country your customers are buying from.
- **Rate limits and timeouts.** Under load, requests start timing out. The gateway
  is technically "up", but from your checkout's point of view it is failing.
- **Expired credentials or a broken webhook.** A rotated key or an unverified
  callback can silently stop payments from completing.

The pattern across all of these: the failure is often **temporary and specific**,
and a payment that fails through one provider would have succeeded through another.

## The real cost of a single-provider setup

With one provider, you have a single point of failure sitting directly between your
customers and your revenue. When it has a bad day:

- **Every transaction fails** for the duration — not a degraded experience, a
  stopped one.
- **You find out late.** The first signal is usually support tickets, not an alert.
- **The damage outlasts the outage.** Customers who hit a declined card at checkout
  often do not come back to try again.

For a store doing meaningful volume, an hour of downtime is not an inconvenience; it
is a number you can put on an invoice.

## What failover actually is

Failover is the ability to **retry a failed payment through a different provider**
instead of returning an error to the customer. The important nuance is *which*
failures are worth retrying:

- A **technical failure** — a timeout, a 500, a gateway outage — is worth retrying
  elsewhere, because the payment itself was fine.
- A **hard decline** — insufficient funds, a genuinely blocked card — is *not*.
  Retrying it through another provider just annoys the customer's bank and can look
  like card testing.

Good failover tells these apart. It reroutes the recoverable failures and leaves the
genuine declines alone.

## Why "just add a second provider" isn't enough

Plenty of teams reach the same conclusion — *we need a backup provider* — and then
discover the hard part isn't having two providers, it's **coordinating** them:

- Something has to detect that provider A failed and decide, per transaction,
  whether to try provider B.
- Both providers report success differently, sign their webhooks differently, and
  reconcile differently — so a second integration is a second set of everything to
  get right.
- The routing logic has to live somewhere you can change without a redeploy, or
  you are editing checkout code in the middle of an incident.

This coordination layer is exactly what a
[payment orchestration platform](/blog/what-is-payment-orchestration/) is: one
integration that sits above your providers and moves each payment to a healthy one.
If you are designing that layer rather than reacting to an outage, [how payment
failover is actually built](/payment-infrastructure/failover/) covers the
architecture — including the duplicate charge a naive retry can create.

## How PaymentHood keeps your checkout up

[PaymentHood](/) routes every transaction through the best available provider and,
when one fails for a technical reason, **automatically retries through another** —
so a provider's outage doesn't become your outage. You connect the providers you
want (cards, wallets, regional and crypto methods, {{ site.provider_floor }}
supported), and routing and failover happen without you touching checkout code.

Because it is one integration, adding a backup provider is a dashboard change rather
than a second build, and switching your primary provider mid-incident is a toggle
rather than a deploy. Webhook verification and server-side confirmation are handled
once, centrally, so a second provider doesn't mean a second chance to get security
wrong.

## Where PaymentHood fits

If losing your one provider means losing every sale until they recover, that single
point of failure is worth removing before the next outage — not during it.
PaymentHood connects your store to {{ site.provider_floor }} providers through one
free integration, with automatic routing, failover, webhook verification and
server-side confirmation built in. There's no per-transaction fee from PaymentHood;
you pay only your chosen provider's processing fees. Free plugins are available for
[WooCommerce](/integrations/woocommerce/), [WHMCS](/integrations/whmcs/), VirtueMart,
Phoca Cart and J2Commerce.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the full
[provider directory](/providers.html) to see what's covered in your market.
