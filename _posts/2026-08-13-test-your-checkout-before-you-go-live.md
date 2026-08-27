---
title: "Test Your Checkout Before You Go Live"
description: "Most stores test one thing: a card that works. The failures that cost you money are on the paths nobody tries. A short pre-launch checklist."
date: 2026-08-13
tags: [payments, checkout]
hero: /assets/images/blog/test-your-checkout-before-you-go-live.svg
image: /assets/images/og/blog/test-your-checkout-before-you-go-live.jpg
---

Almost every store tests its checkout the same way: put a test card in, see the
thank-you page, ship it. That proves the one path that was always going to work.
The problems that cost real money are on the paths nobody tried before launch.

Here is the short version of what to test, in the order worth doing it.

## 1. Test a payment that fails

This is the one people skip, and it is the one that matters. Every provider
publishes test cards that trigger a **decline** as well as ones that succeed —
find them in your provider's testing documentation and use them.

What you are checking is not that it fails, but what your store does next: the
customer should see a clear message and still have their cart. If a failed
payment empties the basket or leaves the order stuck, you have just found a bug
that would otherwise have found you on launch day.

## 2. Check the order status, not the thank-you page

Place a successful test order, then go and look at the order in your admin. It
should be marked **paid** — not "pending", not "processing" forever.

These are two different things. The thank-you page only proves the customer's
browser was redirected. The order status proves your store actually heard back
from the provider and believed it. When those two disagree, you get orders you
never fulfil, or worse, orders you fulfil that were never paid.

## 3. Refund it

Refund the test order from your admin, all the way through. Check the money shows
as returned on the provider's side too, not just in your store.

Refunds are the most common thing to be quietly broken, because nobody tests them
until a real customer is waiting for their money back and asking why it is taking
so long.

## 4. Confirm the emails fire

Order confirmation to the customer, order notification to you. Check the spam
folder before you decide it works — and check that the total, currency and order
number in the email match what was actually charged.

## 5. Then do it once for real

Sandbox mode tells you your code works. It does not tell you your **account**
works: live API keys, your bank details, the currency your provider will actually
settle in, whether the payment method you enabled is genuinely active on your
account.

So switch to live keys and buy something from your own store for the smallest
amount you can. Then refund it. It costs you a few cents in fees and it is the
only test that covers the whole path end to end.

## The one thing sandbox will never tell you

Test environments are stable. Real providers are not — they have slow days and
occasional outages, and no amount of testing prevents that. What you can decide
in advance is what your checkout does when it happens: show the customer an
error, or quietly send that payment to a second provider.

That is the difference between having one gateway and having a fallback.

---

If you are setting up a store now, [our free plugins](/integrations/) cover
WooCommerce, WHMCS, VirtueMart, Phoca Cart and J2Commerce, and give you more than
one provider behind a single checkout — so the failover in the last section is a
setting rather than a project. And once you are live, [Why Payments Fail](/blog/why-payments-fail/)
covers what to do about the declines you will start seeing.
