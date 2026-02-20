import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createRepository, listUserRepositories, getRepository, deleteRepository } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET /api/repos - List user's repositories
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repos = await listUserRepositories(session.user.id);
    return NextResponse.json({ repos });
  } catch (error) {
    console.error('Error listing repositories:', error);
    return NextResponse.json({ error: 'Failed to list repositories' }, { status: 500 });
  }
}

// POST /api/repos - Create a new repository
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, description, defaultBranch = 'main' } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    // Validate URL is a valid git repository URL
    const urlPattern = /^(https?:\/\/|git@)[\w.@:\/-]+$/;
    if (!urlPattern.test(url)) {
      return NextResponse.json({ error: 'Invalid repository URL' }, { status: 400 });
    }

    const repo = await createRepository({
      id: randomUUID(),
      userId: session.user.id,
      name,
      url,
      description,
      defaultBranch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ repo }, { status: 201 });
  } catch (error) {
    console.error('Error creating repository:', error);
    return NextResponse.json({ error: 'Failed to create repository' }, { status: 500 });
  }
}

// DELETE /api/repos?id=<repoId> - Delete a repository
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('id');

    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    // Verify ownership
    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteRepository(repoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting repository:', error);
    return NextResponse.json({ error: 'Failed to delete repository' }, { status: 500 });
  }
}