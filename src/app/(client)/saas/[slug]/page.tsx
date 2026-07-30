import { notFound } from 'next/navigation';
import db from '@/lib/db';
import SaasDetailClient from './SaasDetailClient';
import { Metadata, ResolvingMetadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getSaas(slug: string) {
  return db.saaS.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: { category: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const saas = await getSaas(slug);
  if (!saas) return { title: 'Not Found' };
  return {
    title: saas.metaTitle || `${saas.name} | TroveSeek SaaS`,
    description: saas.metaDescription || saas.description,
  };
}

export default async function SaasDetailPage({ params }: Props) {
  const { slug } = await params;
  const saas = await getSaas(slug);
  if (!saas) notFound();
  return <SaasDetailClient saas={saas} />;
}
