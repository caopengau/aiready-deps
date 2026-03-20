import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createApiKey,
  listUserApiKeys,
  deleteApiKey,
  createMagicLinkToken,
  getMagicLinkToken,
  markMagicLinkUsed,
} from '../auth-utils';
import { doc, TABLE_NAME } from '../client';

const mockDocSend = vi.fn().mockResolvedValue({}) as any;

vi.mock('../client', () => ({
  doc: {
    send: mockDocSend,
  },
  TABLE_NAME: 'test-table',
  getTableName: vi.fn().mockReturnValue('test-table'),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  QueryCommand: vi.fn(),
  DeleteCommand: vi.fn(),
  UpdateCommand: vi.fn(),
}));

describe('Auth Utils DB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Keys', () => {
    it('should create an API key', async () => {
      const result = await createApiKey('user-1', 'My Key');
      expect(result.key).toMatch(/^ar_/);
      expect(result.apiKeyId).toBeDefined();
    });

    it('should list user API keys', async () => {
      mockDocSend.mockResolvedValueOnce({
        Items: [{ id: 'key-1', name: 'Key 1' }],
      });
      const keys = await listUserApiKeys('user-1');
      expect(keys).toHaveLength(1);
    });

    it('should delete API key', async () => {
      await deleteApiKey('user-1', 'key-1');
      expect(mockDocSend).toHaveBeenCalled();
    });
  });

  describe('Magic Links', () => {
    it('should create magic link token', async () => {
      const tokenData: any = {
        token: 'token123',
        userId: 'user-1',
        expiresAt: new Date().toISOString(),
      };
      const result = await createMagicLinkToken(tokenData);
      expect(result).toBe('token123');
    });

    it('should get magic link token', async () => {
      mockDocSend.mockResolvedValueOnce({
        Item: { token: 'token123', userId: 'user-1' },
      });
      const token = await getMagicLinkToken('token123');
      expect(token?.token).toBe('token123');
    });

    it('should return null for invalid token', async () => {
      mockDocSend.mockResolvedValueOnce({
        Item: null,
      });
      const token = await getMagicLinkToken('invalid');
      expect(token).toBeNull();
    });

    it('should mark magic link as used', async () => {
      await markMagicLinkUsed('token123');
      expect(mockDocSend).toHaveBeenCalled();
    });
  });
});
