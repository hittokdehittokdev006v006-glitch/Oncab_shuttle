import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { Card, Button, Input, ErrorState, LoadingState } from '../components/ui';
import { Settings, Shield, Bell, Key, Save, CheckCircle, Database } from 'lucide-react';

interface SettingsPageProps {
  onNotify: (msg: string, type?: any) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'notifications' | 'booking'>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'City Shuttle Express',
    support_email: 'support@cityshuttle.com',
    support_phone: '+91 98765 43210',
    currency: 'INR',
    currency_symbol: '₹',
    cancellation_fee_percentage: '10',
    allow_cancellation_hours: '2',
    razorpay_key_id: 'rzp_test_sampleKey123',
    razorpay_secret: '••••••••••••••••••••',
    sms_gateway_enabled: 'true',
    email_alerts_enabled: 'true',
    max_advance_booking_days: '30',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const resp = await settingsAPI.list();
      if (resp.data.data && Array.isArray(resp.data.data)) {
        const map: Record<string, string> = {};
        resp.data.data.forEach((s: any) => {
          map[s.key] = s.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (e: any) {
      // Use fallback defaults if not seeded yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await settingsAPI.bulkUpdate(payload);
      onNotify('Settings saved successfully!');
    } catch (err: any) {
      onNotify(err.response?.data?.message || 'Settings updated locally');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General & Support', icon: Settings },
    { id: 'booking', label: 'Booking & Cancellation', icon: Shield },
    { id: 'payment', label: 'Payment Gateway', icon: Key },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System & Platform Settings</h2>
          <p className="text-slate-400 text-sm">Configure system preferences, payment gateways, and booking rules</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Platform / Service Name"
                  value={settings.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                />
                <Input
                  label="Support Helpline"
                  value={settings.support_phone}
                  onChange={(e) => handleChange('support_phone', e.target.value)}
                />
                <Input
                  label="Currency Code"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Booking & Cancellation Policies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Advance Booking Window (Days)"
                  type="number"
                  value={settings.max_advance_booking_days}
                  onChange={(e) => handleChange('max_advance_booking_days', e.target.value)}
                />
                <Input
                  label="Cancellation Cutoff Window (Hours before trip)"
                  type="number"
                  value={settings.allow_cancellation_hours}
                  onChange={(e) => handleChange('allow_cancellation_hours', e.target.value)}
                />
                <Input
                  label="Cancellation Deduction Fee (%)"
                  type="number"
                  value={settings.cancellation_fee_percentage}
                  onChange={(e) => handleChange('cancellation_fee_percentage', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Razorpay API Integration</h3>
              <div className="space-y-4">
                <Input
                  label="Razorpay Key ID"
                  value={settings.razorpay_key_id}
                  onChange={(e) => handleChange('razorpay_key_id', e.target.value)}
                />
                <Input
                  label="Razorpay Secret"
                  type="password"
                  value={settings.razorpay_secret}
                  onChange={(e) => handleChange('razorpay_secret', e.target.value)}
                />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Alerts & Messaging</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-slate-300 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sms_gateway_enabled === 'true'}
                    onChange={(e) => handleChange('sms_gateway_enabled', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <span>Enable SMS Gateway for OTP & Trip updates</span>
                </label>
                <label className="flex items-center gap-3 text-slate-300 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_alerts_enabled === 'true'}
                    onChange={(e) => handleChange('email_alerts_enabled', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <span>Enable Email receipts and automated trip dispatch notifications</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-700/60">
            <Button type="submit" loading={saving} icon={Save}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
