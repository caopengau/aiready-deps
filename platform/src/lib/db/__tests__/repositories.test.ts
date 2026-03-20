import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createRepository,
  getRepository,
  listUserRepositories,
  listTeamRepositories,
  deleteRepository,
  updateRepositoryScore,
  setRepositoryScanning,
  updateRepositoryConfig,
} from '../repositories';
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

describe('Repository DB Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a repository', async () => {
    const mockRepo: any = {
      id: 'repo-1',
      userId: 'user-1',
      name: 'test-repo',
      url: 'https://github.com/test/repo',
      defaultBranch: 'main',
    };

    const result = await createRepository(mockRepo);
    expect(result.id).toBe('repo-1');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should get a repository', async () => {
    mockDocSend.mockResolvedValueOnce({
      Item: { id: 'repo-1', name: 'test' },
    });
    const repo = await getRepository('repo-1');
    expect(repo?.id).toBe('repo-1');
  });

  it('should list user repositories', async () => {
    mockDocSend.mockResolvedValueOnce({
      Items: [{ id: 'repo-1' }, { id: 'repo-2' }],
    });
    const repos = await listUserRepositories('user-1');
    expect(repos).toHaveLength(2);
  });

  it('should list team repositories', async () => {
    mockDocSend.mockResolvedValueOnce({
      Items: [{ id: 'repo-1' }],
    });
    const repos = await listTeamRepositories('team-1');
    expect(repos).toHaveLength(1);
  });

  it('should delete a repository', async () => {
    await deleteRepository('repo-1');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should update repository score', async () => {
    await updateRepositoryScore('repo-1', 85, 'abc123');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should set repository scanning status', async () => {
    await setRepositoryScanning('repo-1', true);
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should set repository scanning with error', async () => {
    await setRepositoryScanning('repo-1', false, 'Scan failed');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should update repository config', async () => {
    await updateRepositoryConfig('repo-1', { maxFileSize: 1000 });
    expect(mockDocSend).toHaveBeenCalled();
  });
});
