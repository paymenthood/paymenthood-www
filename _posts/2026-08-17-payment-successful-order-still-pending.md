---
title: "Customer Paid but the Order Is Still Pending: Why It Happens"
description: "A customer's card was charged but the order sits unpaid. Why the browser return is not the payment event, how to diagnose stuck orders, and how to stop them happening."
date: 2026-08-17
tags: [payments, woocommerce, whmcs]
hero: /assets/images/blog/payment-successful-order-still-pending.svg
---

The email always reads the same way. *"I paid — my bank shows the money left my
account. Why does my order say pending?"* You open the admin, and there it is: an
order stuck on **Pending payment**, or a WHMCS invoice still marked **Unpaid**,
while the money is quite definitely sitting at your payment provider.

It is one of the most common support tickets in online commerce, and one of the
most damaging, because the customer has already paid and now has to chase you. If
the store auto-cancels unpaid orders, or WHMCS suspends the service on schedule,
you get to charge someone and then switch off what they bought.

The cause is almost never a bug in your store software. It is a wrong assumption
about where a payment is confirmed.

## The browser return is not the payment event

Most hosted checkouts follow the same shape. The customer leaves your site for the
provider, pays there, and the provider sends the browser back to a return URL on
your site. It is very tempting to treat that return as the moment the payment
happened, because from the shopper's point of view it is.

It isn't. The return trip is a **browser navigation**, and browsers are the least
reliable participant in the whole flow. The payment already happened on the
provider's servers; the redirect is just a courtesy afterwards. Any of these break
it while leaving the payment perfectly intact:

- **The customer closes the tab** as soon as they see "payment approved", or their
  phone rings, or the app switches away and never comes back.
- **The session is gone on return.** The redirect back is a cross-site navigation,
  and browser cookie policies — SameSite, and Safari's tracking prevention — will
  drop a session cookie that was not explicitly set up to survive it. Your return
  handler runs with no session, so it cannot tell which cart this payment belongs
  to. This one is nasty because it usually affects only some browsers, so in your
  funnel it looks like ordinary drop-off rather than a fault.
- **Mobile network drops** between the provider and your return URL.
- **A 3-D Secure step** sends the customer through their bank's page, and they
  abandon after authenticating but before the final hop.

In every one of those cases the money moved and your store never heard about it.

## Then why doesn't the webhook save you?

It usually does, which is why this is intermittent rather than constant. But
webhooks have their own failure modes, and they are quieter than the redirect ones.

**Delivery is not guaranteed.** Providers retry a handful of times and then give
up. If your server was down, slow, or mid-deploy during that window, the event is
gone permanently. Nothing tells you it was lost — from your side, a payment that
never arrived and a notification that never arrived look identical.

**Timeouts count as failures.** If your webhook handler does real work inline —
sending the confirmation email, calling an ERP, generating a licence — a slow
downstream service can push you past the provider's timeout. The provider records
a failed delivery and retries, and if the handler is not idempotent, the retries
can double-apply what the first one already did.

**Some providers have no useful webhook at all.** PPRO's Global API, which is how
schemes like [iDEAL](/providers/ideal/) and [Bancontact](/providers/bancontact/)
are reached, configures webhooks per account rather than per payment, and they
carry no merchant reference — so a callback cannot be matched to an order on its
own. There the only reliable answer is to ask the provider directly.

**And a webhook can be forged.** If you act on an unsigned callback you have built
a way for anyone to mark orders paid. Every provider that signs its callbacks
expects you to verify the signature before you trust a single field in it.

## Why "just retry" is the wrong instinct

The reflex is to have the customer pay again, or to retry the charge. Both make it
worse, because the real problem is ambiguity, not failure.

When a request times out, you cannot tell **"the payment did not happen"** from
**"the payment happened and the answer was lost"**. Those two look identical from
outside and need opposite responses. Retry the first and you recover the sale;
retry the second and you charge someone twice — and now you have a stuck order
*and* a duplicate charge to refund.

You do not fix ambiguity by guessing. You fix it by asking the only party that
actually knows.

## How to diagnose a stuck order

Work from the money backwards, not from your store forwards.

1. **Look the payment up at the provider**, by reference, amount and timestamp.
   Everything depends on which of two answers you get, and this is the only place
   the truth lives.
2. **If the provider has no record**, the customer's bank may be showing a
   *pending authorisation* rather than a settled payment. Those fall off by
   themselves, usually within a few days. Nothing was captured, and the right
   answer is to explain that rather than to refund money you never received.
3. **If the provider does have it**, your store missed the notification. Check
   your provider dashboard's webhook or event log: it will show attempted
   deliveries and the response codes you returned. `5xx` or timeouts mean your
   endpoint was the problem; nothing at all means the event was never sent.
4. **Check whether the return URL was ever hit** in your access logs. A payment
   with a webhook attempt but no return hit is the classic closed-tab case.

The pattern across many tickets matters more than any single one. If stuck orders
cluster in one browser, suspect the session-on-return problem. If they cluster in
time, look at what was deploying or degraded during that window.

## The fix: three layers, in this order

**Treat the webhook as a fast hint, not as proof.** Verify its signature, then use
it as a prompt to go and check — not as the fact itself. It makes the common case
instant, and it should never be the only path to a completed order.

**Treat the provider's API as the source of truth.** Before you fulfil, re-read the
payment from the provider server-side and act on what it says. This is the step
that closes the whole class of problems, because it does not care whether the
browser came back or whether the callback arrived.

**Sweep for stragglers.** Anything still unresolved after a sensible window should
be reconciled automatically against the provider, not left for a customer to
report. This is the difference between a stuck order that resolves itself in
minutes and one that becomes an angry email two days later.

Underneath all three, make the operations idempotent. A payment reference should
be able to arrive from the webhook, the return URL and the sweep at the same time
and still result in exactly one paid order and one confirmation email. In practice
that means recording the provider's reference against the order and having the
completion step do nothing if it has already run.

## What this looks like with PaymentHood

This is the layer PaymentHood is: your store integrates once, and the reconciling
happens on our side rather than in your checkout code.

Every provider integration verifies callbacks before acting on them — signature
checks where the provider signs, and a server-side re-read of the charge before
anything is treated as paid. Where a provider offers no reliable callback, the
integration polls the provider instead of trusting a redirect. Payment state is
resolved from the provider, and pushed to your store through a signed webhook of
our own, so your plugin has one thing to trust rather than several.

The free plugins for [WooCommerce](/integrations/woocommerce/) and
[WHMCS](/integrations/whmcs/) sit on top of that, which is why the fix does not
require you to write any of it. You can connect any of our
[{{ site.provider_floor }} payment providers](/providers.html) without changing
how your store handles orders.

Related reading: [why payments fail](/blog/why-payments-fail/), and
[how to test your checkout before you go live](/blog/test-your-checkout-before-you-go-live/).
