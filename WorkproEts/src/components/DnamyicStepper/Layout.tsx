import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        {children}
      </main>
    </div>
  );
}