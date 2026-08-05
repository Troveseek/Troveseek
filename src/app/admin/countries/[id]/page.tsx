import { redirect } from 'next/navigation';

export default async function CountryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/countries/${id}/edit`);
}
