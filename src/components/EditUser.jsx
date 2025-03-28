import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.put(`https://reqres.in/api/users/${user.id}`, {
        first_name: firstName,
        last_name: lastName,
        email: email
      });
      console.log('API Response:', response.data);

      const updatedUser = {
        ...user,
        first_name: firstName,
        last_name: lastName,
        email: email
      };
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedStoredUsers = storedUsers.map(u =>
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedStoredUsers));

      navigate('/users', {
        state: {
          updatedUser,
          successMessage: 'User updated successfully!',
          timestamp: Date.now()
        }
      });
    } catch (err) {
      console.error('Error updating user', err);
      setError('Failed to update user. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (!user) {
    return <div>No user found</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit User</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
