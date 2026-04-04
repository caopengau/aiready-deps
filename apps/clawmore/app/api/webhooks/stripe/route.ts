import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { createLogger } from '../../../../lib/logger';
import { Resource } from 'sst';
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from './handlers';

const log = createLogger('stripe-webhook');

const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-2',
});

const docClient = DynamoDBDocument.from(dbClient);
export async function POST(req: NextRequest) {
  const TableName = Resource.ClawMoreTable.name;

  const stripe = new Stripe((Resource as any).StripeSecretKey.value, {
    apiVersion: '2025-01-27-acacia' as any,
  });

  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }
    if (!sig) {
      throw new Error('Missing stripe-signature header');
    }

    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    log.error({ err }, 'Webhook signature verification failed');
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Idempotency check — skip if this event was already processed
    const existingEvent = await docClient.get({
      TableName,
      Key: { PK: `STRIPE_EVENT#${event.id}`, SK: 'PROCESSED' },
    });
    if (existingEvent.Item) {
      log.info(
        { eventId: event.id, eventType: event.type },
        'Duplicate webhook event, skipping'
      );
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          stripe,
          docClient,
          TableName,
          log
        );
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, docClient, TableName, log);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(
          event.data.object,
          docClient,
          TableName,
          log
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          docClient,
          TableName,
          log
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          docClient,
          TableName,
          log
        );
        break;
    }

    // Mark event as processed (TTL: 7 days)
    await docClient.put({
      TableName,
      Item: {
        PK: `STRIPE_EVENT#${event.id}`,
        SK: 'PROCESSED',
        eventType: event.type,
        processedAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error(
      { err: error, eventId: event?.id, eventType: event?.type },
      'Webhook event processing failed'
    );
    // Return 200 to prevent Stripe from retrying business logic errors
    // (signature verification errors already return 400 above)
    return NextResponse.json({ received: true, error: 'processing_failed' });
  }
}
