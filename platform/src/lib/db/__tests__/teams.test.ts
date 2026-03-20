import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTeam,
  getTeam,
  getTeamBySlug,
  listUserTeams,
  listTeamMembers,
  addTeamMember,
  removeTeamMember,
  updateTeam,
} from '../teams';
import { doc, TABLE_NAME } from '../client';

const mockDocSend = vi.fn().mockResolvedValue({}) as any;

vi.mock('../client', () => ({
  doc: {
    send: mockDocSend,
  },
  TABLE_NAME: 'test-table',
  getTableName: vi.fn().mockReturnValue('test-table'),
}));

vi.mock('../users', () => ({
  updateUser: vi.fn().mockResolvedValue({}),
  getUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  QueryCommand: vi.fn(),
  UpdateCommand: vi.fn(),
  DeleteCommand: vi.fn(),
  BatchWriteCommand: vi.fn(),
}));

describe('Team DB Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a team', async () => {
    const mockTeam: any = {
      id: 'team-1',
      name: 'Test Team',
      slug: 'test-team',
    };

    mockDocSend.mockResolvedValueOnce({});
    const result = await createTeam(mockTeam, 'user-1');
    expect(result.id).toBe('team-1');
  });

  it('should get a team', async () => {
    mockDocSend.mockResolvedValueOnce({
      Item: { id: 'team-1', name: 'Test Team' },
    });
    const team = await getTeam('team-1');
    expect(team?.id).toBe('team-1');
  });

  it('should get team by slug', async () => {
    mockDocSend.mockResolvedValueOnce({
      Items: [{ id: 'team-1', slug: 'test-team' }],
    });
    const team = await getTeamBySlug('test-team');
    expect(team?.id).toBe('team-1');
  });

  it('should list user teams', async () => {
    mockDocSend.mockResolvedValueOnce({
      Items: [{ teamId: 'team-1', userId: 'user-1' }],
    });
    mockDocSend.mockResolvedValueOnce({
      Item: { id: 'team-1', name: 'Test Team' },
    });
    const teams = await listUserTeams('user-1');
    expect(teams).toHaveLength(1);
  });

  it('should list team members', async () => {
    mockDocSend.mockResolvedValueOnce({
      Items: [{ teamId: 'team-1', userId: 'user-1' }],
    });
    const members = await listTeamMembers('team-1');
    expect(members).toHaveLength(1);
  });

  it('should add team member', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await addTeamMember('team-1', 'user-2', 'member');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should add team member with admin role', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await addTeamMember('team-1', 'user-2', 'admin');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should remove team member', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await removeTeamMember('team-1', 'user-2');
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should update team', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await updateTeam('team-1', { name: 'Updated Team' });
    expect(mockDocSend).toHaveBeenCalled();
  });

  it('should skip id in update', async () => {
    mockDocSend.mockResolvedValueOnce({});
    await updateTeam('team-1', { id: 'should-skip', name: 'Updated' });
    expect(mockDocSend).toHaveBeenCalled();
  });
});
