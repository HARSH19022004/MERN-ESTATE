import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import { ArrowRight, Home, Building, DollarSign } from 'lucide-react';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function LandingPage() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation, Autoplay, EffectFade]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const [offerRes, rentRes, saleRes] = await Promise.all([
          fetch('/api/listing/get?offer=true&limit=4').then(res => res.json()),
          fetch('/api/listing/get?type=rent&limit=4').then(res => res.json()),
          fetch('/api/listing/get?type=sell&limit=4').then(res => res.json()),
        ]);
        setOfferListings(offerRes);
        setRentListings(rentRes);
        setSaleListings(saleRes);
      } catch (error) {
        console.log(error);
      }
    };
    fetchListings();
  }, []);

  if (offerListings.length === 0) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-2xl text-gray-600">
        Discovering dream homes...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[92vh]">
        <Swiper
          navigation
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="h-full"
        >
          {offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div className="relative h-full group">
                <img
                  src={listing.imageUrls[0]}
                  alt={listing.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
                <div className="absolute inset-0 flex items-end">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20">
                    <div className="max-w-2xl">
                      <h1 className="text-5xl md:text-7xl font-light text-white mb-6 opacity-90">
                        {listing.name}
                      </h1>
                      <p className="text-xl text-white/90 mb-8 line-clamp-2">
                        {listing.description}
                      </p>
                      <Link
                        to={`/listing/${listing._id}`}
                        className="inline-flex items-center px-6 py-3 bg-white/90 hover:bg-white text-gray-900 rounded-lg transition-all duration-200 transform hover:translate-y-[-2px]"
                      >
                        Explore Property
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Stats Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Home, label: 'Properties Listed', value: '500+' },
              { icon: Building, label: 'Cities Covered', value: '50+' },
              { icon: DollarSign, label: 'Successful Deals', value: '1000+' },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-center space-x-4">
                <stat.icon className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                  <div className="text-gray-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-24">
        {[
          { title: 'Featured Properties', subtitle: 'Exclusive selection of premium properties', listings: offerListings, link: '/search?offer=true' },
          { title: 'Available for Rent', subtitle: 'Find your perfect rental home', listings: rentListings, link: '/search?type=rent' },
          { title: 'Properties for Sale', subtitle: 'Discover your dream home', listings: saleListings, link: '/search?type=sale' }
        ].map((section, idx) => (
          section.listings.length > 0 && (
            <section key={idx} className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-light text-gray-900">{section.title}</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">{section.subtitle}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {section.listings.map((listing) => (
                  <div key={listing._id} className="group transform hover:-translate-y-1 transition-all duration-200">
                    <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-md">
                      <ListingItem listing={listing} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  to={section.link}
                  className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                >
                  View all properties
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </section>
          )
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h2 className="text-4xl font-light text-white mb-6">
            Ready to find your perfect home?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Browse through our carefully curated selection of premium properties
          </p>
          <Link
            to="/search"
            className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-colors"
          >
            Start Your Journey
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}