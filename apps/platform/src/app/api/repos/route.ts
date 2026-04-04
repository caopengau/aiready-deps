import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  createRepository,
  listUserRepositories,
  listTeamRepositories,
  getRepository,
  deleteRepository,
  getLatestAnalysis,
} from '@/lib/db';
import { planLimits } from '@/lib/plans';
import { randomUUID } from 'crypto';

import { withAuthHandler } from '@/lib/api/handler';
import { getGitHubRepoInfo, MAX_REPO_SIZE_KB } from '@/lib/github';

// GET /api/repos - List repositories
export async function GET(request: NextRequest) {
  return withAuthHandler(async (req, { userId, teamId }) => {
    const repos = teamId
      ? await listTeamRepositories(teamId)
      : await listUserRepositories(userId);

    const reposWithAnalysis = await Promise.all(
      repos.map(async (repo) => {
        const latestAnalysis = await getLatestAnalysis(repo.id);
        return { ...repo, latestAnalysis };
      })
    );

    const maxRepos = planLimits.free.maxRepos;

    return {
      repos: reposWithAnalysis,
      limits: {
        maxRepos,
        currentCount: repos.length,
        remaining: maxRepos - repos.length,
      },
    };
  }, request);
}

// POST /api/repos - Create a new repository
export async function POST(request: NextRequest) {
  return withAuthHandler(async (req, { userId, session }) => {
    const body = await req.json();
    const { name, url, description, teamId } = body;

    if (!name || !url)
      return { status: 400, error: 'Name and URL are required' };

    const urlPattern = /^(https?:\/\/|git@)[\w.@:/-]+$/;
    if (!urlPattern.test(url))
      return { status: 400, error: 'Invalid repository URL' };

    // Fetch repository info from GitHub to check size and existence
    let githubInfo;
    try {
      githubInfo = await getGitHubRepoInfo(
        url,
        (session.user as any).accessToken
      );
    } catch (error) {
      console.error('[RepoAPI] Failed to fetch GitHub repo info:', error);
      return {
        status: 400,
        error:
          'Failed to access repository on GitHub. Please check URL and permissions.',
      };
    }

    if (githubInfo.size > MAX_REPO_SIZE_KB) {
      const sizeMB = Math.round(githubInfo.size / 1024);
      return {
        status: 400,
        error: `Repository is too large (${sizeMB}MB). Maximum allowed is ${MAX_REPO_SIZE_KB / 1024}MB.`,
      };
    }

    const defaultBranch = githubInfo.default_branch || 'main';

    let existingRepos;
    if (teamId) existingRepos = await listTeamRepositories(teamId);
    else existingRepos = await listUserRepositories(userId);

    const maxRepos = planLimits.free.maxRepos;
    if (existingRepos.length >= maxRepos) {
      return {
        status: 403,
        error: `Limit reached. You have ${existingRepos.length} repositories.`,
        code: 'REPO_LIMIT_REACHED',
        currentCount: existingRepos.length,
        maxRepos,
        upgradeUrl: '/pricing',
      };
    }

    const repo = await createRepository({
      id: randomUUID(),
      userId: userId,
      teamId,
      name,
      url,
      description,
      defaultBranch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    revalidatePath('/dashboard');

    return {
      status: 201,
      repo,
      reposRemaining: maxRepos - existingRepos.length - 1,
    };
  }, request);
}

// DELETE /api/repos?id=<repoId> - Delete a repository
export async function DELETE(request: NextRequest) {
  return withAuthHandler(async (req, { userId }) => {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get('id');
    if (!repoId) return { status: 400, error: 'Repository ID is required' };

    const repo = await getRepository(repoId);
    if (!repo) return { status: 404, error: 'Repository not found' };
    if (repo.userId !== userId) return { status: 403, error: 'Forbidden' };

    await deleteRepository(repoId);
    revalidatePath('/dashboard');
    return { success: true };
  }, request);
}
