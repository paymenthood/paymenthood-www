---
title: "Idempotency and Failover When Systems Retry Automatically"
description: "Scripts, bots and AI agents do not retry a payment the way a person does. Why that matters for idempotency, duplicate charges and unresolved payment state."
date: 2026-09-05
tags: [architecture, payments]
redirect_from: /blog/risks-of-letting-ai-agents-pay/
---

Most writing about AI agents and money is about authority: how much an agent may
spend, on whose behalf, and who is liable. Those are real questions and they are
being worked on in public.

This is about something narrower and more immediate. Long before an agent is
trusted with a budget, it is already making the same HTTP call your checkout makes
— and it behaves differently from a human in one specific way that payment systems
were not designed for.

**A person who is not sure whether their payment went through stops and checks. An
agent tries again.**

Everything below follows from that sentence.

## The gap a human quietly covers

Consider the ordinary failure: your system sends a charge, the provider processes
it, and the response is lost on the way back. A timeout. Your system knows only
that it did not hear an answer.

This is not rare. It is the normal failure mode of a network, and it happens to
every payment system at some volume.

With a person at the keyboard, an informal safety net engages. They see a spinner
that never resolves. They **do not** immediately press pay again — and when they do,
they usually check their bank first, or email support, or wait. If they are charged
twice they notice and complain, which is unpleasant but is also a repair mechanism.
Human hesitation has been silently compensating for imperfect payment code for
decades.

An agent has none of that. It receives a timeout, classifies it as a retryable
error, and retries — in milliseconds, with an identical request, with no notion
that money may already have moved. If your idempotency is weak, the customer is
charged twice before anyone could have looked.

## Four ways it goes wrong

**Retry velocity.** A human retries three times over ten minutes. An agent with an
exponential-backoff policy can produce a dozen attempts in a minute — and a dozen
attempts against a card is also, from your provider's point of view, a pattern that
looks like [card testing](/blog/card-testing-fraud-signup-forms/). You can trip
your own fraud controls with entirely legitimate traffic.

**Unknown state treated as failure.** Systems tend to encode "no response" as
failure because that is the safe assumption for a read. For a write that moves
money it is the dangerous one. The correct response to a timeout is a *status
query*, not a retry — go and ask the provider what actually happened. Agents
overwhelmingly do the second.

**No shared memory of the attempt.** Two agent runs, or the same agent after a
restart, have no idea a charge is in flight. Whatever remembers that has to live in
your payment layer, not in the agent's context, because the context is the least
durable thing in the system.

**Confident narration.** An agent will report success or failure in fluent prose
based on what it inferred, and a timeout narrated as "the payment failed" is a
statement your user will act on. The truth is that nobody knows yet, which is a
harder sentence to say and the only accurate one.

## The requirement this produces

None of this is exotic. It is the ordinary correctness of a payment system, held to
a standard where human hesitation is no longer papering over the gaps:

- **The identity of a payment attempt cannot be per-request.** A key generated when
  the HTTP call is made protects nothing, because the retry is a new call and gets a
  new key. It has to be derived from the order and reproducible without the agent
  remembering anything.
- **That identity has to live above the providers.** Provider A's idempotency key
  means nothing to provider B, so the moment a retry crosses providers is the moment
  provider-level protection stops working — the argument in [how payment failover is
  actually built](/payment-infrastructure/failover/).
- **Unknown has to be a real state.** Not a synonym for failed. Something has to
  resolve it by asking the provider, with a bounded time before a human is involved.
- **Terminal states have to be terminal.** An agent that can retry a payment marked
  final will eventually try.
- **Rate limits have to exist on your side.** Not because the agent is hostile, but
  because it does not get tired.

## Deriving a key that actually protects you

An idempotency key is the whole defence, and it is usually the part implemented
wrongly — not because the concept is hard, but because the wrong derivation looks
correct in every test that gets written.

The rule is that the key must identify **the payment attempt**, not the request.
A key generated fresh per HTTP call provides no protection at all: the retry
carries a different key, the provider sees an unrelated payment, and you get two
charges. This is the single most common implementation error, and it passes every
happy-path test, because the happy path never retries.

Derive it from something stable that both the caller and the retry already know —
the order identifier plus an attempt number is usually enough. If you cannot name
what makes it stable, it is not stable.

The subtlety that catches people out is **which** retries share a key:

- A retry after a **timeout** is the *same* attempt. It must reuse the original
  key, so the provider can tell you what happened to the first request instead of
  performing a new charge.
- A retry after a **definitive decline** is a *new* attempt. It needs a new key —
  reuse the old one and you will get the cached decline back forever and conclude,
  wrongly, that the card is dead.

Automation makes both cases sharper. A human who sees a timeout waits, reloads,
and often gives up; a script retries in milliseconds, sometimes in parallel, and
keeps going. A key that is merely usually-correct will be found out.

## What the provider gives you, and what it does not

Most major providers support idempotency keys, and it is tempting to treat that
as the problem being solved. It solves one layer of it.

The provider guarantees that two requests carrying the same key produce one
charge, generally within a retention window measured in hours or days. That is
real and valuable. Three things it does not do:

**It does not span providers.** A key is scoped to the provider that received it.
If a retry is routed elsewhere — which is exactly what failover does — the second
provider has never seen that key and will happily create a second payment. Retry
identity has to live above the providers, in your own layer, or failover and
idempotency actively work against each other. That is the design problem in
<a href="/payment-infrastructure/failover/">how failover is actually built</a>.

**It does not cover your own side.** If your system creates a second payment
record before the call, or your job runner starts two workers on the same task,
the provider never sees a duplicate key because your system genuinely made two
distinct attempts. The guarantee protects the network hop, not your orchestration
of it.

**It expires.** A retry that arrives after the retention window is a new payment
as far as the provider is concerned. Automated systems with long backoff schedules
can and do cross that boundary.

## Proving it works before it matters

Idempotency is easy to believe you have and hard to notice you do not, because
the failure only appears under conditions nobody reproduces casually. Four tests
settle it, and each takes an afternoon:

- **Send the same charge twice with the same key.** Expect one payment and two
  identical responses.
- **Kill the connection mid-charge, then retry.** Expect the system to reach a
  resolved state with exactly one charge — this is the test that finds a key
  generated per request.
- **Fire two workers at the same payment simultaneously.** Expect one charge, not
  a race that both sides win.
- **Retry after a decline with the old key.** Expect a new attempt to be possible;
  if you get the cached decline back, your key is too coarse.

None of these require a provider sandbox that simulates failure. They require
breaking the connection at your own boundary, which you control. The broader
pre-launch list is in
<a href="/blog/test-your-checkout-before-you-go-live/">test your checkout before
you go live</a>, and the failure taxonomy that decides what deserves a retry at
all is in <a href="/blog/why-payments-fail/">why payments fail</a>.

## What this is not

Worth being clear about the boundary, because this space attracts overclaiming.

PaymentHood does not issue virtual cards, enforce per-agent spending limits, or
implement agent-payment protocols such as AP2 or x402. Those are real areas of work
and other people are doing them; we are not, and a page saying otherwise would be
marketing rather than engineering.

What we do is the layer underneath all of that — and the argument of this post is
that the layer underneath is where the failures actually happen. An agent framework
with excellent spending controls sitting on a payment integration whose idempotency
key is generated per request will still double-charge customers.

## If you think it has already happened

Duplicate charges are usually discovered from the customer side, which means by
the time anyone looks the transaction is days old and the logs have rotated.
Three checks find them without a rebuild.

**Look for charges close together with the same amount and customer.** A window
of a few minutes catches almost all retry duplicates, because automated retries
are fast by nature. If two charges are hours apart, that is a different problem -
usually a scheduler running twice.

**Compare provider transaction counts against your own.** If the provider shows
more successful payments than your system recorded, the difference is either
duplicates or payments whose confirmation never arrived. Both matter and they
need different fixes.

**Check whether refunds cluster.** Support refunding the same customer twice in a
month, repeatedly, is the human-visible shadow of a duplicate-charge bug that
nobody has traced to its cause.

Once found, the fix is upstream rather than in the refunding. Duplicates are
almost always one of three things: a key generated per request instead of per
attempt, a retry that moved providers and lost its identity, or two workers
racing on one task. Each is cheap to fix and expensive to leave, because the rate
is proportional to traffic and therefore grows exactly as the business does.

## Where PaymentHood fits

[PaymentHood](/) is a [payment orchestration
platform](/payment-orchestration/): one integration between your application and
[{{ site.provider_floor }} providers](/providers.html), with routing, failover,
idempotency, webhook verification and reconciliation handled in the layer rather
than in whatever is calling it.

The property that matters here is where the identity of a payment lives. Charge
creation is idempotent on **your own order reference**, checked before any provider
is contacted — so a repeated create returns the original payment rather than making
a second one, whichever provider is involved and however fast the caller is. And
payments left in flight are resolved by querying the provider for what actually
happened, rather than by inferring an outcome from a dead connection.

That is not an agent feature. It is a payment-correctness feature that agents make
much harder to skip.

[Create a free PaymentHood account]({{ site.signup_url }}), or read [payment
infrastructure for SaaS](/payment-infrastructure/) for what the rest of the layer
has to do.
