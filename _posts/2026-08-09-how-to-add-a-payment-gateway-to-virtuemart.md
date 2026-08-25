---
title: How to Add a Payment Gateway to VirtueMart (Joomla)
description: "How to add a payment gateway to VirtueMart on Joomla — the per-gateway way and one plugin for many providers. Step by step, no code."
date: 2026-08-09
tags: [virtuemart, joomla, payments]
image: /assets/images/blog/how-to-add-a-payment-gateway-to-virtuemart.jpg
---

VirtueMart is the e-commerce component for Joomla, and out of the box it handles
carts and orders but not card payments — for that you add a **payment gateway**.
In VirtueMart a card gateway is set up as a **"payment method"**, so the two
terms mean the same thing here. This guide covers how VirtueMart payments work
and the two ways to set one up.

## How VirtueMart payment methods work

In VirtueMart, a payment method is powered by a **Joomla payment plugin**. The
flow is always two steps: install the plugin, then create a payment method in
VirtueMart that uses it. Nothing appears at checkout until both are done and the
method is published.

## Method 1: Add a single gateway

1. **Install the provider's plugin.** In Joomla admin: *Extensions → Manage →
   Install*, then upload the provider's VirtueMart payment plugin and enable it
   under *Extensions → Plugins*.
2. **Create the payment method.** Go to *VirtueMart → Payment Methods → New*,
   give it a name, and select the payment plugin you just installed.
3. **Configure it** — API credentials, currencies, countries, and any
   minimum/maximum order total.
4. **Publish and test** in sandbox, then switch to live credentials.

The friction on Joomla specifically: there are **fewer maintained VirtueMart
payment plugins** than on WooCommerce, so the provider you want may not have a
current one — and, as everywhere, a plugin per gateway means no fallback and
separate reconciliation.

## Method 2: One plugin for many providers

1. **Install the PaymentHood plugin** for VirtueMart
   ([free and open-source](/integrations/virtuemart/)).
2. **[Create a free PaymentHood account]({{ site.signup_url }})** and connect the
   providers you want, {{ site.provider_floor }} supported.
3. **Manage providers from the dashboard** — add or switch them without
   installing another Joomla plugin.

One plugin covers many providers, so you're not limited to whichever gateways
happen to have a maintained VirtueMart extension.

## Common issues (and quick fixes)

- **Payment method not showing at checkout.** It isn't *published*, or it's
  restricted by country, currency, or a minimum/maximum order total that the cart
  doesn't meet.
- **Currency mismatch.** The provider doesn't settle in the store currency —
  adjust the method's currency or use a provider that covers it.
- **Order not confirmed after payment.** The provider's return/callback URL isn't
  set correctly, so VirtueMart never marks the order paid.

## Where PaymentHood fits

[PaymentHood](/) connects VirtueMart to {{ site.provider_floor }} payment
providers through one free, open-source plugin — with routing, failover, webhook
verification and server-side confirmation handled for you. Instead of hunting for
a maintained plugin per gateway, you install one and manage providers from a
dashboard.

See the [VirtueMart integration](/integrations/virtuemart/) or the full
[provider directory](/providers.html).
