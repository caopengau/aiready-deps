import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { listUserRepositories, getLatestAnalysis } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's repositories
  const repos = await listUserRepositories(session.user.id);

  // Fetch latest analysis for each repo
  const reposWithAnalysis = await Promise.all(
    repos.map(async (repo) => {
      const latestAnalysis = await getLatestAnalysis(repo.id);
      return { ...repo, latestAnalysis };
    })
  );

  // Calculate overall AI score (average of all repos)
  const reposWithScores = reposWithAnalysis.filter(r => r.aiScore !== undefined);
  const overallScore = reposWithScores.length > 0
    ? Math.round(reposWithScores.reduce((sum, r) => sum + (r.aiScore || 0), 0) / reposWithScores.length)
    : null;

  return (
    <DashboardClient 
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      repos={reposWithAnalysis}
      overallScore={overallScore}
    />
  );
}