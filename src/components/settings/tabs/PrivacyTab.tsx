'use client'

import { Button } from '@/components/ui/button';

export default function PrivacyTab() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-lg">Privacy Settings</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3"><input type="radio" name="visibility" /> Public</label>
          <label className="flex items-center gap-3"><input type="radio" name="visibility" /> Friends Only</label>
          <label className="flex items-center gap-3"><input type="radio" name="visibility" /> Private</label>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg">Data & Analytics</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3"><input type="checkbox" /> Usage Analytics</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> AI Training Data (opt-out)</label>
          <label className="flex items-center gap-3"><input type="checkbox" /> Personalized Recommendations</label>
          <div className="mt-3">
            <Button variant="destructive">Delete All Data</Button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-lg">Connected Apps</h3>
        <div className="mt-3 space-y-2">

          <div className="flex items-center justify-between">
            <div>WhatsApp Business</div>
            <Button variant="ghost">Disconnect</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>Razorpay</div>
            <Button variant="ghost">Remove Access</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

