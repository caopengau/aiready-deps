import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { validateApiKey } from '@/lib/db';

/**
 * Basic API handler that wraps errors and standardizes responses.
 */
export async function withApiHandler(
  handler: (request: NextRequest, params?: any) => Promise<unknown>,
  request: NextRequest,
  params?: any
) {
  try {
    const result = await handler(request, params);
    if (result instanceof NextResponse) return result;
    if (result && typeof result === 'object' && 'status' in (result as any)) {
      const r: any = result as any;
      const status = typeof r.status === 'number' ? r.status : 200;
      const body = { ...r };
      delete body.status;
      return NextResponse.json(body, { status });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('API handler error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export interface AuthContext {
  userId: string;
  teamId?: string | null;
  session: any;
}

/**
 * Authenticated API handler that resolves userId from API Key or Session.
 * Reduces 20+ lines of boilerplate per API route.
 */
export async function withAuthHandler(
  handler: (
    request: NextRequest,
    context: AuthContext,
    params?: any
  ) => Promise<unknown>,
  request: NextRequest,
  params?: any
) {
  return withApiHandler(
    async (req, p) => {
      let userId: string | undefined;
      let authMethod: 'key' | 'session' | undefined;

      // 1. Check for API key (Authorization: Bearer <key>)
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const apiKey = authHeader.substring(7);
        const validation = await validateApiKey(apiKey);
        if (validation) {
          userId = validation.userId;
          authMethod = 'key';
        }
      }

      // 2. Fallback to session
      const session = await auth();
      if (!userId && session?.user?.id) {
        userId = session.user.id;
        authMethod = 'session';
      }

      if (!userId) {
        return { status: 401, error: 'Unauthorized' };
      }

      const { searchParams } = new URL(req.url);
      const teamId = searchParams.get('teamId');

      const context: AuthContext = {
        userId,
        teamId,
        session,
      };

      return await handler(req, context, p);
    },
    request,
    params
  );
}
