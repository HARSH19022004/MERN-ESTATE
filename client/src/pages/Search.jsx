import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { FaSearch, FaChevronDown, FaParking, FaCouch, FaTag } from 'react-icons/fa';

export function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newFilters = {
      searchTerm: urlParams.get('searchTerm') || '',
      type: urlParams.get('type') || 'all',
      parking: urlParams.get('parking') === 'true',
      furnished: urlParams.get('furnished') === 'true',
      offer: urlParams.get('offer') === 'true',
      sort: urlParams.get('sort') || 'created_at',
      order: urlParams.get('order') || 'desc',
    };
    setFilters(newFilters);

    const fetchListings = async () => {
      setLoading(true);
      const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
      const data = await res.json();
      setListings(data);
      setShowMore(data.length > 8);
      setLoading(false);
    };
    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(filters);
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    const startIndex = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
    const data = await res.json();
    setListings((prev) => [...prev, ...data]);
    setShowMore(data.length >= 9);
  };

  return (
    <div className='flex flex-col md:flex-row bg-gray-50 min-h-screen'>
      {/* Sidebar (Filters) */}
      <div className='md:sticky md:top-0 md:h-screen p-8 border-b-2 md:border-r-2 bg-white shadow-lg w-full md:w-1/4 overflow-y-auto'>
        <h2 className="text-2xl font-light text-gray-900 mb-6">Refine Search</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          {/* Search Input */}
          <div className="relative group">
            <input
              type="text"
              id="searchTerm"
              placeholder="Search listings..."
              className="border-2 rounded-xl p-4 w-full pl-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 group-hover:bg-white"
              value={filters.searchTerm}
              onChange={handleChange}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
          </div>

          {/* Type Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Property Type</label>
            <div className="relative">
              <select
                id="type"
                className="border-2 p-4 pr-10 appearance-none w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                onChange={handleChange}
                value={filters.type}
              >
                <option value="all">Rent & Sale</option>
                <option value="rent">Rent Only</option>
                <option value="sale">Sale Only</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Amenities Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600">Amenities</h3>
            
            <div className="flex gap-3 items-center p-3 border-2 rounded-xl hover:border-blue-500 transition-colors duration-200 cursor-pointer">
              <input type="checkbox" id="parking" checked={filters.parking} onChange={handleChange} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"/>
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <FaParking className="text-gray-500" />
                Parking Available
              </label>
            </div>

            <div className="flex gap-3 items-center p-3 border-2 rounded-xl hover:border-blue-500 transition-colors duration-200 cursor-pointer">
              <input type="checkbox" id="furnished" checked={filters.furnished} onChange={handleChange} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"/>
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <FaCouch className="text-gray-500" />
                Furnished
              </label>
            </div>

            <div className="flex gap-3 items-center p-3 border-2 rounded-xl hover:border-blue-500 transition-colors duration-200 cursor-pointer">
              <input type="checkbox" id="offer" checked={filters.offer} onChange={handleChange} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"/>
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                <FaTag className="text-gray-500" />
                Special Offer
              </label>
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Sort By</label>
            <div className="relative">
              <select
                id="sort"
                className="border-2 p-4 pr-10 appearance-none w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                onChange={handleChange}
                value={`${filters.sort}_${filters.order}`}
              >
                <option value="regularPrice_desc">Price: High to Low</option>
                <option value="regularPrice_asc">Price: Low to High</option>
                <option value="created_at_desc">Latest First</option>
                <option value="created_at_asc">Oldest First</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <button className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Listings Section */}
      <div className='flex-1 p-8'>
        <div className="max-w-7xl mx-auto">
          <h1 className='text-4xl font-light text-gray-900 mb-6'>
            Available Properties
          </h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-xl text-gray-600">
                Finding properties...
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className='text-xl text-gray-600'>No properties found matching your criteria</p>
              <button 
                onClick={() => navigate('/search')}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {listings.map((listing) => (
                  <div key={listing._id} className="transform hover:-translate-y-1 transition-all duration-200">
                    <ListingItem listing={listing} />
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {showMore && (
                <button
                  onClick={onShowMoreClick}
                  className='mt-8 w-full p-4 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200'
                >
                  Load More Properties
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}