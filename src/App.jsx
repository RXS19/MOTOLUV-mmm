import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import MotoDetailPage from './pages/MotoDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PartnersPage from './pages/PartnersPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ShopPage from './pages/ShopPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import CreateMotoPage from './pages/CreateMotoPage';
import MyOffersPage from './pages/MyOffersPage';
import MyMotosPage from './pages/MyMotosPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/motos" element={<CatalogPage />} />
                <Route path="/motos/:id" element={<MotoDetailPage />} />
                <Route path="/como-funciona" element={<HowItWorksPage />} />
                <Route path="/sumate" element={<PartnersPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/tienda" element={<ShopPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/iniciar-sesion" element={<LoginPage />} />
                <Route path="/panel" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
                <Route path="/panel/publicar" element={<ProtectedRoute role="vendedor"><CreateMotoPage /></ProtectedRoute>} />
                <Route path="/panel/mis-motos" element={<ProtectedRoute role="vendedor"><MyMotosPage /></ProtectedRoute>} />
                <Route path="/panel/mis-ofertas" element={<ProtectedRoute><MyOffersPage /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

import { useAuth } from './context/AuthContext';
function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'vendedor' || user.role === 'both' ? <SellerDashboard /> : <BuyerDashboard />;
}

export default App;
