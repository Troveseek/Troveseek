import { notFound } from 'next/navigation';
import db from '@/lib/db';
import ProductClient from './ProductClient';
import { Metadata, ResolvingMetadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    return null;
  }

  return product;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.metaTitle || `${product.name} | TroveSeek`,
    description: product.metaDescription || product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductClient product={product} />;
}
