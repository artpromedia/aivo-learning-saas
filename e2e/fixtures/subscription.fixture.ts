import { request } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3101';

export type PlanTier = 'free' | 'starter' | 'growth' | 'unlimited';

export interface TestSubscription {
  subscriptionId: string;
  parentId: string;
  planTier: PlanTier;
  status: 'active' | 'trialing' | 'canceled';
  tutorAddOns: string[];
}

export interface TutorAddOn {
  subject: string;
  tutorId: string;
  status: 'active' | 'provisioning';
}

export async function createTestSubscription(
  parentToken: string,
  planTier: PlanTier = 'growth',
): Promise<TestSubscription> {
  const ctx = await request.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: {
      Authorization: `Bearer ${parentToken}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });

  // Use test payment method to bypass Stripe in test mode
  const res = await ctx.post('/billing/subscriptions', {
    data: {
      planTier,
      paymentMethod: 'test_pm_card_visa',
      testMode: true,
    },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to create subscription: ${res.status()} ${body}`);
  }

  const data = await res.json();
  await ctx.dispose();

  return {
    subscriptionId: data.subscriptionId || data.id,
    parentId: data.parentId,
    planTier,
    status: data.status || 'active',
    tutorAddOns: [],
  };
}

export async function addTutorSubscription(
  parentToken: string,
  learnerId: string,
  subject: string,
): Promise<TutorAddOn> {
  const ctx = await request.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: {
      Authorization: `Bearer ${parentToken}`,
      'Content-Type': 'application/json',
      'x-test-run': 'true',
    },
  });

  const res = await ctx.post('/billing/tutor-add-ons', {
    data: {
      learnerId,
      subject,
      testMode: true,
    },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to add tutor: ${res.status()} ${body}`);
  }

  const data = await res.json();
  await ctx.dispose();

  return {
    subject,
    tutorId: data.tutorId || data.id,
    status: data.status || 'active',
  };
}

export async function createFullSubscriptionWithTutors(
  parentToken: string,
  learnerId: string,
  subjects: string[] = ['math', 'reading'],
): Promise<{ subscription: TestSubscription; tutors: TutorAddOn[] }> {
  const subscription = await createTestSubscription(parentToken, 'growth');
  const tutors: TutorAddOn[] = [];

  for (const subject of subjects) {
    const tutor = await addTutorSubscription(parentToken, learnerId, subject);
    tutors.push(tutor);
  }

  subscription.tutorAddOns = tutors.map((t) => t.subject);

  return { subscription, tutors };
}
