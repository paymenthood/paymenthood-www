---
title: "Webhook Verification and Reconciliation, Explained"
description: "How webhook verification prevents double-processing, and how reconciliation keeps your transaction records in sync once more than one provider is taking money."
date: 2026-09-05
tags: [webhooks, architecture]
redirect_from: /blog/webhooks-for-payment-events/
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

## Webhooks are the news, not the record

Everything above makes a single webhook trustworthy. It does not make your books
correct, and the difference matters as soon as a second provider starts taking
money.

A webhook is an event: *this happened, probably just now*. A ledger is a
statement: *this is what is true, as of today, across everything*. Events are
delivered individually, out of order, sometimes twice, and occasionally not at
all — providers retry a handful of times and then stop. A verified webhook tells
you what one provider believes about one payment at one moment. It does not tell
you that you heard about every payment.

That last gap is the one nobody plans for, because it is silent by construction.
A payment that succeeded and whose webhook never arrived looks — from inside your
system — exactly like a payment that never happened. There is no error, no failed
job, no alert. The money is at the provider and your database does not know.

## Reconciliation is the check that webhooks were enough

Reconciliation is the periodic comparison between what you think happened and
what each provider says happened. It is the only mechanism that catches the
failure mode above, and it is boring in the way that load-bearing things usually
are.

The shape of it is simple. For a period — a day is a reasonable default — pull
the provider's own list of transactions, compare it against your records, and
produce three sets:

- **In both, and matching.** The overwhelming majority. Nothing to do.
- **At the provider, not in your system.** A payment you never learned about. A
  lost webhook, almost always. The customer paid and may currently be waiting for
  something you have not delivered.
- **In your system, not at the provider.** Rarer and more alarming: something
  marked paid that the provider has no record of. Usually a bug in your own
  handling, occasionally a test transaction against the wrong environment.

The first time a team runs this, the second set is almost never empty. That is
not a sign of a badly built system; it is the normal background rate of webhook
delivery meeting a system that had no way to notice.

## Why several providers make it a different job

With one provider, reconciliation is mostly a formality — its dashboard is the
ledger, and its settlement report is the source of truth that finance already
uses.

With several, that stops being available, and not because anything is broken.
Each provider reports in its own shape: different field names, different
treatment of fees (deducted per transaction by some, netted at payout by others),
different timing between capture and settlement, different currencies at
different conversion points, and different identifiers for what you consider one
order. None of that is an error. It is simply not the same schema, and nothing
reconciles it by default.

So the question "what did we take yesterday, net of fees, across everything"
becomes a manual merge that somebody owns, takes a day, and degrades as volume
grows. Refunds and chargebacks arrive late and out of order and make it worse.

The fix is structural rather than clerical: normalise at the point of capture,
not at the point of reporting. Every transaction gets one internal identity and
one internal shape the moment it happens, whichever provider handled it, and the
provider's own reference is stored alongside rather than instead. Reconciliation
then compares two records that already describe the same thing, instead of
reconstructing that relationship a month later from two reports that were never
designed to be compared.

## A practical checklist

Nine things, in the order they are worth doing:

- Verify every signature, for every provider, in one place.
- Treat the endpoint URL as public. It is.
- Make the handler idempotent on the provider's event identifier.
- Never move an order backwards; guard state transitions explicitly.
- Return 2xx quickly and do the work asynchronously, so retries are not caused
  by your own latency.
- Re-query the provider for the authoritative state rather than trusting the
  payload's contents.
- Log every received event, including rejected ones, with enough detail to
  replay it.
- Reconcile daily against each provider's own transaction list.
- Alert on the count of provider-side transactions your system never saw — not
  on zero, but on a change in the rate.

The first six make individual events trustworthy. The last three are how you
find out when that was not enough. The wider architecture these sit inside is in
<a href="/payment-infrastructure/">what payment infrastructure has to do</a>.

## When a webhook never arrives

Everything above assumes the event reaches you. Some will not, and the useful
skill is diagnosing that quickly rather than assuming the payment failed.

Work outward. **Did the provider send it?** Every major provider keeps a delivery
log showing attempts, response codes and retries - check there first, because it
answers whether the problem is yours at all. **Did it reach your server?** A 4xx
or 5xx in the provider's log points at your endpoint; timeouts point at
reachability or latency. **Did your handler accept it?** A verified signature that
fails, an event type you do not handle, or an exception after the 200 all look
like silence from outside.

Two failure modes are worth knowing because they are invisible in normal
monitoring. Returning a 200 and then throwing means the provider considers the
event delivered and will never retry it - the event is gone permanently. And
responding slowly can cause duplicates rather than losses, because a provider
that times out waiting for you will retry an event you already processed.

This is exactly why reconciliation exists as a separate mechanism rather than as
a nice-to-have. Webhooks are a fast path that is usually right; the daily
comparison is the slow path that is always right. Systems that rely only on the
first one are correct until the day they quietly are not.

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
