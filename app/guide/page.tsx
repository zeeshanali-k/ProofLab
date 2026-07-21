import { Suspense } from 'react';
import GuideScreen from '../../src/components/GuideScreen';

export default function GuidePage() {
	return (
		<Suspense fallback={<main className="guide-loading">Opening the platform guide…</main>}>
			<GuideScreen />
		</Suspense>
	);
}
