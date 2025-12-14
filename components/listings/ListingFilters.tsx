interface ListingFiltersProps {
  filters: {
    search: string;
    city: string;
    propertyType: string;
    minBedrooms: number;
    maxBedrooms: number;
    sortBy: 'starRating' | 'avgReviewRating' | 'personCapacity' | 'needsAttention' | 'reviewCount';
    sortDirection: 'asc' | 'desc';
  };
  cities: string[];
  propertyTypes: string[];
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const sortOptions = [
  { value: 'needsAttention', label: 'Needs Attention' },
  { value: 'reviewCount', label: 'Review Count' },
  { value: 'starRating', label: 'Star Rating' },
  { value: 'avgReviewRating', label: 'Avg Review Rating' },
  { value: 'personCapacity', label: 'Guest Capacity' },
];

export default function ListingFilters({
  filters,
  cities,
  propertyTypes,
  onFilterChange,
  onClearFilters,
}: ListingFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.city ||
    filters.propertyType ||
    filters.minBedrooms > 0 ||
    filters.maxBedrooms < 10;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Properties
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Properties
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Search by name, city, or address..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
            <svg
              className="absolute left-3 top-3 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange({ city: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => onFilterChange({ propertyType: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bedrooms Slider and Sort */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bedrooms Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Bedrooms: {filters.minBedrooms}
          </label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="10"
              value={filters.minBedrooms}
              onChange={(e) => onFilterChange({ minBedrooms: parseInt(e.target.value) })}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
            <span>0</span>
            <span>5</span>
            <span>10+</span>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onFilterChange({ sortDirection: filters.sortDirection === 'desc' ? 'asc' : 'desc' })}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 font-medium"
              title={filters.sortDirection === 'desc' ? 'High to Low' : 'Low to High'}
            >
              {filters.sortDirection === 'desc' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {filters.sortDirection === 'desc' ? 'High to Low' : 'Low to High'}
          </p>
        </div>
      </div>
    </div>
  );
}
