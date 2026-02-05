import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';

const AdminProfile = () => {
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState({
        name: 'NCIP Admin',
        role: 'Super Administrator',
        email: 'admin@ncip.gov.ph',
        username: 'admin',
        avatar: localStorage.getItem('adminAvatarUrl') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=NCIPAdmin'
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState('');

    // Sync state from Database
    useEffect(() => {
        const fetchAvatar = async () => {
            const dbAvatar = await settingsService.getAdminAvatar();
            if (dbAvatar) {
                setProfile(p => ({ ...p, avatar: dbAvatar }));
                localStorage.setItem('adminAvatarUrl', dbAvatar); // Keep local sync for speed
            }
        };

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setProfile(prev => ({ ...prev, email: user.email }));
                setOriginalEmail(user.email);
            }
        };

        fetchAvatar();
        fetchUser();

        // Also listen for local updates
        const handleLocalUpdate = () => {
            const stored = localStorage.getItem('adminAvatarUrl');
            if (stored) setProfile(p => ({ ...p, avatar: stored }));
        };
        window.addEventListener('admin-avatar-updated', handleLocalUpdate);
        return () => window.removeEventListener('admin-avatar-updated', handleLocalUpdate);
    }, []);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const uploadAvatar = async (file) => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `admin-avatar-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Update State, Persistent Storage & Database
            setProfile(prev => ({ ...prev, avatar: publicUrl }));
            localStorage.setItem('adminAvatarUrl', publicUrl);

            // Persist to DB
            await settingsService.updateAdminAvatar(publicUrl);

            // Dispatch event for Header to pick up
            window.dispatchEvent(new Event('admin-avatar-updated'));

            showToast('Avatar uploaded successfully!', 'success');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showToast('Error uploading avatar: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 1. Load Constraints from Settings
            const savedSettings = localStorage.getItem('adminSettings');
            let maxFileSize = 5 * 1024 * 1024; // Default 5MB
            let allowedTypes = { jpg: true, png: true, pdf: true, docx: false }; // Defaults

            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                // Parse "5MB", "10MB" etc.
                const sizeMap = { '2MB': 2, '5MB': 5, '10MB': 10, '20MB': 20 };
                const mb = sizeMap[settings.maxFileSize] || 5;
                maxFileSize = mb * 1024 * 1024;
                allowedTypes = settings.fileTypes || allowedTypes;
            }

            // 2. Validate Size
            if (file.size > maxFileSize) {
                showToast(`File too large! Maximum allowed size is ${localStorage.getItem('adminSettings') ? JSON.parse(localStorage.getItem('adminSettings')).maxFileSize : '5MB'}.`, 'warning');
                return;
            }

            // 3. Validate Type
            const fileExt = file.name.split('.').pop().toLowerCase();
            const typeMap = { 'jpg': 'jpg', 'jpeg': 'jpg', 'png': 'png', 'pdf': 'pdf', 'docx': 'docx' };
            const unifiedType = typeMap[fileExt];

            if (!unifiedType || !allowedTypes[unifiedType]) {
                showToast(`File type .${fileExt} is not allowed by system settings.`, 'warning');
                return;
            }

            // Preview immediately
            const objectUrl = URL.createObjectURL(file);
            setProfile(prev => ({ ...prev, avatar: objectUrl }));

            // Trigger Upload
            uploadAvatar(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const updates = {
                data: {
                    full_name: profile.name,
                    username: profile.username
                }
            };

            // Check if email changed
            const emailChanged = profile.email !== originalEmail;
            if (emailChanged) {
                updates.email = profile.email;
                setPendingEmail(profile.email);
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            if (emailChanged) {
                setShowOtpInput(true);
                showToast('Verification code sent to your new email!', 'success');
            } else {
                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showToast('Error updating profile: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleVerifyEmailOTP = async (e) => {
        e.preventDefault();
        try {
            setUploading(true);
            const { error } = await supabase.auth.verifyOtp({
                email: pendingEmail,
                token: otp,
                type: 'email_change'
            });

            if (error) throw error;

            showToast('Email updated successfully!', 'success');
            setOriginalEmail(pendingEmail);
            setShowOtpInput(false);
            setOtp('');
        } catch (error) {
            console.error('OTP Verification error:', error);
            showToast('Invalid or expired code.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showToast('New passwords do not match!', 'error');
            return;
        }

        try {
            setUploading(true);
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (error) throw error;

            showToast('Password updated successfully!', 'success');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Password update error:', error);
            showToast('Error updating password: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-page-background">
            <div className="container dashboard-container">
                <div className="page-header">
                    <div className="page-header-content">
                        <h1>Admin Profile</h1>
                        <p>Manage your account settings and security.</p>
                    </div>
                </div>

                <div className="profile-container">
                    {/* Right Column: Edit & Security Card (Now Left) */}
                    <div className="glass-card security-card">
                        <h3>Account Details</h3>
                        <form onSubmit={handleSaveProfile}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    disabled={showOtpInput}
                                />
                                <small>Changing email requires verification.</small>
                            </div>

                            {showOtpInput && (
                                <div className="glass-card" style={{ marginTop: '1rem', border: '1px solid var(--primary-color)', padding: '1rem' }}>
                                    <div className="form-group">
                                        <label>Enter Verification Code (OTP)</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                                            required
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                            <button
                                                type="button"
                                                onClick={handleVerifyEmailOTP}
                                                className="btn btn-primary"
                                                style={{ flex: 1 }}
                                                disabled={uploading}
                                            >
                                                Verify Code
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowOtpInput(false)}
                                                className="btn btn-ghost"
                                                style={{ padding: '0 1rem' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!showOtpInput && (
                                <div className="text-right">
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? 'Updating...' : 'Update Details'}
                                    </button>
                                </div>
                            )}
                        </form>

                        <div className="divider"></div>

                        <h3>Password Management</h3>
                        <form onSubmit={handleUpdatePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="current"
                                    value={passwords.current}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="submit" className="btn btn-secondary">Change Password</button>
                            </div>
                        </form>
                    </div>

                    {/* Left Column: Identity Card (Now Right) */}
                    <div className="glass-card identity-card">
                        <div className="avatar-large-container">
                            <img src={profile.avatar} alt="Profile" className="avatar-large" />
                            <div
                                className="camera-overlay"
                                title="Change Photo"
                                onClick={triggerFileInput}
                            >
                                📷
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>
                        <h2 className="admin-name-large">{profile.name}</h2>
                        <p className="admin-role">{profile.role}</p>
                        <div className="status-badge-large">
                            <span className="status-dot"></span>
                            Active Status
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
