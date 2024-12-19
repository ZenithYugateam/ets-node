import React from 'react';
import { Layout } from './components/Layout';
import { WelcomeSection } from './components/WelcomeSection';
import { AttendanceSection } from './components/AttendanceSection';
import { MetricsSection } from './components/MetricsSection';

export function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        <WelcomeSection />
        <AttendanceSection />
        <MetricsSection />
      </div>
    </Layout>
  );
}