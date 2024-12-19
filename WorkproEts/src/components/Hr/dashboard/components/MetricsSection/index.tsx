import React from 'react';
import { MetricCard } from './MetricCard';
import { metricsData } from './metrics.data';

export function MetricsSection() {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricsData.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </section>
  );
}