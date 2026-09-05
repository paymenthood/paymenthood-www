---
title: "Payment Webhooks: Signing, Retries and Idempotency"
description: "A payment webhook is the only trustworthy news that money moved. How to verify one properly, why your handler must be idempotent, and what a small payload is for."
date: 2026-09-05
tags: [webhooks, architecture]
---

The browser redirect after checkout tells you a browser was redirected. That is
all it tells you. It happens before the payment settles, it does not happen at all
when the customer closes the tab, and it can be forged by anyone who reads the URL.

The webhook is the real news. Which makes the code that receives it some of the
most security-sensitive code in your application, and it is routinely written in
twenty minutes by whoever was integrating the provider that day.

Here is what that endpoint has to do properly.

## Verify the signature, always

An unverified webhook endpoint is an anonymous, publicly reachable way to tell
your system that a payment succeeded. If you fulfil orders on that event, you have
built a way to take goods without paying.

The objection is always the same: *the URL is secret*. It is not. URLs leak through
server logs, proxy logs, browser history, error trackers and screenshots, and
unlike a credential a URL never rotates. Treat the path as public and the signature
as the authentication.

Three details decide whether verification actually works:

**Verify against the raw request body.** The signature covers the exact bytes that
were sent. If your framework parses the JSON and you re-serialise it before
hashing, key order and whitespace change and every signature fails — or worse, you
"fix" it by skipping verification. Capture the raw body before anything touches it.

**Compare in constant time.** A naive string comparison returns faster on an early
mismatch, and that timing difference is enough to reconstruct a valid signature
given enough attempts. Every language has a constant-time comparison; use it.

**Reject on failure.** Not log-and-continue. A signature that does not verify is
either a bug you need to see or an attack, and processing it anyway makes
verification decorative.

## Make the handler idempotent

Webhooks are delivered at least once, not exactly once. The same event will arrive
twice — a retry after your server was slow, a provider being cautious, a network
hiccup between the 200 you sent and the 200 they recorded.

So the handler has to be safe to run repeatedly. In practice that means acting on
the *state* the event describes rather than performing an increment:

```
# fragile - runs twice, pays twice
order.amount_paid += event.amount

# safe - converges to the same result however many times it runs
if order.status != 'paid' and event.state == 'Captured':
    order.mark_paid()
```

The same discipline that keeps a retried charge from double-charging a card keeps
a retried webhook from double-crediting an order. It is the same idea in two
places, and it is unpacked in [how payment failover is actually
built](/payment-infrastructure/failover/).

## Never move an order backwards

Delivery is not ordered. A `Captured` event can arrive before the `Authorized`
event that preceded it, especially when the first delivery was retried and the
second was not.

If your handler assigns state unconditionally, a late-arriving earlier event will
downgrade a completed order — and the customer who paid an hour ago is suddenly
pending again. Treat your payment states as a one-way progression and refuse
transitions that go the wrong way. Terminal states like refunded and failed should
be genuinely terminal.

This also means the event is a *notification*, not an instruction. It tells you
something changed; what it changed to is a question you can answer authoritatively
by reading the payment back.

## Small payloads are a feature

A minimal webhook body — an identifier and a state — looks unhelpful and is
deliberate. A large payload invites your handler to trust attacker-supplied
amounts and statuses, and it goes stale between being generated and being
processed.

The safe pattern is: verify the signature, take the identifier, and fetch the
authoritative record from the API before acting on anything financial. Slightly
more work, dramatically harder to trick.

## Handle retries on both sides

**Answer fast.** Any 2xx means accepted, and providers usually enforce a short
timeout. Do not fulfil an order, send an email and generate a PDF inside the
request. Persist the event, return 200, process asynchronously.

**Fail loudly when you mean it.** If you cannot process an event, return a non-2xx
so it is retried. Returning 200 to make a red line in a dashboard go away discards
the event permanently.

**Expect retries to continue.** A provider that cannot reach you will keep trying
for a long time, which means a handler that has been broken for an hour may get an
hour of history delivered at once when it recovers. That is the moment idempotency
earns its place.

## What PaymentHood does

[PaymentHood](/) sits on both sides of this. Inbound, it verifies each provider's
own signature scheme centrally — Stripe's timestamped HMAC, Paystack's SHA512
digest, Payfast's ITN and the rest — so adding a provider is not another chance
for someone to get signature verification wrong.

Outbound, the webhook you receive follows one documented convention rather than
one per provider. The payload identifies the payment and its new state and nothing
else, deliberately, so you read the authoritative record back from the API. Any 2xx
counts as accepted; anything else is retried automatically, and every attempt is
recorded with its status code where you can see it.

When you configure a signing secret, each delivery carries an HMAC-SHA256
signature over `{timestamp}.{body}` in a `t=…,v1=…` header, which you verify by
recomputing the same value and rejecting timestamps outside your tolerance — the
same shape as the provider schemes above, so you can reuse well-known verification
code. A fixed `Authorization` header is available alongside it: the header proves
the caller knows a shared secret, and the signature additionally proves the body
was not altered. Both are documented with sample code in the [webhook signing
reference](https://docs.paymenthood.com/webhooks/signing/).

[Create a free PaymentHood account]({{ site.signup_url }}), or run your current
integration against the [payment integration launch
checklist](/payment-infrastructure/checklist/) — the webhook section is where most
teams find something.
