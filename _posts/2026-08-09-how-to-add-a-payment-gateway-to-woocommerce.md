---
title: How to Add a Payment Gateway to WooCommerce (No Code)
description: "Two ways to add a payment gateway to WooCommerce — the manual, one-plugin-per-provider route, and one free plugin that connects them all. Step by step."
date: 2026-08-09
tags: [woocommerce, payments]
hero: /assets/images/blog/how-to-add-a-payment-gateway-to-woocommerce.svg
image: /assets/images/og/blog/how-to-add-a-payment-gateway-to-woocommerce.jpg
---

WooCommerce ships with a few payment options out of the box — direct bank
transfer, cheque, cash on delivery — but the moment you want to take actual card
payments, you need a **payment gateway**. This guide covers the two ways to add
one, step by step, and when each makes sense.

## The two approaches

**1. One plugin per provider.** Most gateways — Stripe, PayPal, Adyen, and
hundreds of regional providers — publish their own WooCommerce plugin. You
install it, paste in your API keys, enable it at checkout. Simple, until you
want a second provider, a fallback, or a provider your region needs that has no
maintained plugin.

**2. One plugin for every provider (orchestration).** Instead of a plugin per
gateway, a single plugin connects WooCommerce to many providers at once and lets
you switch or route between them without touching code.

We'll walk through both.

## Method 1: Add a single gateway (the manual way)

1. **Choose your provider** and create an account (Stripe, PayPal, your regional
   gateway, and so on).
2. **Install the provider's plugin.** In WordPress admin: *Plugins → Add New
   Plugin → search the provider's name → Install → Activate.*
3. **Enter your API keys.** Go to *WooCommerce → Settings → Payments*, find the
   gateway, click *Manage*, and paste the keys from your provider dashboard (use
   test keys first).
4. **Enable and test.** Toggle it on, run a test order in the provider's sandbox,
   then switch to live keys.

That covers one provider. The friction shows up later:

- **Every extra provider is another plugin,** another set of keys, another thing
  to keep updated.
- **No fallback.** If your provider has an outage, checkout is down until they
  recover.
- **Regional gaps.** Some providers your customers ask for have no maintained
  WooCommerce plugin at all.

## Method 2: Add every gateway with one plugin

If you expect more than one provider — or you sell across markets — connecting
them through a single layer is less work over time.

1. **Install the PaymentHood plugin** for WooCommerce
   ([free and open-source](/integrations/woocommerce/)).
2. **[Create a free PaymentHood account]({{ site.signup_url }})** and connect the
   providers you want — cards, wallets, and regional gateways,
   {{ site.provider_floor }} supported.
3. **Add or switch providers from the dashboard** — no reinstall, no code, no
   touching your checkout.

Because the integration is one plugin, adding a fifth provider is a dashboard
toggle rather than a fifth installation. And if a provider fails, payments can
route to another automatically, so their outage doesn't become yours.

## Common issues (and quick fixes)

- **Gateway doesn't appear at checkout.** Confirm it's *enabled* under
  WooCommerce → Settings → Payments, and that your store currency is one the
  provider supports.
- **"Payment method not available for your currency."** The provider doesn't
  settle in your store currency — change currency, or use a provider (or
  orchestration layer) that covers it.
- **Test payments work, live ones fail.** You're likely still on test/sandbox
  keys, or the provider account isn't fully activated for live payments.
- **Webhooks not updating order status.** The provider's webhook/callback URL
  isn't set correctly, so orders get stuck in *pending*. A plugin that verifies
  webhooks for you avoids this entirely.

## Which should you pick?

If you'll only ever use one provider in one currency, a single-provider plugin is
the simplest thing that works. If you expect a second provider, a fallback, or
multiple markets, one plugin that connects them all saves you from
re-integrating every time your needs change.

## Where PaymentHood fits

[PaymentHood](/) connects WooCommerce to {{ site.provider_floor }} payment
providers through one free, open-source plugin — with routing, automatic
failover, webhook verification and server-side confirmation handled for you. You
install it once, then add or switch providers from a dashboard instead of in
your code.

See the [WooCommerce integration](/integrations/woocommerce/), or browse the full
[provider directory](/providers.html).
