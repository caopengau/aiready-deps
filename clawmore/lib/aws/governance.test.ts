import { vi, describe, it, expect, beforeEach } from 'vitest';

let mockSend: (...args: any[]) => Promise<any> = async () => ({});

vi.mock('@aws-sdk/client-organizations', () => {
  class OrganizationsClient {
    send: (...args: any[]) => Promise<any>;
    constructor() {
      this.send = mockSend;
    }
  }

  return {
    OrganizationsClient,
    CreatePolicyCommand: class CreatePolicyCommand {
      input: any;
      constructor(input: any) {
        this.input = input;
      }
    },
    AttachPolicyCommand: class AttachPolicyCommand {
      input: any;
      constructor(input: any) {
        this.input = input;
      }
    },
    ListPoliciesCommand: class ListPoliciesCommand {
      input: any;
      constructor(input: any) {
        this.input = input;
      }
    },
  };
});

describe('governance utilities', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSend = vi.fn(async (command: any) => {
      // default empty
      return {};
    });
  });

  it('createServerlessSCP returns existing policy id when present', async () => {
    mockSend = vi.fn(async (command: any) => {
      if (command.constructor.name === 'ListPoliciesCommand') {
        return {
          Policies: [{ Id: 'p-1', Name: 'ClawMore-Managed-Serverless-Only' }],
        };
      }
      return {};
    });

    const { createServerlessSCP } = await import('./governance');
    const id = await createServerlessSCP();
    expect(id).toBe('p-1');
  });

  it('createServerlessSCP creates policy and returns new id when absent', async () => {
    let calledCreate = false;
    mockSend = vi.fn(async (command: any) => {
      if (command.constructor.name === 'ListPoliciesCommand') {
        return { Policies: [] };
      }

      if (command.constructor.name === 'CreatePolicyCommand') {
        calledCreate = true;
        return { Policy: { PolicySummary: { Id: 'p-new' } } };
      }

      return {};
    });

    const { createServerlessSCP } = await import('./governance');
    const id = await createServerlessSCP();
    expect(calledCreate).toBeTruthy();
    expect(id).toBe('p-new');
  });

  it('attachSCPToAccount sends AttachPolicyCommand', async () => {
    const sent: any[] = [];
    mockSend = vi.fn(async (command: any) => {
      sent.push(command);
      return {};
    });

    const { attachSCPToAccount } = await import('./governance');
    await attachSCPToAccount('p-abc', '123456');
    expect(sent.length).toBeGreaterThan(0);
    const attach = sent.find(
      (c) => c.constructor.name === 'AttachPolicyCommand'
    );
    expect(attach).toBeDefined();
  });
});
