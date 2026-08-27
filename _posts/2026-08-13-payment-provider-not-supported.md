---
title: "Your Payment Provider Isn't Supported. What Now?"
description: "Four options when the payment provider you need has no plugin for your platform — what each one actually costs, and how to tell which ones are open to you."
date: 2026-08-13
tags: [payments, integration]
hero: /assets/images/blog/payment-provider-not-supported.jpg
image: /assets/images/og/blog/payment-provider-not-supported.jpg
---

You chose a payment provider for good reasons. It settles in your currency, it
supports the methods your customers actually use, or you negotiated a rate worth
having. Then you go to connect it and find your platform has no plugin for it.

There are four ways out of this, and three of them are more expensive than they
look.

## Option 1: Build the integration yourself

Always possible, and consistently underestimated — because the charge call is the
small part. What follows it is webhook handling with correct signature
verification, refunds and partial refunds, idempotency so a timeout cannot double
charge, server-side confirmation, reconciliation into your accounting, and a
sandbox-to-live cycle for all of it.

Then you own it. Providers change APIs, deprecate endpoints and rotate
requirements, and each change is now your maintenance ticket. Budget the second
year, not just the first sprint.

## Option 2: Switch to a supported provider

Sometimes this is genuinely right, and it is worth pricing honestly rather than
dismissing. But be clear about what you are optimising for. If you picked your
provider for settlement currency, local payment methods or approval rates in your
market, switching to whichever one happens to have a plugin means choosing your
payments partner based on plugin availability instead of on your customers.

That trade is occasionally worth it. It is rarely worth it silently.

## Option 3: Switch platforms

Migrating your whole store to get one provider is almost never proportionate. If
you are already migrating for other reasons, add provider support to the
evaluation criteria. If you are not, this is not the reason to start.

## Option 4: Ask whoever supplies your payments layer

Most merchants never try this one, for a simple structural reason: with a direct
integration there is nobody to ask. A plugin directory is not a vendor. The
plugin author owes you nothing, and the platform did not promise your provider.

So the real question is not whether asking works. It is whether you have anyone
to ask.

## Why "we'll add it" usually means a quarter

When every provider is its own plugin, adding one means writing a new plugin.
Even when someone else writes it, the result lands on you: install it, configure
it, test it, redeploy, and add one more thing to keep updated. The timeline is
long because the unit of work is large and it ends on your side.

It only collapses when providers sit behind a single interface. Then adding one
is an adapter written once by the vendor, and nothing about your checkout
changes — same API, same plugin, same code. The new provider shows up as an
option you switch on.

That is the difference between a quarter and a day: not effort, but where the
work lands.

## What that looks like in practice

A merchant recently asked us for [CCBill](/providers/ccbill/) — a payment
facilitator built around subscription billing and the high-risk verticals most
processors decline, not one of the mainstream names. It was live within 24 hours,
and added to the platform itself rather than bolted onto that one account, so
every other merchant got it at the same time.

The honest caveat: not every provider takes a day. One with unusual
authentication, an awkward settlement model or a certification step takes longer,
and anyone promising a fixed number for every provider is guessing. What stays
constant is which side of the line the work happens on.

## How to tell which options you have

Ask your current setup one question: *if I needed a new provider next month, who
would I ask?*

If the answer is a person or a vendor, you have four options. If the answer is
"nobody" — you would be searching a plugin directory and hoping — you have three,
and they all cost real money.

## Where PaymentHood fits

[PaymentHood](/) puts {{ site.provider_floor }} providers behind one API and one
plugin, so switching a provider on is a dashboard change rather than an
integration project. If the one you need is not in the
[provider directory](/providers.html) yet, that is a request rather than a dead
end.

The [free plugins](/integrations/) cover WooCommerce, WHMCS, VirtueMart, Phoca
Cart and J2Commerce. If the underlying idea is new,
[What Is Payment Orchestration?](/blog/what-is-payment-orchestration/) explains
the layer this sits in.
