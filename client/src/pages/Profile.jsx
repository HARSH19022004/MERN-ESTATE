import React from 'react'
import { useSelector } from 'react-redux'

export default function profile() {
  const {currentUser} =useSelector((state)=>state.user);
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col justify-center  gap-4'>
        <img src={currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <input type="text" id="username"placeholder='username' className='border p-3 rounded' />
        <input type="text" id="email"placeholder='email' className='border p-3 rounded' />
        <input type="text" id="password"placeholder='password' className='border p-3 rounded' />
        <button className='bg-slate-700 p-2 rounded-lg uppercase hover:opacity-95 text-white disabled:opacity-85'>update</button>
      </form>
      <div className='flex justify-between m-2'>
        <span className='text-red-700 cursor-pointer'>Delete account</span>
        <span className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
    </div>
  )
}
