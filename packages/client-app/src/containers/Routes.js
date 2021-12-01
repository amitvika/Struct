import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';

import HomePage from '../pages/homePage/index';
import Header from '../components/Header';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
