import ChallengeArena from '../../../src/components/ChallengeArena';

export default async function ChallengePage({ params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params;
  return <ChallengeArena challengeId={challengeId} />;
}
