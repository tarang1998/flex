'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Property {
  id: number;
  listingName?: string;
  name?: string;
  city: string;
  description?: string;
  personCapacity?: number;
  guestsAllowed?: number;
  totalBedrooms?: number | null;
  totalBeds?: number;
  totalBathrooms?: number;
  images?: Array<{ imageId: number; url: string }>;
  photos?: string[];
  amenities?: Array<{ amenityId: number; amenityName: string }>;
}

interface Props {
  property: Property;
}

export default function PropertyDetailsClient({ property }: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [guests, setGuests] = useState(1);

  const displayName = property.listingName || property.name || 'Property';
  const maxGuests = property.personCapacity || property.guestsAllowed || 1;
  const bedrooms = property.totalBedrooms;
  const beds = property.totalBeds || 0;
  const bathrooms = property.totalBathrooms || 0;
  const images = property.images?.map(img => img.url) || property.photos || [];
  const description = property.description || '';
  const amenities = property.amenities || [];

  // Truncate description to 200 characters
  const truncatedDescription = description.length > 200 
    ? description.substring(0, 200) + '...' 
    : description;

  const getAmenityIcon = (amenityName: string | undefined) => {
    if (!amenityName) return '✓';
    const name = amenityName.toLowerCase();
    if (name.includes('tv')) return '📺';
    if (name.includes('internet') || name.includes('wifi') || name.includes('wireless')) return '📶';
    if (name.includes('kitchen')) return '🍳';
    if (name.includes('washing') || name.includes('washer')) return '🧺';
    if (name.includes('dryer') || name.includes('hair')) return '💨';
    if (name.includes('heating')) return '🌡️';
    if (name.includes('smoke') || name.includes('detector')) return '🛡️';
    return '✓';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFDF6' }}>
      <div style={{ paddingTop: '88px' }}></div>
      
      <main className="flex-grow">
        <div className="container mx-auto max-w-7xl px-3 md:px-4" style={{ backgroundColor: '#FFFDF6' }}>
          {/* Back Button - Mobile Only */}
          <div className="py-2 md:py-4">
            <div className="flex items-center text-sm text-[#5C5C5A] mb-4 md:hidden">
              <Link href="/properties" className="inline-flex items-center text-[#5C5C5A] hover:text-[#333333]">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="relative mb-8 md:mb-12">
            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="relative">
                <div className="relative w-full aspect-[4/3]">
                  <div className="rounded-2xl overflow-hidden h-full">
                    <img
                      src={images[selectedImageIndex] || '/placeholder.jpg'}
                      alt={`${displayName} - Image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white border-0 shadow-lg flex items-center justify-center"
                    >
                      <svg className="h-5 w-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/90 hover:bg-white border-0 shadow-lg flex items-center justify-center"
                    >
                      <svg className="h-5 w-5 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* View All Button */}
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="absolute bottom-4 left-4 h-8 px-3 text-xs bg-white/90 hover:bg-white border-0 shadow-lg backdrop-blur-sm rounded-md flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  View all
                </button>
                
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px]">
                {/* Main Image */}
                <div 
                  className="col-span-2 row-span-2 relative cursor-pointer group"
                  onClick={() => setShowAllPhotos(true)}
                >
                  <img
                    src={images[0] || '/placeholder.jpg'}
                    alt={`${displayName} - Main`}
                    className="w-full h-full object-cover rounded-l-xl"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200 rounded-l-xl"></div>
                </div>

                {/* Grid Images */}
                {images.slice(1, 5).map((photo, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <img
                      src={photo}
                      alt={`${displayName} - Image ${index + 2}`}
                      className={`w-full h-full object-cover ${
                        index === 1 ? 'rounded-tr-xl' : ''
                      }`}
                    />
                    <div className={`absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200 ${
                      index === 1 ? 'rounded-tr-xl' : ''
                    }`}></div>
                  </div>
                ))}

                {/* View All Button */}
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="absolute bottom-6 right-6 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  View all photos
                </button>
              </div>
            </div>
          </div>

          {/* Property Info Section */}
          <div className="mb-8 md:mb-12">
            {/* Mobile Layout */}
            <div className="md:hidden space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-[#333333] leading-tight mb-2">
                    {displayName}
                  </h1>
                </div>
              </div>

              {/* Mobile Property Stats Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl p-4" style={{ backgroundColor: '#FFFDF6' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl shadow-sm">
                    <svg className="h-5 w-5 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-[#333333] block">{maxGuests}</span>
                    <span className="text-sm text-[#5C5C5A]">Guests</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl shadow-sm">
                    <svg className="h-5 w-5 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-[#333333] block">{bedrooms || 'N/A'}</span>
                    <span className="text-sm text-[#5C5C5A]">Bedrooms</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl shadow-sm">
                    <svg className="h-5 w-5 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-[#333333] block">{beds}</span>
                    <span className="text-sm text-[#5C5C5A]">Beds</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl shadow-sm">
                    <svg className="h-5 w-5 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-[#333333] block">{bathrooms}</span>
                    <span className="text-sm text-[#5C5C5A]">Bathrooms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
              <h1 className="text-3xl font-bold mb-6 text-[#333333]">{displayName}</h1>
              
              <div className="flex items-center gap-8 border-b border-gray-200 pb-8">
                <button className="flex items-center gap-2 p-2 rounded-full">
                  <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="text-sm">
                    <span className="font-semibold text-[#333333]">{maxGuests}</span>
                    <span className="text-[#5C5C5A] ml-1">Guests</span>
                  </div>
                </button>

                <button className="flex items-center gap-2 p-2 rounded-full">
                  <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="text-sm">
                    <span className="font-semibold text-[#333333]">{bedrooms || 'N/A'}</span>
                    <span className="text-[#5C5C5A] ml-1">Bedrooms</span>
                  </div>
                </button>

                <button className="flex items-center gap-2 p-2 rounded-full">
                  <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <div className="text-sm">
                    <span className="font-semibold text-[#333333]">{beds}</span>
                    <span className="text-[#5C5C5A] ml-1">Beds</span>
                  </div>
                </button>

                <button className="flex items-center gap-2 p-2 rounded-full">
                  <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="text-sm">
                    <span className="font-semibold text-[#333333]">{bathrooms}</span>
                    <span className="text-[#5C5C5A] ml-1">Bathrooms</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8 mb-20 md:mb-8">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2">
              {/* About This Property */}
              <div className="rounded-lg text-card-foreground mb-8 p-6 bg-white border-0 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-[#333333]">About this property</h2>
                <div className="space-y-4">
                  <p className="text-[#5C5C5A] whitespace-pre-line leading-relaxed">
                    {showFullDescription ? description : truncatedDescription}
                    {description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-[#284E4C] font-medium ml-2 hover:underline"
                      >
                        {showFullDescription ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div className="rounded-lg text-card-foreground p-6 mb-12 bg-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-[#333333]">Amenities</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.filter(a => a?.amenityName).slice(0, 9).map((amenity) => (
                    <div key={amenity.amenityId} className="flex items-center gap-2 text-[#5C5C5A]">
                      <span className="text-lg">{getAmenityIcon(amenity.amenityName)}</span>
                      <span className="text-sm">{amenity.amenityName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="text-card-foreground sticky top-24 overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl">
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#284E4C]"></div>
                  <div className="relative p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Contact Flex to Book</h3>
                    <p className="text-white/90 text-sm">Get personalized pricing and availability</p>
                  </div>
                </div>
                
                <div className="p-6 pt-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#333333]">Number of Guests</label>
                    <div className="flex items-center justify-between border border-gray-300 rounded-lg p-3">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#284E4C] font-bold"
                      >
                        -
                      </button>
                      <span className="font-semibold text-[#333333]">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                      <button
                        onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#284E4C] font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-6">
                    <a
                      href={`mailto:hello@theflex.global?subject=Booking Inquiry - ${displayName}&body=Hi, I'm interested in booking ${displayName} for ${guests} guest${guests !== 1 ? 's' : ''}. Please send me more information about availability and pricing.`}
                      className="w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 bg-[#284E4C] text-white hover:bg-[#284E4C]/90"
                    >
                      Send Inquiry
                    </a>
                    
                    <a
                      href="https://wa.me/14155551234"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-[#284E4C] text-[#284E4C] hover:bg-[#284E4C] hover:text-white"
                    >
                      Message on WhatsApp
                    </a>
                  </div>
                  
                  <p className="text-sm text-[#5C5C5A] text-center mt-4">
                    Our team will respond within 24 hours with pricing details and
                    availability for your dates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Modal */}
          {showAllPhotos && (
            <div 
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setShowAllPhotos(false)}
            >
              <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white text-xl font-semibold">All Photos</h3>
                  <button
                    onClick={() => setShowAllPhotos(false)}
                    className="text-white hover:text-gray-300 p-2"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto">
                  {images.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${displayName} - ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
