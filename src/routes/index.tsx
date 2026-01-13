import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/navigation/ProtectedRoute';
import RegistrationPage from '../pages/RegistrationPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import BoardPage from '../pages/BoardPage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route
          path="/board"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
