import { container } from '@/di';
import { notFound } from 'next/navigation';
import PropertyDetailsClient from './PropertyDetailsClient';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fetch property data with reviews for metadata and page
async function getProperty(id: string) {
  try {
    const getPropertyDetailsWithReviewsUseCase = container().getPropertyDetailsWithReviewsUseCase();
    const propertyWithReviews = await getPropertyDetailsWithReviewsUseCase.execute(parseInt(id));
    return propertyWithReviews;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailsClient property={property} />;
}
