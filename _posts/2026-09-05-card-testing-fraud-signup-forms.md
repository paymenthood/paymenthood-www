---
title: "Card Testing on Signup Forms: Spot It and Stop It"
description: "Card testing turns your signup form into someone else's validation tool. How to recognise the pattern, why CAPTCHA is not the fix, and the rules that actually stop it."
date: 2026-09-05
tags: [fraud, payments]
---

Somebody has a list of stolen card numbers. Most of them are dead. Before they can
be sold or used for anything substantial, the working ones have to be separated
from the cancelled ones — and that requires a merchant willing to attempt a small
charge against each one.

That merchant is you, and your signup form is the tool. **Card testing** is not an
attack on your business in the usual sense; nobody is trying to take anything from
you. You are infrastructure in someone else's workflow, and you pay for the
privilege.

## Why signup forms specifically

The requirements for a good card-testing target are narrow, and a SaaS signup flow
meets all of them:

- **A small charge.** A trial converting at $1, or a low-priced starter plan. Large
  amounts get declined for reasons that tell the attacker nothing.
- **Instant, automated feedback.** The response says approved or declined
  immediately, which is the entire product being extracted.
- **No human between attempt and answer.** Nobody reviews a signup.
- **Cheap accounts.** No shipping address to fake, no identity check, no wait.

Nothing on that list is a flaw in your product. They are all features, and the
same ones that make signup frictionless for real customers.

## The bill

The charges themselves are rarely the expensive part. What follows is:

- **Processing fees on every attempt**, including declines. Thousands of attempts
  is a real invoice for revenue that never existed.
- **Your decline rate**, which your provider watches. Every acquirer has a
  threshold, and crossing it starts a review — and a review of a merchant whose
  traffic looks like card testing does not go well. [The limits of a single
  payment processor](/blog/single-payment-processor-limitations/) covers what an
  account review actually does to a business.
- **Chargebacks later.** The cards that worked get used elsewhere, and some of
  those disputes trace back through your small charge.
- **Poisoned metrics.** Signups, conversion rate and approval rate all become
  fiction for as long as it runs.
- **Infrastructure**, if each signup provisions something before payment clears.

## How to recognise it

Card testing has a shape, and once seen it is unmistakable:

- A **decline rate that jumps** rather than drifts — from a few percent to most of
  your attempts, within an hour.
- **Many distinct card numbers** across few accounts, few IP addresses, or one
  narrow time window.
- **Sequential-looking card numbers**, or many cards sharing a BIN — the first six
  digits, which identify the issuer. A real customer base does not cluster like
  that.
- **Attempts far outside your normal traffic pattern**, geographically or by hour.
- **Disposable or patterned email addresses**, often one per card.
- **Uniform, fast attempts.** Real people hesitate, mistype, and abandon. Automated
  traffic does not.

If you have no view of decline rate over time, that is the first thing to build.
You cannot see this pattern in a metric you do not have.

## Why the obvious defences underperform

**CAPTCHA** raises the cost per attempt and does not change the economics. Solving
services are cheap and readily available, and the attacker's return per successful
card is high enough to absorb it. It is worth having. It is not a control.

**Rate limiting by IP** works for about an hour, until the traffic redistributes
across a residential proxy pool. Also worth having, also not sufficient alone.

**Blocking countries** blocks customers. The traffic originates wherever proxies
are, which is frequently the same places your real customers are.

The reason these underperform is that they all try to identify *who* is attempting.
The reliable signal is not who — it is the **shape of the attempts**.

## What actually works

Controls that count behaviour over a window, and act automatically:

- **Attempts per customer per period.** A real customer retries two or three times
  and stops. Nobody legitimately attempts fifteen payments in an hour.
- **Distinct cards per customer.** This is the strongest single signal available.
  A genuine customer has one or two cards. Six distinct cards on one account in a
  day has no innocent explanation.
- **Reaction to repeated provider rejections.** Not just total attempts, but
  attempts the provider *refused*. A customer accumulating declines is the exact
  population you want to stop before your acquirer notices them.
- **Total amount per period**, which catches the variant that tests with larger
  charges.
- **Automatic action.** The rule has to reject the payment or block the customer
  itself. A rule that files a report is not a control — by the time the report is
  read, the run is finished.

The important property of all of these is that they degrade gracefully for real
customers. A limit of six distinct cards a day is invisible to essentially every
legitimate user and fatal to a testing run.

## What the attack actually is

It helps to be precise about the economics, because they explain every design
choice the attacker makes and therefore every control that works.

Someone has a list of card numbers of unknown quality — bought, scraped, or
generated from a known BIN range. The numbers are worth very little in that
state and a great deal once sorted into "live" and "dead". Sorting them requires
putting each one through a real authorisation against a real merchant and
reading the answer. That is the entire operation: your signup form is being used
as a validation oracle.

Three consequences follow directly.

The attacker does not want your product. Provisioning is irrelevant to them, and
so is completing the purchase. An authorisation that is immediately abandoned is
a perfectly good result — which is why "but they never actually subscribed" is
not reassurance.

The attacker wants small amounts. A low-value charge attracts less issuer
scrutiny and is less likely to be noticed by the cardholder before the card can
be resold. This is why free trials with a verification charge and cheap entry
plans are targeted far more than expensive ones.

The attacker wants volume and speed. The value is in the throughput of the
sorting operation, so the traffic arrives in bursts, and the same infrastructure
gets pointed at many merchants. You are rarely singled out; you are simply on a
list of forms that accept cards without much friction.

## Reading the pattern in your own data

The signature is not a single suspicious transaction. It is a *shape*, and it is
visible in data you already have.

**Approval rate collapses in a window.** Ordinary traffic approves most of the
time. A validation run inverts that, because most of the cards being tested are
dead. A sharp drop in approval rate over minutes, against a normal-looking
transaction count, is the clearest single indicator.

**Distinct cards per customer identity goes vertical.** Real customers use one
card, occasionally two. Ten distinct card numbers against one account, one email
pattern, one IP or one device in a short window is not a customer having
trouble.

**The failures are structurally similar.** A genuine decline mix is varied —
insufficient funds, expired, do-not-honour, all in proportion. A validation run
produces a narrow band of codes repeated at speed, because the population being
tested is homogeneous.

**Signup metadata degenerates.** Sequential or algorithmic email addresses,
disposable domains, identical user agents, and an implausible signup-to-payment
time — humans take tens of seconds to fill a form; scripts do not.

**Amounts are identical and minimal.** Every attempt is the same small figure,
because they are all the same probe.

Any one of these is weak evidence. Two or three together, in the same window, is
the attack.

## Ordering the response

The controls that work are unglamorous, and the order matters more than the
sophistication — a rate limit deployed today outperforms a scoring model
deployed next quarter.

Start with **velocity limits**, which cost nothing and stop the cheap version
outright: attempts per identity per window, attempts per IP, and distinct card
numbers per account. Cap these low enough that a real customer never notices and
a sorting run dies immediately.

Then add a **reaction to repeated failure**. The important asymmetry is that a
legitimate customer who fails three times usually stops; a script does not. A
rule that escalates on consecutive declines — cooling off, requiring a
challenge, or blocking the identity — turns the attacker's own throughput
requirement against them.

Then remove the reward. If the outcome of a successful authorisation is instant
provisioning, the attack has a second payoff beyond card validation. Introducing
even a short verification step between payment and provisioning removes it, and
costs a real customer almost nothing.

Only after those are in place is a scoring model or a third-party fraud tool
worth the integration effort, because by then you are catching the residual
rather than the bulk.

## What the attack actually is

It helps to be precise about the economics, because they explain every design
choice the attacker makes and therefore every control that works.

Someone has a list of card numbers of unknown quality. The numbers are worth very
little in that state and a great deal once sorted into "live" and "dead". Sorting
them requires putting each one through a real authorisation against a real
merchant and reading the answer. That is the entire operation: your signup form
is being used as a validation oracle.

Three consequences follow directly.

The attacker does not want your product. Provisioning is irrelevant to them, and
so is completing the purchase. An authorisation that is immediately abandoned is
a perfectly good result — which is why "but none of them subscribed" is not
reassurance.

The attacker wants small amounts. A low-value charge attracts less issuer
scrutiny and is less likely to be noticed by the cardholder before the card can
be resold. This is why free trials with a verification charge, and cheap entry
plans, are targeted far more than expensive ones.

The attacker wants volume and speed. The value is in throughput, so traffic
arrives in bursts, and the same infrastructure is pointed at many merchants. You
are rarely singled out; you are on a list of forms that accept cards without much
friction.

## Reading the pattern in your own data

The signature is not a single suspicious transaction. It is a *shape*, and it is
visible in data you already have.

**Approval rate collapses in a window.** Ordinary traffic approves most of the
time. A validation run inverts that, because most cards being tested are dead. A
sharp drop in approval rate over minutes, against a normal-looking transaction
count, is the clearest single indicator.

**Distinct cards per identity goes vertical.** Real customers use one card,
occasionally two. Ten distinct card numbers against one account, one email
pattern, one IP or one device in a short window is not a customer having trouble.

**The failures are structurally similar.** A genuine decline mix is varied. A
validation run produces a narrow band of codes repeated at speed, because the
population being tested is homogeneous.

**Signup metadata degenerates.** Sequential or algorithmic email addresses,
disposable domains, identical user agents, and an implausible signup-to-payment
time — humans take tens of seconds to fill a form; scripts do not.

**Amounts are identical and minimal.** Every attempt is the same small figure,
because they are all the same probe.

Any one of these is weak evidence. Two or three together, in the same window, is
the attack.

## Ordering the response

The order matters more than the sophistication — a rate limit deployed today
outperforms a scoring model deployed next quarter.

Start with **velocity limits**, which cost nothing and stop the cheap version
outright: attempts per identity per window, attempts per IP, and distinct card
numbers per account. Set them low enough that a real customer never notices and a
sorting run dies immediately.

Then add a **reaction to repeated failure**. The useful asymmetry is that a
legitimate customer who fails three times usually stops; a script does not. A
rule that escalates on consecutive declines — cooling off, requiring a challenge,
or blocking the identity — turns the attacker's own throughput requirement
against them.

Then remove the reward. If a successful authorisation results in instant
provisioning, the attack has a second payoff beyond card validation. A short
verification step between payment and provisioning removes it and costs a real
customer almost nothing.

Only after those are in place is a scoring model or third-party fraud tool worth
the integration effort, because by then you are catching the residual rather than
the bulk.

Two related points sit elsewhere. A burst of card testing looks a lot like a
provider problem in your metrics — approval rate collapses either way — so it is
worth knowing how the two are told apart before you reroute traffic that was never
going to succeed: <a href="/payment-infrastructure/failover/">how failover is
actually built</a> covers why a decline must never mark a provider unhealthy. And
if you sell hosting, VPN or domains, this attack is not an occasional event but a
standing condition of the category — <a href="/integrations/hosting/">payments for
hosting companies</a> covers what else changes. Where these controls sit among the
other jobs of a payment layer is in <a href="/payment-infrastructure/">what payment
infrastructure has to do</a>.

## Don't provision before the money clears

A separate failure that makes card testing much more expensive: acting on the
browser redirect instead of a confirmed payment. If an account is created, a
resource provisioned or a trial started because a page loaded, you are giving away
the product on attempts that were never paid. Fulfil on server-side confirmation
only — the general version of this mistake is in [customer paid but the order is
still pending](/blog/payment-successful-order-still-pending/).

## How PaymentHood helps

[PaymentHood](/) includes a rule engine that runs on the payment path itself,
which is the only place these controls work — a rule enforced after the charge is
a report, not a defence. Rules are configured per app as fraud policies, and count
over a daily, weekly or monthly window:

- **Payment count** — attempts in the period.
- **Provider reject count** — attempts the provider refused, the signal that most
  directly predicts an acquirer review.
- **Distinct cards** — the strongest single indicator of testing.
- **Total amount** — the variant that uses larger charges.

Each rule either rejects the payment or blocks the customer outright, and can be
scoped to specific providers and currencies. Alongside them, a firewall layer
filters by IP range, specific address and country, can refuse VPN traffic, and can
require a minimum reputation score for the IP, email address or phone number
before a payment is allowed to proceed.

Because it all sits in the payment layer rather than in your application, the same
policy protects every checkout you run — your app, your [WooCommerce
store](/integrations/woocommerce/), your [WHMCS billing](/integrations/whmcs/) —
without being implemented three times.

[Create a free PaymentHood account]({{ site.signup_url }}), or work through the
[payment integration launch checklist](/payment-infrastructure/checklist/) to see
which of these controls your current setup is missing.
