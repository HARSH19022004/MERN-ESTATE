import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRef } from 'react';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import app from '../firebase'; 
import { useDispatch } from 'react-redux';
import { updateUserStart,updateUserSuccess,updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signInStart, signoutUserFailure, signoutUserSuccess, signoutUserStart  } from '../redux/user/userSlice';
import {Link} from 'react-router-dom';


export default function profile() {
  const {currentUser,loading,error} =useSelector((state)=>state.user);
  const fileref= useRef(null);
  const dispatch =useDispatch();
  const [file,setFile] =useState(undefined);
  const [filePerc,setFilePerc] =useState(0);
  const [formData ,setFormData] =useState({});
  const [fileUploadError ,setFileUploadError] =useState(false);
  const [showListingsError ,setShowListingsError] =useState(false);
  const [updateSuccess ,setUpdateSuccess]= useState(false);
  const [userListings ,setUserListings]=useState([]);

  useEffect(()=>{
    setUserListings(userListings)
  },[userListings]);
  // console.log(formData);

  useEffect(()=>{
    if(file){
      handleFileUpload(file);
    }
  },[file]);

  const handleFileUpload =(file)=>{
    const storage =getStorage(app);
    const filename =new Date().getTime()+file.name;
    const storageRef =ref(storage, filename);
    const uploadTask =uploadBytesResumable(storageRef,file);

    uploadTask.on('state_changed',
      (snapshot)=>{
        const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
        setFilePerc(Math.round(progress));
      },
      (error)=>{
        setFileUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then
        ((downloadURL)=>{
          // console.log('File available at', downloadURL);
          setFormData({...formData,avatar:downloadURL})
        })
      }
    );
    
  }
  const handleChange=(e)=>{
    setFormData({...formData, [e.target.id] :e.target.value});
  }
  const handleSubmit=async (e)=>{
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      console.log(formData);
      const res= await fetch (`/api/user/update/${currentUser._id}`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(formData),
      });
      const data =await res.json();
      if(data.success===false){
        dispatch(updateUserFailure(data.message))
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  } 

  const handleDeleteUser= async()=>{
    try {
      dispatch(deleteUserStart);
      const res= await fetch (`/api/user/delete/${currentUser._id}`,{
        method:'DELETE',
      });      
      const data =await res.json();
      if(data.success ===false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }
  const handleSignout=async()=>{
    try {
      dispatch(signoutUserStart());
      const res =await fetch('/api/auth/signout');
      const data= await res.json();
      if(data.success===false){
        dispatch(signoutUserFailure(data.message));
        return;
      }
      dispatch(signoutUserSuccess(data));
    } catch (error) {
      dispatch(signoutUserFailure(error.message));
    }
  }

  const handleShowListinigs=async ()=>{
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data =await res.json();
      if(data.success===false){
        setShowListingsError(true);      
        return;
      }
      setUserListings(data);
      console.log(data);
    } catch (error) {
      setShowListingsError(true);
    }
  }
const handlelListingDelete=async(listingId)=>{
  try {
    const res =await fetch(`/api/listing/delete/${listingId}`,{
      method:'DELETE',
    });
    const data =await res.json();
    console.log(data);
    
    if(data.success===false) {
      console.log(data.message);
      return;
    }
    setUserListings((prev)=> prev.filter((listing)=>listing._id !==listingId));  
  } catch (error) {
    console.log(error.message);
    
  }
}
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col justify-center  gap-4'>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])} ref={fileref} className='hidden' accept='image/*' />
        <img onClick={()=>fileref.current.click()} src={formData.avatar ||currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'onChange={handleChange} />
        <p className='mx-auto'>
          {fileUploadError?
          (<span className='text-red-700'>Image Uploade Error</span>):
          filePerc>0 && filePerc<100 ? 
          (<span className='text-slate-700'>{`uploading ${filePerc}%`}</span>):
          filePerc===100 ?
          (<span className='text-green-700'>image successfully uploaded</span>):
          ("")
        }
        </p>
        <input type="text" id="username"placeholder='username' defaultValue={currentUser.username} className='border p-3 rounded' onChange={handleChange}/>
        <input type="text" id="email"placeholder='email' defaultValue={currentUser.email} className='border p-3 rounded' onChange={handleChange}/>
        <input type="password" id="password"placeholder='password' className='border p-3 rounded' onChange={handleChange} />
        <button disabled={loading} className='bg-slate-700 p-2 rounded-lg uppercase hover:opacity-95 text-white disabled:opacity-85'>{loading? 'Loadinig': 'Update'}</button>
        <Link className='bg-green-600 text-white p-2 uppercase rounded-md text-center hover:opacity-95' to={'/create-listing'}>Create Listinig</Link>
      </form>
      <div className='flex justify-between m-2'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignout} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>{error? error :' '} </p>
      <p className='text-green-600 mt-4'>{updateSuccess? 'User Updated Successfully' :''}</p>
      <button onClick={handleShowListinigs} className='text-green-600 w-full '>Show Listings</button>
      <p className='text-red-700 mt-5 '>{showListingsError ? 'Error Showinig Listinigs' :'' } </p>
      <div className="p-5 bg-gray-50 rounded-lg shadow-md">
  <h1 className="text-3xl font-bold text-center text-gray-800 my-7">Your Listings</h1>
  {userListings && userListings.length > 0 ? (
    <div className="grid gap-6">
      {userListings.map((listing) => (
        <div
          key={listing._id}
          className="border bg-white p-4 rounded-lg flex items-center justify-between gap-4 shadow hover:shadow-lg transition"
        >
          {/* Listing Image */}
          <Link to={`/listing/${listing._id}`} className="shrink-0">
            <img
              src={listing.imageUrls[0]}
              alt="Listing cover"
              className="h-20 w-20 object-cover rounded-lg"
            />
          </Link>

          {/* Listing Details */}
          <div className="flex-1 ml-4">
            <Link
              to={`/listing/${listing._id}`}
              className="text-lg font-semibold text-gray-800 hover:text-blue-600 truncate block"
            >
              {listing.name}
            </Link>
            <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
            <p className="text-green-700 font-medium mt-2 text-lg">₹{listing.regularPrice}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 items-center">
            <button onClick={()=>handlelListingDelete(listing._id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg uppercase font-medium hover:bg-red-200 transition">
              Delete
            </button>
            <button className="bg-green-100 text-green-600 px-4 py-2 rounded-lg uppercase font-medium hover:bg-green-200 transition">
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-500">No listings available.</p>
  )}
</div>

    </div>
  )
}
