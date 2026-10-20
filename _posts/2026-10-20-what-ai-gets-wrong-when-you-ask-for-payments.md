---
title: "What AI Gets Wrong When You Ask for Payments"
description: "AI builders write a working checkout in minutes. These are the payment mistakes that hide inside it, and how to catch each one before a customer does."
date: 2026-10-20
image: /assets/images/og/blog/what-ai-gets-wrong-when-you-ask-for-payments.jpg
hero: /assets/images/blog/what-ai-gets-wrong-when-you-ask-for-payments.jpg
tags: [payments, security]
# Held back until the two images above exist. Without them the post would publish
# with a broken hero and a broken social card. Delete this line when they are in
# assets/images/blog/ and assets/images/og/blog/.
published: false
---

You describe the shop you want. Twenty minutes later there is a working storefront
with a Pay button, and a test payment goes through. That is a remarkable thing, and
it is also the moment when payment code is most likely to be wrong.

The tools are not careless. Payment code is simply the one part of an app where a
mistake does not look like a mistake. A misaligned button is visible. A checkout
that charges a hundred times too much, believes a forged notification, or hands
your secret key to every visitor still completes a test payment without a single
complaint.

## Why payment mistakes stay quiet

Most of an app fails loudly. A broken page throws an error, a missing image leaves
a hole, a bad query returns nothing. Payments fail in the other direction: the
screen says success, the order says paid, and the problem only exists in the
relationship between your code and someone else's system.

That relationship has rules that are written down in the provider's documentation
and are rarely obvious from the happy path. A model that has read a lot of code
will reproduce the common patterns. The common pattern is not always the one your
provider uses.

## Six mistakes that survive a demo

### 1. The amount is off by a factor of one hundred

Stripe takes amounts in the smallest currency unit, so 2000 means twenty dollars.
Other providers, PaymentHood's API among them, take a decimal in major units:
20.00 means twenty dollars. A model that has seen a great deal of Stripe code tends
to reproduce its habit and multiply by 100, in a place where the target API wants
20.00. The result is a customer charged two thousand dollars for a twenty dollar
item, and a test payment that still "succeeds".

The check takes a minute: pay 1.00 in sandbox and read the amount in the provider's
dashboard. If it says 100.00 or 0.01, you found it.

### 2. The secret key ends up in the browser

Anything the browser can read is public. Variables with a public prefix, such as
VITE_ or NEXT_PUBLIC_, are bundled into the page on purpose, so a key placed in one
is shipped to every visitor. The same goes for a call to the provider made directly
from the front end.

A secret key belongs in a server function and a secret store. The browser should
only ever ask your own server to start a payment. And keep the key out of the chat
window of the tool you are using: a chat is a log, not a vault.

### 3. The success page decides the order is paid

After checkout the customer is sent back to a page on your site. That is a browser
navigation. It can be refreshed, replayed, bookmarked, or typed in by hand, and the
customer may close the tab before it ever loads. Treating it as proof of payment
means anyone who can guess the URL can mark an order paid.

The success page should say that the payment is being confirmed and then read the
order from your own database, which only your server changes.

### 4. The webhook is believed without proof

Your webhook endpoint is a public address, so anyone can post "payment succeeded" to
it. The defence is a signature: a keyed hash that the provider computes over the
exact bytes it sent and that you recompute and compare before you trust anything.

The usual way this goes wrong is parsing the JSON first. Re-encoding changes key
order and whitespace, the recomputed signature never matches, and the check fails
for every real notification. The easiest way to make a failing check pass is to
remove it, and a tool that is asked to make the error go away may do exactly that.
Read the raw body, verify, and only then parse.

### 5. It works in the preview and fails in production

Webhooks need an address the provider can reach, and a preview inside an editor
usually is not one. Even on a deployed site there are traps. Some backends reject a
request that arrives without a login token before your code runs, so every webhook
gets a 401: Supabase Edge Functions do this by default unless verification is turned
off for that one function. Secrets added while developing are often not copied to
the published app, and a changed environment variable usually needs a redeploy
before it takes effect.

The symptom is always the same: customers pay and orders stay pending. We wrote up
the full diagnosis in [customer paid but the order is still pending](/blog/payment-successful-order-still-pending/).

### 6. A retry or an out-of-order message changes the wrong thing

Providers resend notifications that were not acknowledged, and messages can arrive
in the wrong order. A handler that sets the order status from whatever message
arrives last can move a paid order back to pending, or ship the goods twice.

Three habits fix almost all of it. The status only moves forward. The handler is
safe to run twice. And the state you act on comes from reading the payment back from
the provider's API, not from the body of the message, which is only a hint that
something changed. The reasoning is in [webhook verification and
reconciliation](/blog/webhook-verification-reconciliation/), and the same discipline
applies to [retries and idempotency](/blog/automated-retries-payment-idempotency/).

## How to check what the tool wrote

You do not need to read every line. Six tests, each in a couple of minutes, cover
the mistakes above:

- **Amount.** Pay 1.00 in sandbox and confirm the provider's dashboard shows exactly 1.00.
- **Key.** Open the deployed site, view the page source and the network tab, and search for any part of your secret key. It must not appear.
- **Return page.** Open the return URL by hand without paying. The order must stay pending.
- **Signature.** Send your webhook endpoint a request with a wrong signature. It must be rejected.
- **Replay.** Send the same valid notification twice. The order must change once.
- **Order.** Send a Failed notification after a Captured one. The order must not go backwards.

If you want a longer list for the day before launch, the
[payment integration launch checklist](/payment-infrastructure/checklist/) goes
through the failure paths in detail, and [test your checkout before you go
live](/blog/test-your-checkout-before-you-go-live/) covers the testing side.

## Tell the tool the rules before it starts

A request that says only "add payments" leaves every one of those decisions to
guesswork. A prompt that states them removes most of the guessing. A good one says:

- which units the amount is in, and that it is computed on the server;
- that keys live in the server's secret store and are never typed into the chat;
- that the return page proves nothing and the order is confirmed by the webhook;
- the exact signature scheme, to be checked on the raw body inside a time window;
- that the handler is safe to run twice and never moves an order backwards;
- where server code runs in this particular tool, and how a public webhook address is exposed.

The last point is the one that changes from tool to tool, which is why a single
generic prompt is not enough.

## Where PaymentHood fits

PaymentHood publishes ready-made prompts for six groups of AI builders and coding
agents, each stating the rules above for that tool and written against the real API.
They are on the [AI builders page](/integrations/ai-builders/), next to the
documentation at <a href="https://docs.paymenthood.com/" target="_blank" rel="noopener">docs.paymenthood.com<span class="visually-hidden"> (opens in new tab)</span></a>
that they are built from. Run any of them in sandbox first: a prompt makes the first
draft better, and it does not replace a test payment.

## Frequently asked questions

**Can I trust AI to write my payment integration?**
You can trust it to produce a first draft quickly, and you should not trust it to
produce a finished one. The mistakes that matter in payment code do not show up in a
demo, so a few deliberate tests before launch are what turn a draft into something
you can run.

**What should I check first?**
The amount and the key. A wrong amount costs money immediately, and a secret key in
the browser can be used by anyone who finds it. Both take a minute to check.

**Do I need to verify webhooks if the provider is trustworthy?**
Yes. The provider is trustworthy but your webhook address is public, so you cannot
tell its requests from anyone else's without the signature.

**How do I test a payment integration without real money?**
Use the provider's sandbox with its test cards. In PaymentHood, sandbox and live are
separate apps with their own credentials, so nothing in sandbox can touch live data.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I trust AI to write my payment integration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can trust it to produce a first draft quickly, and you should not trust it to produce a finished one. The mistakes that matter in payment code do not show up in a demo, so a few deliberate tests before launch are what turn a draft into something you can run."
      }
    },
    {
      "@type": "Question",
      "name": "What should I check first in AI-generated payment code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The amount and the key. A wrong amount costs money immediately, and a secret key in the browser can be used by anyone who finds it. Both take a minute to check."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to verify webhooks if the payment provider is trustworthy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The provider is trustworthy but your webhook address is public, so you cannot tell its requests from anyone else's without the signature."
      }
    },
    {
      "@type": "Question",
      "name": "How do I test a payment integration without real money?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the provider's sandbox with its test cards. In PaymentHood, sandbox and live are separate apps with their own credentials, so nothing in sandbox can touch live data."
      }
    }
  ]
}
</script>

[Create a free PaymentHood account]({{ site.signup_url }}), or go straight to the
[AI builders page](/integrations/ai-builders/) and pick your tool.
