import db from '@/lib/db';
import TechSpecsClient from './TechSpecsClient';

export default async function TechSpecsPage() {
  const specs = await db.techSpec.findMany({
    include: { service: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Pass signatureToken for copy-link functionality
  const serialized = specs.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    signedAt: s.signedAt?.toISOString() || null,
    viewedAt: s.viewedAt?.toISOString() || null,
    declinedAt: s.declinedAt?.toISOString() || null,
    validUntil: s.validUntil?.toISOString() || null,
  }));

  return <TechSpecsClient initialSpecs={serialized} />;
}
