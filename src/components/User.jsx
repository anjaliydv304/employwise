import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const updateLocalUser = useCallback((updatedUser) => {
    console.log('Updating local user:', updatedUser);

    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(u =>
        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setLastUpdated(Date.now());
      return updatedUsers;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (location.state?.successMessage) {
      setMessage(location.state.successMessage);
    }

    const updatedUser = location.state?.updatedUser;
    if (updatedUser) {
      updateLocalUser(updatedUser);
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (storedUsers.length) {
      setUsers(storedUsers);
    }

    fetchUsers(page);
  }, [page, location.state, navigate, updateLocalUser]);

  const fetchUsers = async (pageNum) => {
    try {
      const response = await axios.get(`https://reqres.in/api/users?page=${pageNum}`);
      const fetchedUsers = response.data.data;

      localStorage.setItem('users', JSON.stringify(fetchedUsers));
      setUsers(fetchedUsers);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching users', error);
      setErrorMessage('Failed to fetch users. Showing local data (if any).');
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(storedUsers);
    }
  };

  const handleEdit = (user) => {
    navigate(`/edit/${user.id}`, {
      state: { user },
      replace: true
    });
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`https://reqres.in/api/users/${userId}`);
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      setMessage('User deleted successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error deleting user', error);
      setErrorMessage('Failed to delete user. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('users');
    navigate('/login');
  };

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <button
          onClick={handleLogout}
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => (
          <div
            key={`${user.id}-${lastUpdated}`}
            className="bg-white shadow-md rounded-lg p-4 flex items-center"
          >
            <img
              src={user.avatar}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-16 h-16 rounded-full mr-4"
            />
            <div className="flex-grow">
              <h2 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(user)}
                className="text-slate-600 hover:bg-blue-100 p-2 rounded"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="text-red-600 hover:bg-red-100 p-2 rounded"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`px-4 py-2 rounded ${
              page === pageNum
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
