---
title: "How to Accept Crypto Payments on Your Store (Without Holding Crypto)"
description: "How to accept crypto payments on your store — which providers to use, how settlement to fiat works, chargeback protection, and how to add crypto alongside cards."
date: 2026-08-31
tags: [payments, crypto]
hero: /assets/images/blog/how-to-accept-crypto-payments.svg
---

Accepting crypto payments used to mean picking a coin, holding a volatile balance,
and hoping your accountant forgave you. It doesn't any more. Today you can **accept
crypto payments** the same way you accept cards — the customer pays, you get settled
in the currency you actually want, and the volatility is someone else's problem.

This guide covers when crypto is worth offering, how it works at checkout, and how to
add it **alongside** your existing card payments rather than bolting on a separate
system you have to maintain.

## Why accept crypto payments?

Crypto is not the right fit for every store, but for the right ones it opens revenue
that cards leave on the table:

- **Customers cards can't reach.** In many markets, and for many buyers, a crypto
  wallet is easier than an international card that gets declined at checkout.
- **No chargebacks.** A confirmed on-chain (or exchange-settled) payment is final.
  For **high-risk sectors** — where card chargebacks and account freezes are a
  constant tax — this alone is the reason to offer it.
- **Global by default.** A wallet doesn't care which country your acquirer is in.
- **Lower friction for crypto-native audiences.** If your buyers already hold crypto,
  paying with it is one tap, not a card form.

If none of those describe your customers, cards and local methods are probably
enough. If several do, crypto is a method worth having on the checkout.

## What actually worries merchants (and the real answer)

Most hesitation comes down to four questions:

**"Do I have to hold crypto?"** No. Depending on the provider, a crypto payment can be
**converted and settled to fiat** so what lands in your account is the currency you
price in — you never carry a token balance if you don't want one.

**"What about volatility?"** With fiat settlement, the conversion happens at payment
time, so a price swing an hour later doesn't touch the sale. If you *choose* to settle
in crypto or a stablecoin, that's a deliberate decision, not a default.

**"Which coins do I accept?"** That's set by the crypto provider you connect — major
coins and stablecoins are the usual baseline. You don't need to support everything;
you need to support what your buyers actually use.

**"Is it compliant and safe?"** The payment is confirmed the same disciplined way any
payment should be — verified server-side before you release goods, never on a browser
redirect alone. Tax and reporting still apply; crypto income is income.

## How crypto payments work at checkout

The flow is closer to a hosted card payment than most people expect:

1. The customer chooses **crypto** at checkout and is shown an amount and a
   wallet/QR or an exchange-pay prompt.
2. They pay from their wallet or exchange account.
3. The **crypto payment provider** confirms the transaction and either forwards the
   crypto or converts it to fiat for settlement.
4. Your store is notified, your server **re-checks the payment status directly with
   the provider**, and only then marks the order paid.

That last step matters: as with any payment, you confirm server-side rather than
trusting a redirect back to your success page.

## Adding crypto without building a separate silo

Here's the trap. Each crypto provider — Binance Pay, OxaPay, BitPay and others — is
its **own** integration, with its own API, its own callbacks and its own dashboard.
Add one and you've added another payment system to maintain, separate from the cards
and local methods you already run. Offer crypto in two stores or on two platforms and
you're maintaining it twice.

The cleaner model is to treat crypto as **one more method behind a single
integration**, exactly like a card or a local rail — which is what a
[payment orchestration platform](/blog/what-is-payment-orchestration/) does. You
present crypto to the customers who want it, keep cards for everyone else, and manage
all of it in one place instead of one integration per method. It's the same reasoning
that lets you [offer local payment methods](/blog/local-payment-methods-why-cards-lose-sales/)
per market without ten separate builds.

## How PaymentHood adds crypto payments

[PaymentHood](/) lets you connect crypto providers — **Binance Pay, OxaPay, BitPay**
and more — **alongside** cards, wallets and local rails, through one integration
across {{ site.provider_floor }} providers. Crypto becomes another method on the same
checkout: you enable it for the stores or markets that want it, payments are verified
server-side before an order is released, and there's no per-transaction fee from
PaymentHood — you pay only your chosen provider's processing fees.

Because it's one integration, adding crypto is a dashboard change rather than a new
build, and it sits next to your existing methods instead of in a silo of its own.

## Frequently asked questions

**Can I accept crypto and cards on the same checkout?**
Yes. Crypto is best offered *alongside* cards, not instead of them — most stores keep
cards as the default and add crypto as an extra method for the customers who prefer it.

**Do I have to hold cryptocurrency to accept it?**
No. Depending on the provider you connect, payments can be settled to fiat, so you
receive the currency you price in and never hold a crypto balance unless you choose to.

**Is accepting crypto safe from chargebacks?**
A confirmed crypto payment is final — there's no card-style chargeback. That finality
is a major reason high-risk merchants add it, though it also means refunds must be
handled deliberately, back through the provider.

**Which platforms can I accept crypto on?**
Through PaymentHood, crypto works on the same platforms as every other method —
WooCommerce, WHMCS, VirtueMart, Phoca Cart and J2Commerce — via one free plugin.

## Where PaymentHood fits

If you want to accept crypto payments without standing up a separate payment system to
run it, the answer is to add crypto as one more method behind a single integration.
PaymentHood connects your store to {{ site.provider_floor }} providers — cards,
wallets, local rails and crypto — through one free integration, with routing,
failover, webhook verification and server-side confirmation built in. Free plugins are
available for [WooCommerce](/integrations/woocommerce/), [WHMCS](/integrations/whmcs/),
VirtueMart, Phoca Cart and J2Commerce.

[Create a free PaymentHood account]({{ site.signup_url }}), or browse the
[provider directory](/providers.html) to see which crypto and card providers are
supported in your market.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I accept crypto and cards on the same checkout?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Crypto is best offered alongside cards, not instead of them. Most stores keep cards as the default and add crypto as an extra method for the customers who prefer it."
      }
    },
    {
      "@type": "Question",
      "name": "Do I have to hold cryptocurrency to accept it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Depending on the provider you connect, payments can be settled to fiat, so you receive the currency you price in and never hold a crypto balance unless you choose to."
      }
    },
    {
      "@type": "Question",
      "name": "Is accepting crypto safe from chargebacks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A confirmed crypto payment is final, so there is no card-style chargeback. That finality is a major reason high-risk merchants add it, though it also means refunds must be handled deliberately through the provider."
      }
    },
    {
      "@type": "Question",
      "name": "Which platforms can I accept crypto payments on?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Through PaymentHood, crypto works on the same platforms as every other method, including WooCommerce, WHMCS, VirtueMart, Phoca Cart and J2Commerce, via one free plugin."
      }
    }
  ]
}
</script>
