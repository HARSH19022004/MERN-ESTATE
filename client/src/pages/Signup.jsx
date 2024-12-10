import {Link} from 'react-router-dom';

export default function Signup() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-6'>Signup</h1>
      <form className='flex flex-col gap-4'>
        <input type="text" placeholder='username' className='border p-3 rounded-lg' id='username' />
        <input type="email" placeholder='email' className='border p-3 rounded-lg' id='email' />
        <input type="password" placeholder='password' className='border p-3 rounded-lg' id='password' />
      <button disabled className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:5'>sign up</button>
      </form>
      <div className='flex gap-3 mt-5'>
        <p>Have an account?</p>
        <Link className='text-blue-500'>
        <span>sign-in</span>
        </Link>
      </div>
    </div>
  )
}
