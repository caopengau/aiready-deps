import Stripe from 'stripe';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { ProvisioningOrchestrator } from '../../../../lib/onboarding/provision-node';
import {
  sendApprovalEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendAutoTopupSuccessEmail,
} from '../../../../lib/email';
import { addCredits } from '../../../../lib/db';
import { Resource } from 'sst';

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  docClient: DynamoDBDocument,
  TableName: string,
  log: any
) {
  // Handle $29/mo Initial Subscription
  if (session.metadata?.type === 'platform_subscription') {
    const userEmail = session.customer_email || session.metadata?.userEmail;
    const userName = session.metadata?.userName || 'Valued Client';
    const repoName = session.metadata?.repoName;

    if (!userEmail) return;

    // Find the user by email in DynamoDB using GSI1
    const res = await docClient.query({
      TableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :email',
      ExpressionAttributeValues: {
        ':pk': 'USER',
        ':email': userEmail,
      },
    });

    const userItem = res.Items?.[0];
    if (!userItem) return;

    const userId = userItem.PK.replace('USER#', '');

    // Fetch the subscription to get individual item IDs (for metered usage)
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
      { expand: ['items.data.price'] }
    );

    // Find the platform plan tier from metadata
    const platformItem = subscription.items.data.find(
      (item: any) => item.price.metadata?.tier
    );
    const tier = platformItem?.price.metadata?.tier || 'starter';
    const plan = `MANAGED_${tier.toUpperCase()}`;

    // Determine initial fuel based on tier
    const initialFuelMap: Record<string, number> = {
      starter: 1000,
      pro: 5000,
      team: 15000,
    };
    const initialFuel = initialFuelMap[tier] || 1000;

    // Find the metered price item for Mutation Tax
    const mutationTaxItem = subscription.items.data.find(
      (item: any) =>
        item.price.unit_amount === 100 &&
        item.price.recurring?.usage_type === 'metered'
    );

    // Update the user's metadata
    await docClient.update({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      UpdateExpression:
        'SET stripeCustomerId = :customerId, stripeSubscriptionId = :subscriptionId, stripeMutationSubscriptionItemId = :mutationItemId, plan = :plan, aiTokenBalanceCents = if_not_exists(aiTokenBalanceCents, :zero) + :initialFuel, coEvolutionOptIn = :coEvo, tier = :tier, GSI1PK = :gsi1pk, GSI1SK = :gsi1sk, email = :email, #name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':customerId': session.customer as string,
        ':subscriptionId': session.subscription as string,
        ':mutationItemId': mutationTaxItem?.id || null,
        ':plan': plan,
        ':initialFuel': initialFuel,
        ':zero': 0,
        ':coEvo': session.metadata?.coEvolutionOptIn === 'true',
        ':tier': tier,
        ':gsi1pk': `STRIPE#${session.customer}`,
        ':gsi1sk': userEmail,
        ':email': userEmail,
        ':name': userName,
      },
    });

    // Update the main user record status to APPROVED
    await docClient.update({
      TableName,
      Key: { PK: `USER#${userId}`, SK: `USER#${userId}` },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': 'APPROVED' },
    });

    // Send approval notification
    sendApprovalEmail(userEmail, userName).catch((err) =>
      log.error({ err, userId }, 'Failed to send approval email')
    );

    // Trigger Autonomous Provisioning
    const githubToken = (Resource as any).GithubServiceToken.value;
    if (githubToken && repoName) {
      log.info({ userId, email: userEmail }, 'Triggering provisioning');

      await docClient.update({
        TableName,
        Key: { PK: `USER#${userId}`, SK: 'METADATA' },
        UpdateExpression:
          'SET provisioningStatus = :status, provisioningStartedAt = :now',
        ExpressionAttributeValues: {
          ':status': 'PROVISIONING',
          ':now': new Date().toISOString(),
        },
      });

      const orchestrator = new ProvisioningOrchestrator(githubToken);
      orchestrator
        .provisionNode({
          userEmail,
          userId,
          userName,
          repoName,
          githubToken,
          coEvolutionOptIn: session.metadata?.coEvolutionOptIn === 'true',
          sstSecrets: {
            TelegramBotToken: (Resource as any).SpokeTelegramBotToken.value,
            MiniMaxApiKey: (Resource as any).SpokeMiniMaxApiKey.value,
            OpenAIApiKey: (Resource as any).SpokeOpenAIApiKey.value,
            GitHubToken: (Resource as any).SpokeGithubToken.value,
          },
        })
        .then(async (result) => {
          log.info(
            { userId, accountId: result.accountId },
            'Provisioning complete'
          );
          await docClient.update({
            TableName,
            Key: { PK: `USER#${userId}`, SK: 'METADATA' },
            UpdateExpression:
              'SET provisioningStatus = :status, awsAccountId = :accountId, repoUrl = :repoUrl, provisioningCompletedAt = :now',
            ExpressionAttributeValues: {
              ':status': 'COMPLETE',
              ':accountId': result.accountId,
              ':repoUrl': result.repoUrl,
              ':now': new Date().toISOString(),
            },
          });
        })
        .catch(async (err) => {
          log.error({ err, userId }, 'Provisioning failed');
          await docClient
            .update({
              TableName,
              Key: { PK: `USER#${userId}`, SK: 'METADATA' },
              UpdateExpression:
                'SET provisioningStatus = :status, provisioningError = :error',
              ExpressionAttributeValues: {
                ':status': 'FAILED',
                ':error': err.message || 'Unknown error',
              },
            })
            .catch(console.error);
        });
    }
    log.info({ userId, email: userEmail }, 'Managed subscription initialized');
  }

  // Handle AI Fuel Pack Refills
  if (session.metadata?.type === 'fuel_pack_refill') {
    const amountCents = parseInt(session.metadata.amountCents || '1000', 10);
    const customerId = session.customer as string;

    const res = await docClient.query({
      TableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :customerId',
      ExpressionAttributeValues: {
        ':customerId': `STRIPE#${customerId}`,
      },
    });

    const userItem = res.Items?.[0];
    if (userItem) {
      const userId = userItem.PK.replace('USER#', '');
      const email = userItem.email || userItem.GSI1SK;

      if (email) {
        const result = await addCredits(email, amountCents);
        log.info(
          {
            userId,
            amountCents,
            newBalance: result.newBalance,
            wasSuspended: result.wasSuspended,
          },
          'AI credits topped up'
        );

        sendAutoTopupSuccessEmail(email, amountCents, result.newBalance).catch(
          (err) => log.error({ err }, 'Failed to send top-up success email')
        );
      }
    }
  }
}

export async function handleInvoicePaid(
  invoice: any,
  docClient: DynamoDBDocument,
  TableName: string,
  log: any
) {
  const customerId = invoice.customer as string;
  if (!customerId) return;

  const res = await docClient.query({
    TableName,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :customerId',
    ExpressionAttributeValues: {
      ':customerId': `STRIPE#${customerId}`,
    },
  });

  const userItem = res.Items?.[0];
  if (userItem) {
    const userId = userItem.PK.replace('USER#', '');
    await docClient.update({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      UpdateExpression:
        'SET aiTokenBalanceCents = if_not_exists(aiTokenBalanceCents, :zero) + :amount',
      ExpressionAttributeValues: {
        ':amount': 1000,
        ':zero': 0,
      },
    });
    log.info({ userId, customerId }, 'Monthly AI credits replenished');
  }
}

export async function handleInvoicePaymentFailed(
  invoice: any,
  docClient: DynamoDBDocument,
  TableName: string,
  log: any
) {
  const customerId = invoice.customer as string;
  log.warn({ customerId, invoiceId: invoice.id }, 'Payment failed');

  const res = await docClient.query({
    TableName,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :customerId',
    ExpressionAttributeValues: {
      ':customerId': `STRIPE#${customerId}`,
    },
  });

  const userItem = res.Items?.[0];
  if (userItem) {
    const userId = userItem.PK.replace('USER#', '');
    await docClient.update({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      UpdateExpression: 'SET paymentStatus = :status, updatedAt = :now',
      ExpressionAttributeValues: {
        ':status': 'PAYMENT_FAILED',
        ':now': new Date().toISOString(),
      },
    });

    const userEmail = userItem.email || userItem.GSI1SK;
    const userName = userItem.name || 'there';
    if (userEmail) {
      sendPaymentFailedEmail(userEmail, userName).catch((err) =>
        log.error({ err, userId }, 'Failed to send payment failed email')
      );
    }
    log.info({ userId, customerId }, 'Payment failed status recorded');
  }
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  docClient: DynamoDBDocument,
  TableName: string,
  log: any
) {
  const customerId = subscription.customer as string;

  const res = await docClient.query({
    TableName,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :customerId',
    ExpressionAttributeValues: {
      ':customerId': `STRIPE#${customerId}`,
    },
  });

  const userItem = res.Items?.[0];
  if (userItem) {
    const userId = userItem.PK.replace('USER#', '');
    await docClient.update({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      UpdateExpression: 'SET subscriptionStatus = :status, updatedAt = :now',
      ExpressionAttributeValues: {
        ':status': subscription.status,
        ':now': new Date().toISOString(),
      },
    });
    log.info({ userId, status: subscription.status }, 'Subscription updated');
  }
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  docClient: DynamoDBDocument,
  TableName: string,
  log: any
) {
  const customerId = subscription.customer as string;
  log.warn({ customerId }, 'Subscription cancelled');

  const res = await docClient.query({
    TableName,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :customerId',
    ExpressionAttributeValues: {
      ':customerId': `STRIPE#${customerId}`,
    },
  });

  const userItem = res.Items?.[0];
  if (userItem) {
    const userId = userItem.PK.replace('USER#', '');
    await docClient.update({
      TableName,
      Key: { PK: `USER#${userId}`, SK: 'METADATA' },
      UpdateExpression:
        'SET plan = :plan, subscriptionStatus = :status, paymentStatus = :payStatus, updatedAt = :now',
      ExpressionAttributeValues: {
        ':plan': 'FREE',
        ':status': 'CANCELLED',
        ':payStatus': 'CANCELLED',
        ':now': new Date().toISOString(),
      },
    });

    const userEmail = userItem.email || userItem.GSI1SK;
    const userName = userItem.name || 'there';
    if (userEmail) {
      sendSubscriptionCancelledEmail(userEmail, userName).catch((err) =>
        log.error({ err, userId }, 'Failed to send cancellation email')
      );
    }
    log.info({ userId }, 'User downgraded to FREE after cancellation');
  }
}
