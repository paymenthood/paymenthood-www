---
title: "Do You Need PCI Compliance to Accept Card Payments?"
description: "PCI compliance sounds daunting, but for most stores it's a short questionnaire — if card data never touches your server. How your integration decides your scope."
date: 2026-08-20
tags: [payments, security]
image: /assets/images/blog/do-you-need-pci-compliance-to-accept-payments.jpg
---

At some point after you start taking card payments, a message arrives that makes
your stomach drop: your acquirer or a compliance portal wants you to complete a
**PCI DSS Self-Assessment Questionnaire**, maybe run a scan, maybe pay a fee. For a
small store or a hosting business, it reads like an audit you didn't sign up for.

The good news: for most merchants the honest answer is *"yes, but far less than you
fear"* — and how much you have to do is decided almost entirely by **one technical
choice you've probably already made without realising it.**

## What PCI compliance actually is

PCI DSS (Payment Card Industry Data Security Standard) is a set of security rules
that apply to **anyone who stores, processes or transmits cardholder data.** It's
not a law, but your acquirer and the card networks require it contractually, so in
practice it's mandatory once you accept cards.

The part that trips people up is *scope*. PCI isn't one fixed amount of work — the
questionnaire you're eligible for, and therefore the effort, depends on **how card
data flows through your system.**

## The one thing that decides your workload

There are, broadly, two ways card details can reach your payment provider:

- **The card never touches your server.** The customer enters their card on a
  provider-hosted page (a redirect or a hosted field/iframe), and your server only
  ever sees a token — never a card number. This is the **SAQ A** path: the shortest
  questionnaire, a couple of dozen questions, no quarterly scan of your own app.
- **Your server handles the raw card.** You built your own card form, the number
  posts to your backend, and you pass it on to the provider. Now the cardholder data
  is *in your environment* — which pushes you toward **SAQ D**: hundreds of controls,
  scans, and the kind of programme that needs a dedicated owner.

Same business, same volume — but the difference in obligation between those two is
enormous. **Most PCI pain is self-inflicted by taking the second path when the first
was available.**

## The mistake to avoid

The costly mistake is building a "nice" native checkout that collects the card on
your own page and sends it to your server, because it feels more integrated. It
technically works — and it drags your entire server, and often your whole hosting
environment, into PCI scope. For a WooCommerce store or a WHMCS hosting business,
that's rarely a trade worth making.

## How to keep your scope small

The durable answer is to make sure **card data goes straight from your customer to a
PCI-certified provider, and your systems only ever handle tokens.** In practice:

- Use a **hosted checkout or hosted fields**, not a self-built card form that posts
  to your backend.
- Keep card numbers out of your database, your logs, and your emails entirely.
- Let the certified provider — and the layer in front of it — own the parts that
  carry real cardholder data.

Do that and you stay on the short SAQ A path, whichever provider you use.

## How PaymentHood keeps you in the smallest scope

[PaymentHood](/) is a
[payment orchestration platform](/blog/what-is-payment-orchestration/), and it is
built so that **card details pass directly from your customer to your chosen payment
provider's certified environment.** PaymentHood — and your store — work only with the
tokens the provider returns, never the card number. Cardholder data never lands in
your server, your database or your logs, which keeps you on the shortest PCI path
rather than the SAQ D programme a self-built card form would trigger.

Because it's an orchestration layer, that holds true **across every provider you
connect** — you don't re-solve PCI scope each time you add a gateway. You connect the
providers you want ({{ site.provider_floor }} supported) through one integration, and
the data-handling model stays the same.

*(This is about keeping your PCI **scope** small; it isn't legal or compliance advice —
your acquirer confirms which SAQ applies to you.)*

## Where PaymentHood fits

If PCI compliance feels heavier than it should, it's usually because card data is
touching a server it never needed to. PaymentHood connects your store to
{{ site.provider_floor }} providers through one free integration that keeps cardholder
data off your systems entirely, with webhook verification and server-side
confirmation handled for you — and no per-transaction fee from PaymentHood. Free
plugins are available for [WooCommerce](/integrations/woocommerce/),
[WHMCS](/integrations/whmcs/), VirtueMart, Phoca Cart and J2Commerce.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see what's supported in your market.
