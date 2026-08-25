---
title: How to Add a Payment Gateway to WHMCS (Step-by-Step)
description: "How to add a payment gateway to WHMCS — the manual, module-per-gateway way, and one free module that connects every provider, recurring billing included."
date: 2026-08-09
tags: [whmcs, payments]
image: /assets/images/blog/how-to-add-a-payment-gateway-to-whmcs.jpg
---

WHMCS automates billing and provisioning for hosting and SaaS businesses, but to
actually charge a customer's card you need a **payment gateway module**. This
guide covers the two ways to add one, step by step — and the WHMCS-specific
detail most guides skip: recurring billing.

## The two approaches

**1. One module per gateway.** WHMCS ships with gateway modules, and providers
publish their own. You activate the module, enter your API credentials, and it
appears at checkout. Fine for one provider — but each additional gateway is
another module, another set of credentials, and its own handling of automatic
renewals.

**2. One module for every provider (orchestration).** A single module connects
WHMCS to many providers at once, so you add, switch, or route between them from a
dashboard instead of installing a module per gateway.

We'll walk through both.

## Method 1: Activate a single gateway (the manual way)

1. **Create an account** with your provider and get your API credentials.
2. In WHMCS admin, go to **System Settings → Payment Gateways** (older versions:
   *Setup → Payments → Payment Gateways*).
3. Open the **All Payment Gateways** tab, find your provider, and **Activate** it.
   If it isn't listed, upload the provider's module to
   `/modules/gateways/` first.
4. Switch to the **Manage Existing Gateways** tab, paste your API credentials,
   set the display name and currency, and **Save**.
5. **Test** with a sandbox order, then switch to live credentials.

That covers one provider. In WHMCS specifically, the friction is:

- **Recurring billing.** Hosting renews. For automatic renewals to work, the
  gateway must support tokenised/merchant-initiated payments — and each module
  handles this differently, or not at all.
- **No failover.** If your provider has an outage on a renewal run, those
  invoices fail and dunning kicks in.
- **A module per gateway,** each updated (and broken) on its own schedule.

## Method 2: Add every gateway with one module

1. **Install the PaymentHood module** for WHMCS
   ([free and open-source](/integrations/whmcs/)) — the gateway module plus its
   addon and hooks.
2. **[Create a free PaymentHood account]({{ site.signup_url }})** and connect the
   providers you want, {{ site.provider_floor }} supported.
3. **Manage providers from the dashboard** — add, switch, or route between them
   without touching WHMCS or reinstalling anything.

Because it's one module, adding another provider is a dashboard change, not a new
installation. Renewals, refunds and statuses flow back into WHMCS through the
standard callback, and if a provider fails, payments can route to another.

## Common WHMCS issues (and quick fixes)

- **Gateway not showing at checkout.** Make sure it's under *Manage Existing
  Gateways* (activated), and that the invoice currency matches a currency the
  provider supports.
- **Automatic renewals not charging.** The gateway doesn't support
  tokenised/merchant-initiated payments, or the stored payment token expired.
  This is the single most common WHMCS payment problem.
- **Invoices stuck "Unpaid" after a successful payment.** The gateway's
  **callback URL** isn't reachable or the callback signature isn't verified, so
  WHMCS never marks the invoice paid.
- **Test works, live fails.** Still on sandbox credentials, or the provider
  account isn't activated for live transactions.

## Which should you pick?

One provider, one currency, no renewals to worry about? A single gateway module
is the simplest thing that works. Hosting or SaaS with **recurring billing**,
multiple markets, or a need for a fallback? One module that connects every
provider — and handles renewals and callbacks consistently — saves you from
re-solving the same problems per gateway.

## Where PaymentHood fits

[PaymentHood](/) connects WHMCS to {{ site.provider_floor }} payment providers
through one free, open-source module — with routing, automatic failover,
subscription/recurring support, webhook verification and server-side
confirmation handled for you. Orders, renewals, statuses and refunds flow through
WHMCS as expected, and you switch providers from a dashboard rather than in code.

See the [WHMCS integration](/integrations/whmcs/) and its
[installation guide](/integrations/whmcs/installation/), or browse the full
[provider directory](/providers.html).
