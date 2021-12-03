import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import HomePage from '../pages/homePage/index';
import Header from '../components/Header';
import MyPurchases from 'src/pages/myPurchases';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-purchases" element={<MyPurchases />} />
      </Routes>
    </BrowserRouter>
  );
}
