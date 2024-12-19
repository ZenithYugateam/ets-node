import React from 'react';
import { UserCircle2 } from 'lucide-react';

export function WelcomeSection() {
  return (
    <section>
      <div className="flex items-center space-x-4">
        <UserCircle2 className="w-12 h-12 text-blue-600" />
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Welcome HR</h1>
          <p className="text-gray-500">Here's what's happening today</p>
        </div>
      </div>
    </section>
  );
}