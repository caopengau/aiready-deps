import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({});

export async function handler(event: any) {
  try {
    const topicArn = process.env.HEALTH_ALERTS_TOPIC_ARN;

    if (!topicArn) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'HEALTH_ALERTS_TOPIC_ARN not configured',
        }),
      };
    }

    // Parse the request body
    let body;
    try {
      body =
        typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch {
      body = event.body || {};
    }

    const { subject, message, failedUrls } = body;

    // Format the alert message
    const alertSubject = subject || 'Health Check Alert';
    const alertMessage = message || 'Health check completed';

    // If there are failed URLs, include them in the message
    let fullMessage = alertMessage;
    if (failedUrls && failedUrls.length > 0) {
      fullMessage += `\n\nFailed URLs:\n${failedUrls.map((url: string) => `- ${url}`).join('\n')}`;
    }

    // Publish to SNS
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: alertSubject,
      Message: fullMessage,
    });

    await sns.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Alert published to SNS',
      }),
    };
  } catch (error) {
    console.error('Error publishing to SNS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to publish alert' }),
    };
  }
}
