import React from 'react'
import { Link } from 'react-router-dom';

export default function SignOut() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7' >Sign Up</h1>
      <form action="" className='flex flex-col gap-4'>
        <input type="text"  placeholder='username' className='border p-3 rounded-lg'/>
        <input type="email"  placeholder='email' className='border p-3 rounded-lg'/>
        <input type="password"  placeholder='password' className='border p-3 rounded-lg'/>
        <button className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-90 p-3'>Sign up</button>
      </form>
      <div className=" flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-700">Sign in</span>
        </Link>
      </div>
    </div>
  )
}
