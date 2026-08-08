import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LuChatbot from './LuChatbot';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(220,38,38,0.20),rgba(10,10,12,0))]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LuChatbot />
    </div>
  );
};

export default Layout;
