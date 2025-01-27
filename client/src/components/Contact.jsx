import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        if (!res.ok) throw new Error('Failed to fetch landlord information');
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.error(error);
        setError('Could not load landlord information.');
      } finally {
        setLoading(false);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  if (loading) return <p>Loading landlord details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-2'>
          <p>
            Contact <span className='font-semibold'>{landlord.username}</span>{' '}
            for{' '}
            <span className='font-semibold'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='2'
            value={message}
            onChange={onChange}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-lg'
          ></textarea>

          {/* Dynamically enable/disable the Send button */}
          <a
            href={
              message.trim()
                ? `mailto:${landlord.email}?subject=Regarding ${encodeURIComponent(
                    listing.name
                  )}&body=${encodeURIComponent(message)}`
                : undefined
            }
            className={`bg-slate-700 text-white text-center p-3 uppercase rounded-lg ${
              message.trim() ? 'hover:opacity-95' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!message.trim()) {
                e.preventDefault();
                alert('Please enter a message before sending.');
              }
            }}
          >
            Send Message
          </a>
        </div>
      )}
    </>
  );
}
