import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UsersList from './components/User';
import EditUser from './components/EditUser';

const App = () => {
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    return token ? <>{children}</> : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UsersList />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditUser />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
