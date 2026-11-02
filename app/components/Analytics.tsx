'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

// Aggregate page views only. No persistent visitor ID or third-party analytics.
export function Analytics() {
  const pathname = usePathname();
  const event = useRef({ path: '', id: '' });
  useEffect(() => {
    // Remove identifiers left by the previous opt-in counter.
    try { localStorage.removeItem('rooki-visitor'); localStorage.removeItem('rooki-analytics'); } catch {}
    if (pathname.startsWith('/admin')) return;
    if (event.current.path !== pathname) event.current = { path: pathname, id: crypto.randomUUID() };
    void fetch('/api/analytics/visit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: event.current.id }),
      keepalive: true, referrerPolicy: 'no-referrer',
    }).catch(() => {});
  }, [pathname]);
  return null;
}
