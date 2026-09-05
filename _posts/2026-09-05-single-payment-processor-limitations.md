---
title: "The Limits of a Single Payment Processor"
description: "One processor is the right choice for longer than people admit. But four limits are structural rather than fixable, and the expensive one has nothing to do with technology."
date: 2026-09-05
tags: [payments, orchestration]
---

This is not an argument against your payment processor. Stripe, PayPal, Adyen and
the rest are genuinely good products, and for a great many businesses one of them
is the entire correct answer for years.

It is an argument about a **structural** property of choosing exactly one. Four
limits come with that decision no matter which one you pick, and they are not
things a better processor fixes — they are consequences of the number one. Three
of them are obvious in hindsight. The fourth is the one that actually ends
businesses, and it is not a technical problem at all.

## Limit 1: coverage stops at their map

Every processor is strong somewhere and absent somewhere else. That is not a
failing; building local acquiring, local methods and local compliance in every
market is an enormous undertaking that nobody has completed.

The problem is what it looks like from inside your business. You do not get an
error saying "this market is outside our coverage". You get a slightly worse
conversion rate in Brazil, a slightly higher decline rate in Nigeria, and a
support ticket from someone in the Netherlands asking why there is no iDEAL. None
of those arrive labelled as a coverage problem, so they get investigated as
checkout bugs, or not investigated at all. [Why cards alone lose sales
abroad](/blog/local-payment-methods-why-cards-lose-sales/) is the long version of
what that costs.

## Limit 2: their uptime is your uptime

With one processor there is no degraded mode. Their outage is not a slowdown for
you; it is a full stop, and it lasts exactly as long as their incident does.

What makes this sharper than it sounds is the discovery time. Your own monitoring
is green — your servers are fine, your error rate is normal, and the payment
requests are being answered, just unfavourably. Teams routinely learn about a
processor outage from a customer email rather than from an alert, which adds
however long that takes to the length of the outage. [What to do when a payment
gateway goes down](/blog/payment-gateway-downtime-failover/) covers the triage;
the point here is only that with one provider there is nothing to triage *to*.

## Limit 3: no leverage, ever

Pricing conversations have exactly one shape when you have one processor and no
realistic ability to leave. You can ask. They can decline. Both of you know that
migrating is a quarter of engineering time you do not have.

This is not anyone behaving badly — it is the normal outcome of a negotiation
where one side has an alternative and the other does not. The leverage does not
come from threatening to leave. It comes from already being able to send a
percentage of traffic somewhere else without a project.

## Limit 4: the account hold

Here is the one that is not a technology problem, gets left out of architecture
discussions entirely, and has closed real companies.

Your processor is not just a service you buy. They are underwriting you: they are
liable if you take money and do not deliver, so they hold an opinion about your
risk, and that opinion can change without warning. A volume spike, a chargeback
cluster, a category reclassification, a compliance review triggered by something
that has nothing to do with you. The outcomes are ordinary in the industry and
severe for the merchant:

- **A rolling reserve.** A percentage of your revenue is held for months.
- **A payout hold.** Money you have already earned stops arriving while a review
  runs.
- **Termination.** Some categories — hosting, VPN, digital goods, anything
  subscription-heavy with a free trial — sit close to this line permanently.

The important detail: none of this is a bug you can fix, an SLA you can invoke,
or a thing your engineering team can be better at. And the timeline is not yours.
You are waiting on someone else's review queue while your revenue is paused.

With one processor, that is 100% of your income. With two already connected, it
is a bad week rather than an extinction event.

## Why "we'll add a second one if we need to" does not work

The plan is always to add redundancy when it becomes necessary. The problem is
when *necessary* announces itself.

Coverage and outages give you notice — you can see a market coming, and you can
watch a status page. The account hold does not. It arrives fully formed on a
Tuesday, and at that moment you need a second provider live in production: a new
integration, a new webhook format, a new set of error codes, new reconciliation,
and an approval process at the new provider that takes days precisely because
they are underwriting you too.

That work does not compress because the situation is urgent. Which is the entire
argument for doing it while things are calm — the same argument, made in more
detail, in [orchestration versus a single
gateway](/payment-infrastructure/orchestration-vs-single-gateway/).

## What "adding a second provider" actually costs

Worth being honest, because the naive version of this advice is bad advice. Two
providers the direct way is not twice the integration. It is twice the
integration **plus** a coordination layer nobody scoped:

- Something has to decide which provider a payment goes to.
- Something has to keep one identity for a payment across both, or a retry turns
  into a double charge.
- Something has to reconcile two settlement formats into numbers you can trust.
- Somebody has to maintain all of it as both providers change their APIs.

That coordination layer is the actual product being described whenever anyone
says "payment orchestration" — the reason it exists as a category rather than as
a weekend of work. [How payment failover is actually
built](/payment-infrastructure/failover/) walks through the part that most often
gets underestimated.

## Where PaymentHood fits

[PaymentHood](/) is that coordination layer, so adding a second provider stops
being a project. Your checkout integrates once — through the API or a [free
plugin](/integrations/) — and [{{ site.provider_floor }}
providers](/providers.html) sit behind it, with routing, failover, idempotency,
webhook verification and reconciliation handled once rather than once per
provider.

Two things follow that matter specifically for the limits above. You keep your
own account and your own contract with every provider, so nothing about your
existing relationship changes — PaymentHood is not a processor, an acquirer or a
merchant of record, takes no percentage and no per-transaction fee at any volume,
and never holds your money. And because providers are configuration rather than
code, having a second one connected costs you nothing until the day it is the
only thing still working.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see what you could add alongside what
you already run.
