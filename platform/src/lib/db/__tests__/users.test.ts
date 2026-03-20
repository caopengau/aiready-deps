import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, getUser, getUserByEmail, updateUser } from '../users';
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
  UpdateCommand: vi.fn(),
}));

describe('User DB Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user', async () => {
    const mockUser: any = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    };

    const result = await createUser(mockUser);
    expect(result.id).toBe('user-1');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should get a user', async () => {
    mockDocSend.mockResolvedValueOnce({
      Item: { id: 'user-1', email: 'test@example.com' },
    });
    const user = await getUser('user-1');
    expect(user?.id).toBe('user-1');
  });

  it('should get user by email', async () => {
    mockDocSend.mockResolvedValueOnce({
      Items: [{ id: 'user-1', email: 'test@example.com' }],
    });
    const user = await getUserByEmail('test@example.com');
    expect(user?.id).toBe('user-1');
  });

  it('should update a user', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await updateUser('user-1', { name: 'Updated Name' });
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should update user with teamId', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await updateUser('user-1', { teamId: 'team-1', role: 'admin' });
    expect(mockDocSend).toHaveBeenCalled();
  });
});
