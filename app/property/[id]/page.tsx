import PropertyDetails from './PropertyDetails';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fetch property data for metadata
async function getProperty(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/properties?id=${id}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching property:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  
  if (!property) {
    return {
      title: 'Property Not Found | The Flex',
    };
  }

  const title = `${property.listingName || property.name} | The Flex`;
  const description = property.description?.substring(0, 160) || `${property.listingName} in ${property.city}`;
  const imageUrl = property.images?.[0]?.url || property.photos?.[0] || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://theflex.global/property/${id}`,
      siteName: 'The Flex',
      images: imageUrl ? [{
        url: imageUrl,
        width: 800,
        height: 600,
        alt: property.listingName || property.name,
      }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);

  return <PropertyDetails property={property} />;
}
