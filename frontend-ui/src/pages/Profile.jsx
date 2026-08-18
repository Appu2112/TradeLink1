import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Calendar, Save, Loader2, CheckCircle } from 'lucide-react';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = 'https://tradelink1-43ev.onrender.com';

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setPhoneNumber(res.data.phone_number || '');
        setAddress(res.data.address || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, {
        phone_number: phoneNumber,
        address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-850 pb-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{user?.username}</h2>
            <p className="text-xs text-slate-400">Manage your contact details and account information</p>
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4" /> {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Username
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Member Since
              </label>
              <input
                type="text"
                disabled
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Address
            </label>
            <textarea
              rows="3"
              placeholder="Enter your street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-slate-950 font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Details
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;