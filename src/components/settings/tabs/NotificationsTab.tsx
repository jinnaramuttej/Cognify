'use client'

import { Button } from '@/components/ui/button';

export default function NotificationsTab() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-lg">Email Notifications</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Daily Progress Report','New Course Available','Live Class Reminder','Payment Receipt','Password Changed','Account Security Alerts'].map(n => (
            <label key={n} className="flex items-center gap-3"><input type="checkbox" /> {n}</label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg">Push Notifications</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Leaderboard Position Change','New Badge Earned','Friend Joined','Store Order Status','Study Streak Reminder'].map(n => (
            <label key={n} className="flex items-center gap-3"><input type="checkbox" /> {n}</label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg">WhatsApp Notifications</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3"><input type="checkbox" /> Live Class Links</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Payment Reminders</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Marketing Offers (OFF by default)</label>
        </div>
      </section>
    </div>
  );
}

