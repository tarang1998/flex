/**
 * Review Filters Component
 * Provides filtering and sorting controls
 */

'use client';

interface ReviewFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
  onApply: () => void;
}

export default function ReviewFilters({ filters, onChange, onApply }: ReviewFiltersProps) {
  const handleInputChange = (field: string, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Property Name */}
        <div>
          <label htmlFor="listingName" className="block text-sm font-medium text-gray-700 mb-1">
            Property Name
          </label>
          <input
            type="text"
            id="listingName"
            value={filters.listingName}
            onChange={(e) => handleInputChange('listingName', e.target.value)}
            placeholder="Search properties..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Channel */}
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-1">
            Channel
          </label>
          <select
            id="channel"
            value={filters.channel}
            onChange={(e) => handleInputChange('channel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Channels</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Booking.com">Booking.com</option>
            <option value="Vrbo">Vrbo</option>
            <option value="Hostaway">Hostaway</option>
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
            Min Rating
          </label>
          <select
            id="minRating"
            value={filters.minRating}
            onChange={(e) => handleInputChange('minRating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={onApply}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            onChange({
              listingName: '',
              channel: '',
              minRating: '',
              startDate: '',
              endDate: '',
            });
            onApply();
          }}
          className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
