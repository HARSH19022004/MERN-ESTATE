import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRef } from 'react';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import app from '../firebase'; 
import { useDispatch } from 'react-redux';
import { updateUserStart,updateUserSuccess,updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess  } from '../redux/user/userSlice';



export default function profile() {
  const {currentUser,loading,error} =useSelector((state)=>state.user);
  const fileref= useRef(null);
  const dispatch =useDispatch();
  const [file,setFile] =useState(undefined);
  const [filePerc,setFilePerc] =useState(0);
  const [formData ,setFormData] =useState({});
  const [fileUploadError ,setFileUploadError] =useState(false);
  const [updateSuccess ,setUpdateSuccess]= useState(false);
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
        setFileUploadError=true;
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then
        ((downloadURL)=>{
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
      </form>
      <div className='flex justify-between m-2'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete account</span>
        <span className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
      <p className='text-red-700 mt-5'>{error? error :' '} </p>
      <p className='text-green-600 mt-4'>{updateSuccess? 'User Updated Successfully' :''}</p>
    </div>
  )
}
