import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRef } from 'react'
import axios from 'axios';
import { 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure, 
  deleteUserFailure, 
  deleteUserSuccess, 
  deleteUserStart,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure 
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const {currentUser, loading, error} = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
      // Send to backend
      dispatch(updateUserStart());
      const res = await axios.post(`/api/user/update/${currentUser._id}`, {
        avatar: url
      });
      if (res.data && res.data.success === false) {
        setImageUploadError(true);
        setTimeout(() => setImageUploadError(false), 3000);
        dispatch(updateUserFailure(res.data.message));
        return;
      }
      dispatch(updateUserSuccess({ ...currentUser, avatar: url }));
      setImageUploadSuccess(true);
      setTimeout(() => setImageUploadSuccess(false), 3000);
    } catch (err) {
      setImageUploadError(true);
      setTimeout(() => setImageUploadError(false), 3000);
      dispatch(updateUserFailure('Image upload failed'));
    }
  }
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
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
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

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <div className='p-5 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center mb-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
        {imageUploadError && (
          <p className='text-red-600 text-center'>Failed to update image!</p>
        )}
        <input type="text"  onChange={handleChange} defaultValue={currentUser.username} placeholder='username' className='border bg-white p-3 rounded-lg' id='username'/>
        <input type="text"  onChange={handleChange} defaultValue={currentUser.email} placeholder='email' className='border p-3  bg-white rounded-lg' id='email'/>
        <input type="password"  onChange={handleChange}  placeholder='password' className='border p-3  bg-white rounded-lg' id='password'/>
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 '>{loading ? 'Updating...' : 'Update'}</button>
       
        <Link className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-90' to={"/create-listing"}>
        Create Listing
        </Link>

      </form>
      <div className=' flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer' onClick={handleDeleteUser}>Delete Account</span>
        <span className='text-red-700 cursor-pointer' onClick={handleSignOut}>Sign out</span>
      </div>
      <p>{error && <span className='text-red-700 '>{error}</span>}</p>
      <p className='text-green-700 '>{updateSuccess && 'Profile updated successfully!'}</p>
    </div>
  );
}
