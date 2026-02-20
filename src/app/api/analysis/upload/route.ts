import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createAnalysis, getRepository, listRepositoryAnalyses } from '@/lib/db';
import { storeAnalysis, calculateAiScore, extractSummary, extractBreakdown, AnalysisData } from '@/lib/storage';
import { randomUUID } from 'crypto';

// POST /api/analysis/upload - Upload analysis results
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoId, data } = body as { repoId: string; data: AnalysisData };

    if (!repoId || !data) {
      return NextResponse.json({ error: 'Repository ID and analysis data are required' }, { status: 400 });
    }

    // Verify repository exists and belongs to user
    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate timestamp for this analysis
    const timestamp = data.metadata?.timestamp || new Date().toISOString();
    const analysisId = randomUUID();

    // Store raw data in S3
    const rawKey = await storeAnalysis({
      userId: session.user.id,
      repoId,
      timestamp,
      data,
    });

    // Calculate AI score
    const aiScore = data.summary?.aiReadinessScore || calculateAiScore(data);

    // Create analysis record in DynamoDB
    const analysis = await createAnalysis({
      id: analysisId,
      repoId,
      userId: session.user.id,
      timestamp,
      aiScore,
      breakdown: extractBreakdown(data),
      rawKey,
      summary: extractSummary(data),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      analysis,
      message: 'Analysis uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading analysis:', error);
    return NextResponse.json({ 
      error: 'Failed to upload analysis',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// GET /api/analysis/upload?repoId=<repoId> - Get analyses for a repository
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get('repoId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    // Verify repository exists and belongs to user
    const repo = await getRepository(repoId);
    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repo.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const analyses = await listRepositoryAnalyses(repoId, limit);
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}