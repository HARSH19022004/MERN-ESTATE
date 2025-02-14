import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { Autoplay } from 'swiper/modules'; // Correct import for Autoplay
import { useSelector } from 'react-redux';
import 'swiper/css/bundle';
import 'swiper/css/pagination';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

// Initialize Swiper modules
SwiperCore.use([Navigation, Autoplay, Pagination]);

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (!res.ok || data.success === false) throw new Error();
        setListing(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-200'>
      {loading && (
        <p className='text-center my-7 text-2xl font-semibold text-slate-700'>Loading...</p>
      )}
      {error && (
        <p className='text-center my-7 text-2xl font-semibold text-red-600'>
          Something went wrong!
        </p>
      )}
      {listing && !loading && !error && (
        <div>
          {/* Hero Section */}
          <div className='relative h-[400px] bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center'>
            <h1 className='text-4xl md:text-5xl font-bold text-white text-center'>
              {listing.name}
            </h1>
          </div>

          {/* Image Carousel */}
          {listing.imageUrls?.length > 0 && (
            <Swiper
              navigation
              loop={true}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              className='w-full max-w-4xl mx-auto mt-8 rounded-lg shadow-xl'
            >
              {listing.imageUrls.map((url, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={url}
                    alt={`Slide ${index + 1}`}
                    className='w-full h-[450px] object-cover rounded-lg'
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Share Button */}
          <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-white cursor-pointer shadow-lg hover:bg-slate-100 transition-colors'>
            <FaShare
              className='text-slate-600 hover:text-slate-800'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            />
          </div>
          {copied && (
            <div className='fixed top-[23%] right-[5%] z-10 rounded-md bg-white p-2 shadow-md'>
              Link copied!
            </div>
          )}

          {/* Listing Details */}
          <div className='max-w-4xl mx-auto p-6 my-8 bg-white rounded-lg shadow-lg'>
            <p className='text-3xl font-bold text-slate-800 mb-4'>
              ${' '}
              {(listing.offer ? listing.discountPrice : listing.regularPrice).toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <p className='flex items-center gap-2 text-slate-600 text-sm mb-4'>
              <FaMapMarkerAlt className='text-green-600' />
              {listing.address}
            </p>
            <div className='flex gap-4 mb-6'>
              <p className='bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full'>
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </p>
              {listing.offer && (
                <p className='bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full'>
                  ${listing.regularPrice - listing.discountPrice} OFF
                </p>
              )}
            </div>
            <p className='text-slate-700 mb-6'>
              <span className='font-bold text-slate-800'>Description - </span>
              {listing.description}
            </p>
            <ul className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
              <li className='flex items-center gap-2 text-slate-700'>
                <FaBed className='text-blue-600' />
                {listing.bedrooms} {listing.bedrooms > 1 ? 'Beds' : 'Bed'}
              </li>
              <li className='flex items-center gap-2 text-slate-700'>
                <FaBath className='text-blue-600' />
                {listing.bathrooms} {listing.bathrooms > 1 ? 'Baths' : 'Bath'}
              </li>
              <li className='flex items-center gap-2 text-slate-700'>
                <FaParking className='text-blue-600' />
                {listing.parking ? 'Parking' : 'No Parking'}
              </li>
              <li className='flex items-center gap-2 text-slate-700'>
                <FaChair className='text-blue-600' />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='w-full bg-blue-600 text-white py-3 rounded-lg uppercase font-semibold hover:bg-blue-700 transition-colors'
              >
                Contact Landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}