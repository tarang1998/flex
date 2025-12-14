'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Property {
  id: number;
  name: string;
  city: string;
  country: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  photos: string[];
  starRating: number;
  reviewCount: number;
  averageRating: number;
}

interface Review {
  id: number;
  guestName: string;
  rating: number;
  publicReview: string;
  submittedAt: string;
  channel: string;
  reviewCategory?: Array<{
    category: string;
    rating: number;
  }>;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch property data
      const propertiesResponse = await fetch('/api/properties');
      const propertiesData = await propertiesResponse.json();
      
      if (propertiesData.success) {
        const foundProperty = propertiesData.data.find((p: Property) => p.id === parseInt(propertyId));
        setProperty(foundProperty || null);
      }

      // Fetch approved reviews for this property
      const reviewsResponse = await fetch(`/api/reviews/approved?listingId=${propertyId}`);
      const reviewsData = await reviewsResponse.json();
      
      if (reviewsData.success) {
        setReviews(reviewsData.data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <Link href="/properties" className="text-blue-600 hover:text-blue-700">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80';
  const images = property.photos.length > 0 ? property.photos : [defaultImage];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/properties" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Properties
            </Link>
            <Link href="/" className="text-xl font-bold text-gray-900">
              Flex Living
            </Link>
          </div>
        </div>
      </header>

      {/* Photo Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-6">
          {/* Main Image */}
          <div className="lg:col-span-3 relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden cursor-pointer group"
               onClick={() => setShowAllPhotos(true)}>
            <img
              src={images[selectedImageIndex]}
              alt={property.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />
            <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium">View all photos</span>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="lg:col-span-1 grid grid-cols-4 lg:grid-cols-1 gap-2">
            {images.slice(0, 4).map((photo, index) => (
              <div
                key={index}
                className={`relative h-24 lg:h-[120px] rounded-lg overflow-hidden cursor-pointer ${
                  selectedImageIndex === index ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={photo}
                  alt={`${property.name} - ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = defaultImage;
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{property.name}</h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{property.city}, {property.country}</span>
                </div>
                <span>•</span>
                <span className="capitalize">{property.propertyType.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{property.maxGuests} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <span className="font-medium">{property.bathrooms} Bathrooms</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(property.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xl font-bold text-gray-900">{property.averageRating.toFixed(1)}</span>
                <span className="text-gray-600">({property.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Reviews</h2>
                
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{review.guestName || 'Anonymous Guest'}</h3>
                          <p className="text-sm text-gray-500">
                            {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            }) : 'Date N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-semibold text-gray-900">{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      {review.publicReview && (
                        <p className="text-gray-700 leading-relaxed">{review.publicReview}</p>
                      )}
                      
                      {review.reviewCategory && review.reviewCategory.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {review.reviewCategory.map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600 capitalize">{cat.category}:</span>
                              <span className="font-semibold text-gray-900">{cat.rating.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {property.reviewCount > 5 && (
                  <Link
                    href={`/dashboard/listing/${property.id}`}
                    className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {property.reviewCount} reviews
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">Contact</span>
                </div>
                <p className="text-sm text-gray-600">For booking inquiries and availability</p>
              </div>

              <div className="space-y-4 mb-6">
                <a
                  href="mailto:info@theflex.global"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email</div>
                    <div className="text-xs text-gray-600">Send us a message</div>
                  </div>
                </a>

                <a
                  href="tel:+447723745646"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Phone</div>
                    <div className="text-xs text-gray-600">+44 77 2374 5646</div>
                  </div>
                </a>
              </div>

              <Link
                href="/dashboard"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Manager Dashboard
              </Link>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Instant booking confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Professional property management</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">All Photos</h3>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="text-white hover:text-gray-300 p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
              {images.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${property.name} - ${index + 1}`}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = defaultImage;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
