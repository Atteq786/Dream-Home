import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRef } from 'react'
import axios from 'axios';

export default function Profile() {
  const fileRef = useRef(null);
  const {currentUser} = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'Dream Home Preset');
    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/dzl3lrrdm/image/upload',
      data
    );
    return res.data.secure_url;
  };

  const handleFileUpload = async (file) => {
    try {
      const url = await uploadToCloudinary(file);
      setAvatarUrl(url);
      setImageUploadSuccess(true);
      setTimeout(() => setImageUploadSuccess(false), 3000);
    } catch (err) {
      alert('Image upload failed');
    }
  };

  return (
    <div className='p-5 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center mb-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
        <input onChange={e => setFile(e.target.files[0])} type="file" ref={fileRef} hidden />
        <img
          onClick={e => {
            e.preventDefault();
            fileRef.current.click();
          }}
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
          src={avatarUrl}
          alt="profile"
        />
        {imageUploadSuccess && (
          <p className='text-green-600 text-center'>Image uploaded successfully!</p>
        )}
        <input type="text" placeholder='username' className='border bg-white p-3 rounded-lg' id='username'/>
        <input type="text" placeholder='email' className='border p-3  bg-white rounded-lg' id='email'/>
        <input type="text" placeholder='password' className='border p-3  bg-white rounded-lg' id='password'/>
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 '>Update</button>
      </form>
      <div className=' flex justify-between mt-5'>
        <span className=' text-red-700 cursor-pointer'>Delete Account</span>
        <span className=' text-red-700 cursor-pointer'>Sign out</span>
      </div>
    </div>
  );
}
