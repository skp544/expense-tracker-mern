import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Lock, Globe, Target, Camera, Save } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../utils/helpers';

export default function Settings() {
  const { user, updateUser, fetchMe } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', currency: user?.currency || 'INR', monthlyBudgetGoal: user?.monthlyBudgetGoal || 0, savingsGoal: user?.savingsGoal || 0 },
  });

  const { register: registerPass, handleSubmit: handlePassSubmit, reset: resetPass, watch: watchPass, formState: { errors: passErrors } } = useForm();

  const onProfileSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const onPasswordSubmit = async (data) => {
    setChangingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPass();
    } catch (err) { toast.error(err.response?.data?.message || 'Password change failed'); }
    finally { setChangingPass(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <User size={16} className="text-brand-400" />
          </div>
          <h3 className="section-title">Profile Information</h3>
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white">
              {avatarPreview
                ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
                : user?.avatar
                ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                : user?.name?.charAt(0).toUpperCase()
              }
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <p className="text-slate-600 text-xs mt-1">Click the avatar to change photo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1.5 block">Full Name</label>
              <input {...register('name', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Currency</label>
              <select {...register('currency')} className="input-field">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Monthly Budget Goal</label>
              <input {...register('monthlyBudgetGoal')} type="number" className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5 block">Savings Goal</label>
              <input {...register('savingsGoal')} type="number" className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Lock size={16} className="text-amber-400" />
          </div>
          <h3 className="section-title">Change Password</h3>
        </div>

        <form onSubmit={handlePassSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Current Password</label>
            <input {...registerPass('currentPassword', { required: true })} type="password" placeholder="••••••••" className="input-field" />
          </div>
          <div>
            <label className="label mb-1.5 block">New Password</label>
            <input {...registerPass('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })} type="password" placeholder="••••••••" className="input-field" />
            {passErrors.newPassword && <p className="text-red-400 text-xs mt-1">{passErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="label mb-1.5 block">Confirm New Password</label>
            <input {...registerPass('confirmPassword', {
              required: true,
              validate: val => val === watchPass('newPassword') || 'Passwords do not match'
            })} type="password" placeholder="••••••••" className="input-field" />
            {passErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{passErrors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={changingPass} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            <Lock size={15} />
            {changingPass ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target size={16} className="text-emerald-400" />
          </div>
          <h3 className="section-title">Account Info</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Account email', value: user?.email },
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
            { label: 'Preferred currency', value: user?.currency || 'INR' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <span className="text-slate-500 text-sm">{item.label}</span>
              <span className="text-white text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
