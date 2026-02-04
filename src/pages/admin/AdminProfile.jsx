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

    // Sync state from Database
    useEffect(() => {
        const fetchAvatar = async () => {
            const dbAvatar = await settingsService.getAdminAvatar();
            if (dbAvatar) {
                setProfile(p => ({ ...p, avatar: dbAvatar }));
                localStorage.setItem('adminAvatarUrl', dbAvatar); // Keep local sync for speed
            }
        };
        fetchAvatar();

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

    const handleSaveProfile = (e) => {
        e.preventDefault();
        showToast('Profile updated successfully! (Mock)', 'success');
        // In real app, update Supabase auth/profile here
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showToast('New passwords do not match!', 'error');
            return;
        }
        showToast('Password updated successfully! (Mock)', 'success');
        setPasswords({ current: '', new: '', confirm: '' });
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
                                    value={profile.email}
                                    readOnly
                                    className="input-readonly"
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                                <small>Email cannot be changed for security reasons.</small>
                            </div>
                            <div className="text-right">
                                <button type="submit" className="btn btn-primary">Update Details</button>
                            </div>
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
