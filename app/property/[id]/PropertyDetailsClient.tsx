'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Review } from '@/domain/entities/Review';

interface Property {
  id: number;
  name: string;
  address?: string;
  city: string;
  country?: string;
  propertyType?: string;
  description?: string;
  maxGuests: number;
  bedrooms: number;
  beds?: number;
  bathrooms: number;
  images?: Array<{ imageId: number; url: string }>;
  photos?: string[];
  amenities?: string[];
  amenityDetails?: Array<{ amenityId: number; amenityName: string }>;
  isActive?: boolean;
  starRating?: number;
  averageReviewRating?: number;
  checkInTimeStart?: number;
  checkInTimeEnd?: number;
  checkOutTime?: number;
  houseRules?: string;
  maxPetsAllowed?: number | null;
  maxChildrenAllowed?: number | null;
  maxInfantsAllowed?: number | null;
  cancellationPolicy?: string;
  minNights?: number;
  maxNights?: number;
  refundableDamageDeposit?: number;
  cleaningFee?: number;
  specialInstruction?: string;
  keyPickup?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedReviews?: Review[];
  reviewCount?: number;
  calculatedAverageRating?: number;
}

interface Props {
  property: Property;
}

export default function PropertyDetailsClient({ property }: Props) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [guests, setGuests] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = property.name || 'Property';
  const maxGuests = property.maxGuests || 1;
  const bedrooms = property.bedrooms || 0;
  const beds = property.beds || 0;
  const bathrooms = property.bathrooms || 0;
  const images = property.images?.map(img => img.url) || property.photos || [];
  const description = property.description || '';
  const amenityDetails = property.amenityDetails || [];

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

  const formatTime = (hour: number | undefined) => {
    if (hour === undefined) return 'Not specified';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const formatCancellationPolicy = (policy: string | undefined) => {
    if (!policy) return 'Strict';
    return policy.charAt(0).toUpperCase() + policy.slice(1);
  };

  // Extract policy data
  const checkInTime = formatTime(property.checkInTimeStart);
  const checkInEndTime = property.checkInTimeEnd ? ` - ${formatTime(property.checkInTimeEnd)}` : '';
  const checkOutTimeDisplay = formatTime(property.checkOutTime);
  const hasHouseRules = property.houseRules && property.houseRules.trim() !== '';
  const hasPetPolicy = property.maxPetsAllowed !== null && property.maxPetsAllowed !== undefined;
  const allowsPets = property.maxPetsAllowed && property.maxPetsAllowed > 0;
  const hasDeposit = property.refundableDamageDeposit && property.refundableDamageDeposit > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF6' }}>
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-[#284E4C] shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center h-24 pl-12 md:pl-16">
          <Link href="/">
            <img
              alt="The Flex"
              width="180"
              height="52"
              decoding="async"
              className="object-contain"
              src={
                isScrolled
                  ? "https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/White_V3%20Symbol%20%26%20Wordmark.png"
                  : "https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/Green_V3%20Symbol%20%26%20Wordmark%20(1).png"
              }
            />
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        <div className="max-w-screen-2xl mx-auto px-6">

          {/* Photo Gallery */}
          <div className="relative mb-12 mt-8">
            {/* Mobile Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                >
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${displayName} - ${index + 1}`}
                      className="w-full h-96 object-cover flex-shrink-0"
                      onClick={() => images.length > 4 && setShowAllPhotos(true)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Navigation Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    disabled={selectedImageIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    ←
                  </button>
                  
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                    disabled={selectedImageIndex === images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    →
                  </button>
                  
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              
              {images.length > 4 && (
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="absolute bottom-4 left-4 bg-black/80 hover:bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
                >
                  View all photos
                </button>
              )}
            </div>
            
            {/* Desktop Grid */}
            <div className="hidden md:block">
              {/* Single Image */}
              {images.length === 1 && (
                <div 
                  className="relative group h-[500px] rounded-xl overflow-hidden"
                >
                  <img
                    src={images[0]}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              )}

              {/* Two Images - Side by Side */}
              {images.length === 2 && (
                <div className="grid grid-cols-2 gap-2 h-[500px]">
                  {images.map((image, idx) => (
                    <div 
                      key={idx}
                      className="relative group"
                    >
                      <img
                        src={image}
                        alt={`${displayName} - ${idx + 1}`}
                        className={`w-full h-full object-cover ${idx === 0 ? 'rounded-l-xl' : 'rounded-r-xl'}`}
                      />
                      <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors ${idx === 0 ? 'rounded-l-xl' : 'rounded-r-xl'}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Three Images - 1 Large + 2 Stacked */}
              {images.length === 3 && (
                <div className="grid grid-cols-2 gap-2 h-[500px]">
                  <div 
                    className="relative group"
                  >
                    <img
                      src={images[0]}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-l-xl"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-l-xl" />
                  </div>
                  
                  <div className="grid grid-rows-2 gap-2">
                    {images.slice(1, 3).map((image, idx) => (
                      <div 
                        key={idx}
                        className="relative group"
                      >
                        <img
                          src={image}
                          alt={`${displayName} - ${idx + 2}`}
                          className={`w-full h-full object-cover ${idx === 0 ? 'rounded-tr-xl' : 'rounded-br-xl'}`}
                        />
                        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors ${idx === 0 ? 'rounded-tr-xl' : 'rounded-br-xl'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Four or More Images - 1 Large + 4 Small Grid */}
              {images.length >= 4 && (
                <div className="grid grid-cols-4 gap-2 h-[500px]">
                  <div 
                    className="col-span-2 row-span-2 relative group cursor-pointer"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <img
                      src={images[0]}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-l-xl"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-l-xl" />
                  </div>
                  
                  {images.slice(1, 5).map((image, idx) => (
                    <div 
                      key={idx} 
                      className="relative group cursor-pointer"
                      onClick={() => setShowAllPhotos(true)}
                    >
                      <img
                        src={image}
                        alt={`${displayName} - ${idx + 2}`}
                        className={`w-full h-full object-cover ${idx === 1 ? 'rounded-tr-xl' : ''}`}
                      />
                      <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors ${idx === 1 ? 'rounded-tr-xl' : ''}`} />
                      
                      {idx === 3 && images.length > 5 && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center cursor-pointer">
                          <span className="text-white text-2xl font-semibold">+{images.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
                  >
                    View all {images.length} photos
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Listing Name */}
          <div className="mb-4">
            <h1 className="text-5xl font-bold text-[#333333]">{displayName}</h1>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-[#5C5C5A]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold text-lg">{maxGuests} Guests</span>
            </div>
            <div className="flex items-center gap-2 text-[#5C5C5A]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold text-lg">{bedrooms || 0} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2 text-[#5C5C5A]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="font-semibold text-lg">{beds} Beds</span>
            </div>
            <div className="flex items-center gap-2 text-[#5C5C5A]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold text-lg">{bathrooms} Bathrooms</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12 mb-24 md:mb-12">
            {/* Left Column - Property Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* About This Property */}
              <div className="rounded-xl text-card-foreground p-8 bg-white border-0 shadow-lg">
                <h2 className="text-4xl font-semibold mb-8 text-[#333333]">About this property</h2>
                <div className="space-y-6">
                  <p className="text-[#5C5C5A] text-lg whitespace-pre-line leading-relaxed">
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
              {/* <div className="rounded-lg text-card-foreground p-6 mb-12 bg-white border-0 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-semibold text-[#333333]">Amenities</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {amenityDetails.filter(a => a?.amenityName).slice(0, 9).map((amenity) => (
                    <div key={amenity.amenityId} className="flex items-center gap-3 text-[#5C5C5A]">
                      <span className="text-2xl">{getAmenityIcon(amenity.amenityName)}</span>
                      <span className="text-base font-medium">{amenity.amenityName}</span>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Stay Policy */}
              <div className="rounded-xl text-card-foreground p-8 bg-white border-0 shadow-lg">
                <h2 className="text-4xl font-semibold mb-8 text-[#333333]">Stay Policies</h2>
                <div className="space-y-6">
                  <div className="bg-[#F1F3EE] rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-full bg-white">
                        <svg className="h-6 w-6 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-2xl text-[#333333]">Check-in & Check-out</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="text-base text-[#5C5C5A]">Check-in Time</p>
                        <p className="font-semibold text-xl text-[#333333]">{checkInTime}{checkInEndTime}</p>
                      </div>
                      <div className="bg-white rounded-lg p-5 shadow-sm">
                        <p className="text-base text-[#5C5C5A] mb-1">Check-out Time</p>
                        <p className="font-semibold text-xl text-[#333333]">{checkOutTimeDisplay}</p>
                      </div>
                    </div>
                    {(property.minNights || property.maxNights) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        {property.minNights && (
                          <div className="bg-white rounded-lg p-5 shadow-sm">
                            <p className="text-base text-[#5C5C5A]">Minimum Stay</p>
                            <p className="font-semibold text-xl text-[#333333]">{property.minNights} {property.minNights === 1 ? 'night' : 'nights'}</p>
                          </div>
                        )}
                        {property.maxNights && (
                          <div className="bg-white rounded-lg p-5 shadow-sm">
                            <p className="text-base text-[#5C5C5A]">Maximum Stay</p>
                            <p className="font-semibold text-xl text-[#333333]">{property.maxNights} {property.maxNights === 1 ? 'night' : 'nights'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F1F3EE] rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-full bg-white">
                        <svg className="h-6 w-6 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-2xl text-[#333333]">House Rules</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex items-center gap-3 bg-white rounded-lg p-5 shadow-sm">
                        <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.9 4.9 14.2 14.2" />
                        </svg>
                        <p className="font-medium text-base text-[#333333]">No smoking</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-lg p-5 shadow-sm">
                        <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="11" cy="4" r="2" />
                          <circle cx="18" cy="8" r="2" />
                          <circle cx="20" cy="16" r="2" />
                          <path d="M9 10a5 5 0 015 5v3.5a3.5 3.5 0 01-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 015.5 10z" />
                        </svg>
                        <p className="font-medium text-base text-[#333333]">{hasPetPolicy ? (allowsPets ? `Pets allowed (max ${property.maxPetsAllowed})` : 'No pets') : 'No pets'}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-lg p-5 shadow-sm">
                        <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M5.8 11.3 2 22l10.7-3.79" />
                          <path d="M4 3h.01" />
                          <path d="M22 8h.01" />
                          <path d="M15 2h.01" />
                          <path d="M22 20h.01" />
                          <path d="m22 2-2.24.75a2.9 2.9 0 00-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
                          <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" />
                          <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" />
                          <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2z" />
                        </svg>
                        <p className="font-medium text-base text-[#333333]">No parties or events</p>
                      </div>
                      {hasDeposit && (
                        <div className="flex items-center gap-3 bg-white rounded-lg p-5 shadow-sm">
                          <svg className="h-5 w-5 text-[#5C5C5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 01-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 011-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 011.52 0C14.51 3.81 17 5 19 5a1 1 0 011 1z" />
                          </svg>
                          <p className="font-medium text-base text-[#333333]">Security deposit: ${property.refundableDamageDeposit}</p>
                        </div>
                      )}
                    </div>
                    {hasHouseRules && (
                      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-lg text-[#333333] mb-2">Additional Rules</h4>
                        <p className="text-base text-[#5C5C5A]">{property.houseRules}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#F1F3EE] rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-full bg-white">
                        <svg className="h-6 w-6 text-[#284E4C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M21 7.5V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h3.5" />
                          <path d="M16 2v4" />
                          <path d="M8 2v4" />
                          <path d="M3 10h5" />
                          <path d="M17.5 17.5 16 16.3V14" />
                          <circle cx="16" cy="16" r="6" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-2xl text-[#333333]">Cancellation Policy</h3>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold mb-3 text-lg text-[#333333]">{formatCancellationPolicy(property.cancellationPolicy)} Cancellation Policy</h4>
                      <div className="space-y-2">
                        {property.cancellationPolicy === 'strict' ? (
                          <>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>Full refund for cancellations up to 48 hours after booking, if the check-in date is at least 14 days away</p>
                            </div>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>50% refund for cancellations made at least 7 days before check-in</p>
                            </div>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>No refund for cancellations made within 7 days of check-in</p>
                            </div>
                          </>
                        ) : property.cancellationPolicy === 'moderate' ? (
                          <>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>Full refund for cancellations up to 5 days before check-in</p>
                            </div>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>50% refund for cancellations made within 5 days of check-in</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>Full refund for cancellations up to 24 hours before check-in</p>
                            </div>
                            <div className="flex items-start gap-2 text-base text-[#5C5C5A]">
                              <div className="w-2 h-2 bg-[#284E4C] rounded-full mt-1.5 flex-shrink-0" />
                              <p>No refund for cancellations made within 24 hours of check-in</p>
                            </div>
                          </>
                        )}
                      </div>
                      {property.cleaningFee && property.cleaningFee > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-base text-[#5C5C5A]">Cleaning fee: <span className="font-semibold text-[#333333]">${property.cleaningFee.toFixed(2)}</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Reviews */}
              {property.approvedReviews && property.approvedReviews.length > 0 && (
                <div className="rounded-xl text-card-foreground p-8 bg-white border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-semibold text-[#333333]">Guest Reviews</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-6 w-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-2xl font-bold text-[#333333]">
                          {property.calculatedAverageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-lg text-[#5C5C5A]">
                        ({property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {property.approvedReviews.map((review) => {
                      const reviewDate = review.submittedAt;
                      const formattedDate = reviewDate 
                        ? new Date(reviewDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'Date not available';
                      
                      // Calculate individual review rating
                      let reviewRating: number | null = review.rating;
                      if ((!reviewRating || reviewRating === 0) && review.reviewCategory && review.reviewCategory.length > 0) {
                        const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
                        reviewRating = sum / review.reviewCategory.length;
                      }

                      return (
                        <div key={review.id} className="bg-[#F1F3EE] rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[#284E4C] flex items-center justify-center text-white font-semibold text-lg">
                                {review.guestName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-[#333333] text-lg">{review.guestName}</p>
                                <p className="text-base text-[#5C5C5A]">{formattedDate}</p>
                              </div>
                            </div>
                            {reviewRating && reviewRating > 0 && (
                              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="font-semibold text-[#333333]">{reviewRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {review.publicReview && (
                            <p className="text-[#5C5C5A] text-lg leading-relaxed">{review.publicReview}</p>
                          )}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm px-2 py-1 bg-white rounded-md text-[#5C5C5A] font-medium">
                              {review.channel || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Location */}
              {/* <div className="rounded-xl text-card-foreground p-8 bg-white border-0 shadow-lg">
                <h2 className="text-3xl font-semibold mb-8 text-[#333333]">Location</h2>
                <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                  <div className="bg-gray-200 rounded-lg h-full flex items-center justify-center">
                    <div className="text-center text-[#5C5C5A]">
                      <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="font-medium">{property.city}</p>
                    </div>
                  </div>
                </div>
              </div>  */}
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
                <div className="bg-gradient-to-br from-[#284E4C] to-[#1f3a39] p-8">
                  <h3 className="text-2xl font-bold text-white mb-3">Book your stay</h3>
                  <p className="text-white/90 text-base">Contact us for availability</p>
                </div>
                
                <div className="p-8">
                  <div className="mb-6">
                    <label className="text-lg font-semibold text-[#333333] mb-3 block">Number of Guests</label>
                    <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl p-4 hover:border-[#284E4C] transition-colors">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F1F3EE] text-[#284E4C] font-bold text-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={guests <= 1}
                      >
                        −
                      </button>
                      <span className="font-bold text-2xl text-[#333333]">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                      <button
                        onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F1F3EE] text-[#284E4C] font-bold text-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={guests >= maxGuests}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-[#5C5C5A] mt-2">Maximum: {maxGuests} guests</p>
                  </div>
                  
                  <div className="space-y-4">
                    <a
                      href={`mailto:hello@theflex.global?subject=Booking Inquiry - ${displayName}&body=Hi, I'm interested in booking ${displayName} for ${guests} guest${guests !== 1 ? 's' : ''}. Please send me more information.`}
                      className="w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-200 flex items-center justify-center bg-[#284E4C] text-white hover:bg-[#1f3a39] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Request to Book
                    </a>
                    <p className="text-base text-[#5C5C5A] text-center">
                      You won't be charged yet
                    </p>
                  </div>
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
