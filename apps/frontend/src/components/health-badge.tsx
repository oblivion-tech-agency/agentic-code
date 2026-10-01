'use client';

import { useEffect, useState } from 'react';
import { fetchHealth } from '../lib/api';

export default function HealthBadge() {
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setHealthOk(true))
      .catch(() => setHealthOk(false));
  }, []);

  if (healthOk === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        healthOk ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
      }`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${healthOk ? 'bg-success' : 'bg-danger'}`}
      />
      {healthOk ? 'API online' : 'API offline'}
    </span>
  );
}
