import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendEmail,
  sendWelcomeEmail,
  sendAnalysisCompleteEmail,
  sendMagicLinkEmail,
  sendRemediationNotificationEmail,
} from '../email';

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ MessageId: 'test-id' }),
}));

vi.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: class {
      send = mockSend;
    },
    SendEmailCommand: class {
      input: any;
      constructor(input: any) {
        this.input = input;
      }
    },
  };
});

describe('Email Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a general email', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      htmlBody: '<p>Hello</p>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('test-id');
    expect(mockSend).toHaveBeenCalled();
  });

  it('should send a welcome email', async () => {
    const result = await sendWelcomeEmail({
      to: 'new@example.com',
      name: 'New User',
    });

    expect(result.success).toBe(true);
    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input.Message.Subject.Data).toContain('Welcome');
    expect(sentCommand.input.Message.Body.Html.Data).toContain('Hi New');
  });

  it('should send an analysis complete email', async () => {
    const result = await sendAnalysisCompleteEmail({
      to: 'user@example.com',
      repoName: 'my-repo',
      aiScore: 85,
      breakdown: { clarity: 90, consistency: 80 },
      summary: {
        totalFiles: 100,
        totalIssues: 10,
        criticalIssues: 2,
        warnings: 8,
      },
      dashboardUrl: 'https://app.getaiready.dev/repo/my-repo',
    });

    expect(result.success).toBe(true);
    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input.Message.Subject.Data).toContain('my-repo');
    expect(sentCommand.input.Message.Subject.Data).toContain('85/100');
    expect(sentCommand.input.Message.Body.Html.Data).toContain('Excellent');
  });

  it('should send a magic link email', async () => {
    const result = await sendMagicLinkEmail({
      to: 'user@example.com',
      magicLinkUrl:
        'https://app.getaiready.dev/api/auth/callback/email?token=123',
    });

    expect(result.success).toBe(true);
    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input.Message.Subject.Data).toContain('Sign in');
    expect(sentCommand.input.Message.Body.Html.Data).toContain('token=123');
  });

  it('should send a remediation notification email (success)', async () => {
    const result = await sendRemediationNotificationEmail({
      to: 'user@example.com',
      repoName: 'my-repo',
      remediationTitle: 'Fix dependencies',
      status: 'reviewing',
      prUrl: 'https://github.com/my-org/my-repo/pull/1',
      prNumber: 1,
      dashboardUrl: 'https://app.getaiready.dev/repo/my-repo',
    });

    expect(result.success).toBe(true);
    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input.Message.Subject.Data).toContain(
      'Ready for Review'
    );
    expect(sentCommand.input.Message.Body.Html.Data).toContain('PR #1');
  });

  it('should send a remediation notification email (failure)', async () => {
    const result = await sendRemediationNotificationEmail({
      to: 'user@example.com',
      repoName: 'my-repo',
      remediationTitle: 'Fix dependencies',
      status: 'failed',
      error: 'Conflict detected',
      dashboardUrl: 'https://app.getaiready.dev/repo/my-repo',
    });

    expect(result.success).toBe(true);
    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input.Message.Subject.Data).toContain('Failed');
    expect(sentCommand.input.Message.Body.Html.Data).toContain(
      'Conflict detected'
    );
  });

  it('should handle SES errors gracefully', async () => {
    mockSend.mockRejectedValueOnce(new Error('SES Limit Exceeded'));

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      htmlBody: 'Fail',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('SES Limit Exceeded');
  });
});
