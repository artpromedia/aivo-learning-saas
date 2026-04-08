#!/usr/bin/env npx tsx
/**
 * Stripe Test Setup Script
 *
 * Creates the products and prices in Stripe that match the billing-svc plans.
 * Run once against your Stripe test-mode account to bootstrap price IDs.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup.ts
 *
 * The script prints the env vars you need to add to your .env file.
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith("sk_test_")) {
  console.error(
    "Error: Set STRIPE_SECRET_KEY to your Stripe test secret key (sk_test_...).\n" +
    "Usage: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup.ts",
  );
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

interface PlanSpec {
  id: string;
  name: string;
  description: string;
  priceAmountCents: number;
  envVar: string;
}

const plans: PlanSpec[] = [
  {
    id: "STARTER",
    name: "AIVO Starter",
    description: "1 learner, core learning engine, Brain Clone AI assessment",
    priceAmountCents: 1999,
    envVar: "STRIPE_PRICE_STARTER",
  },
  {
    id: "FAMILY",
    name: "AIVO Family",
    description: "Up to 4 learners, Math & ELA Tutors included",
    priceAmountCents: 2999,
    envVar: "STRIPE_PRICE_FAMILY",
  },
  {
    id: "PREMIUM",
    name: "AIVO Premium",
    description: "Up to 4 learners, all 7 AI Tutors included",
    priceAmountCents: 3999,
    envVar: "STRIPE_PRICE_PREMIUM",
  },
];

async function main() {
  console.log("Setting up Stripe test products and prices...\n");

  const envLines: string[] = [];

  for (const plan of plans) {
    // Check if product already exists by searching metadata
    const existingProducts = await stripe.products.search({
      query: `metadata["aivo_plan_id"]:"${plan.id}"`,
    });

    let product: Stripe.Product;

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
      console.log(`  Product "${plan.name}" already exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { aivo_plan_id: plan.id },
      });
      console.log(`  Created product "${plan.name}": ${product.id}`);
    }

    // Check for existing active price on this product
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      type: "recurring",
      limit: 10,
    });

    const matchingPrice = existingPrices.data.find(
      (p) =>
        p.unit_amount === plan.priceAmountCents &&
        p.currency === "usd" &&
        p.recurring?.interval === "month",
    );

    let price: Stripe.Price;

    if (matchingPrice) {
      price = matchingPrice;
      console.log(`  Price already exists: ${price.id} ($${(price.unit_amount! / 100).toFixed(2)}/month)`);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.priceAmountCents,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { aivo_plan_id: plan.id },
      });
      console.log(`  Created price: ${price.id} ($${(price.unit_amount! / 100).toFixed(2)}/month)`);
    }

    envLines.push(`${plan.envVar}=${price.id}`);
  }

  // Set up the customer portal configuration
  try {
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "AIVO Learning - Manage your subscription",
      },
      features: {
        payment_method_update: { enabled: true },
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        invoice_history: { enabled: true },
      },
    });
    console.log("\n  Customer portal configured.");
  } catch (err: any) {
    // Portal config may already exist
    if (err.code !== "resource_already_exists") {
      console.warn(`\n  Warning: Could not configure customer portal: ${err.message}`);
    } else {
      console.log("\n  Customer portal already configured.");
    }
  }

  console.log("\n========================================");
  console.log("Add these to your .env file:");
  console.log("========================================\n");
  for (const line of envLines) {
    console.log(line);
  }
  console.log(`\nSTRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`);
  console.log("STRIPE_WEBHOOK_SECRET=whsec_...  # from 'stripe listen' CLI");
  console.log(`STRIPE_PUBLISHABLE_KEY=pk_test_...  # from Stripe dashboard`);
  console.log("\n========================================");
  console.log("To test webhooks locally, run:");
  console.log("  stripe listen --forward-to localhost:3008/billing/webhooks/stripe");
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
