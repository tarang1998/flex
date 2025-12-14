import { container } from '@/di';
import { notFound } from 'next/navigation';
import ListingDetailClient from './ListingDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ListingReportPage({ params }: Props) {
  const { id } = await params;
  const listingId = parseInt(id);
  
  if (isNaN(listingId)) {
    notFound();
  }
  
  const getListingDetailsUseCase = container().getListingDetailsUseCase();
  const listingData = await getListingDetailsUseCase.execute(listingId);
  
  if (!listingData) {
    notFound();
  }

  console.log(listingData)
  
  return <ListingDetailClient initialData={listingData} listingId={listingId} />;
}
