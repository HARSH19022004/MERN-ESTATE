import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import app from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutUserFailure, signoutUserSuccess, signoutUserStart } from '../redux/user/userSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTrash, FaEdit, FaSignOutAlt, FaUserCircle, FaUpload } from 'react-icons/fa';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [formData, setFormData] = useState({});
  const [fileUploadError, setFileUploadError] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [userListings, setUserListings] = useState([]);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        console.log(error.message);
        
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      dispatch(signoutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signoutUserFailure(data.message));
        return;
      }
      dispatch(signoutUserSuccess(data));
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8'
      >
        <h1 className='text-4xl font-bold text-center text-slate-800 mb-8'>Profile</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <input
            type='file'
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileRef}
            className='hidden'
            accept='image/*'
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex flex-col items-center gap-4'
          >
            <img
              onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.avatar}
              alt='profile'
              className='rounded-full h-32 w-32 object-cover cursor-pointer border-4 border-blue-200'
            />
            <p className='text-center text-sm'>
              {fileUploadError ? (
                <span className='text-red-600'>Image Upload Error</span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
              ) : filePerc === 100 ? (
                <span className='text-green-600'>Image Successfully Uploaded</span>
              ) : (
                <span className='text-blue-600 flex items-center gap-2'>
                  <FaUpload /> Click to Upload
                </span>
              )}
            </p>
          </motion.div>
          <input
            type='text'
            id='username'
            placeholder='Username'
            defaultValue={currentUser.username}
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={handleChange}
          />
          <input
            type='email'
            id='email'
            placeholder='Email'
            defaultValue={currentUser.email}
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={handleChange}
          />
          <input
            type='password'
            id='password'
            placeholder='Password'
            className='border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className='bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-700 disabled:opacity-80 transition-colors'
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
          <Link
            to='/create-listing'
            className='bg-green-600 text-white p-3 rounded-lg uppercase text-center hover:bg-green-700 transition-colors'
          >
            Create Listing
          </Link>
        </form>
        <div className='flex justify-between mt-6'>
          <button
            onClick={handleDeleteUser}
            className='text-red-600 hover:text-red-800 flex items-center gap-2'
          >
            <FaTrash /> Delete Account
          </button>
          <button
            onClick={handleSignout}
            className='text-blue-600 hover:text-blue-800 flex items-center gap-2'
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
        {error && <p className='text-red-600 mt-5 text-center'>{error}</p>}
        {updateSuccess && (
          <p className='text-green-600 mt-5 text-center'>User Updated Successfully!</p>
        )}
        <button
          onClick={handleShowListings}
          className='w-full text-blue-600 mt-5 hover:underline flex items-center justify-center gap-2'
        >
          <FaUserCircle /> Show Listings
        </button>
        {showListingsError && (
          <p className='text-red-600 mt-5 text-center'>Error Showing Listings</p>
        )}
        {userListings && userListings.length > 0 && (
          <div className='flex flex-col gap-6 mt-8'>
            <h2 className='text-2xl font-bold text-center text-slate-800'>Your Listings</h2>
            {userListings.map((listing) => (
              <motion.div
                key={listing._id}
                className='border p-6 rounded-lg flex justify-between items-center gap-6 shadow-md hover:shadow-lg transition'
                whileHover={{ scale: 1.02 }}
              >
                <Link to={`/listing/${listing._id}`} className='flex items-center gap-6'>
                  <img
                    src={listing.imageUrls[0]}
                    alt='Listing Cover'
                    className='h-20 w-20 object-cover rounded-lg'
                  />
                  <div>
                    <p className='font-semibold text-slate-800'>{listing.name}</p>
                    <p className='text-sm text-slate-600 line-clamp-2'>{listing.description}</p>
                  </div>
                </Link>
                <div className='flex flex-col gap-2'>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='bg-red-100 text-red-600 px-4 py-2 rounded-lg uppercase font-medium hover:bg-red-200 transition flex items-center gap-2'
                  >
                    <FaTrash /> Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='bg-green-100 text-green-600 px-4 py-2 rounded-lg uppercase font-medium hover:bg-green-200 transition flex items-center gap-2'>
                      <FaEdit /> Edit
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}