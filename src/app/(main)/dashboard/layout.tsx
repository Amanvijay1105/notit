import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = async ({ children }: LayoutProps) => {
  return (
    <main className="flex overflow-hidden h-screen">
      {children}
    </main>
  );
};

export default Layout;