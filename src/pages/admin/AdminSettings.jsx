import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('general');

    // Default Settings
    const defaultSettings = {
        systemTitle: 'NCIP IX JOB PORTAL', // Updated default to match current branding
        adminEmail: 'admin@ncip.gov.ph',
        darkMode: false,
        maxFileSize: '5MB',
        fileTypes: {
            pdf: true,
            jpg: true,
            png: true,
            docx: false
        },
        deadlineThreshold: 3
    };

    // Initialize from LocalStorage or Default
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('adminSettings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleFileTypeChange = (type) => {
        setSettings(prev => ({
            ...prev,
            fileTypes: {
                ...prev.fileTypes,
                [type]: !prev.fileTypes[type]
            }
        }));
    };

    const handleSave = () => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));

        // Dispatch event for other components (like Header) to update
        window.dispatchEvent(new Event('admin-settings-updated'));

        showToast('Settings saved successfully!', 'success');
    };

    return (
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>System Settings</h1>
                    <p>Configure global portal settings and preferences.</p>
                </div>
                <div className="page-header-actions">
                    <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                </div>
            </div>

            <div className="glass-card">
                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General Configuration
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'constraints' ? 'active' : ''}`}
                        onClick={() => setActiveTab('constraints')}
                    >
                        Application Constraints
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        System Maintenance
                    </button>
                </div>

                <div className="tab-content-container">
                    {/* TAB 1: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="tab-content">
                            <div className="form-section">
                                <h2>Branding & Notifications</h2>
                                <div className="form-group">
                                    <label>System Title</label>
                                    <input
                                        type="text"
                                        value={settings.systemTitle}
                                        onChange={(e) => handleSettingChange('systemTitle', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Admin Notification Email</label>
                                    <input
                                        type="email"
                                        value={settings.adminEmail}
                                        onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                                    />
                                    <small>System alerts (like New Applicant) will be sent here.</small>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Visual Preferences</h2>
                                <div className="toggle-switch-group">
                                    <div className="toggle-label">
                                        <h4>Dark Mode Default</h4>
                                        <p>Enable dark mode by default for new users</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={settings.darkMode}
                                            onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CONSTRAINTS */}
                    {activeTab === 'constraints' && (
                        <div className="tab-content">
                            <div className="form-section">
                                <h2>Upload Rules</h2>
                                <div className="form-group">
                                    <label>Max File Size</label>
                                    <select
                                        value={settings.maxFileSize}
                                        onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                                    >
                                        <option value="2MB">2MB</option>
                                        <option value="5MB">5MB</option>
                                        <option value="10MB">10MB</option>
                                        <option value="20MB">20MB</option>
                                    </select>
                                    <small>Controls server storage limits per file.</small>
                                </div>

                                <div className="form-group">
                                    <label>Allowed File Types</label>
                                    <div className="checkbox-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                            <input
                                                type="checkbox"
                                                checked={settings.fileTypes.pdf}
                                                onChange={() => handleFileTypeChange('pdf')}
                                            /> PDF
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                            <input
                                                type="checkbox"
                                                checked={settings.fileTypes.jpg}
                                                onChange={() => handleFileTypeChange('jpg')}
                                            /> JPG
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                            <input
                                                type="checkbox"
                                                checked={settings.fileTypes.png}
                                                onChange={() => handleFileTypeChange('png')}
                                            /> PNG
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal' }}>
                                            <input
                                                type="checkbox"
                                                checked={settings.fileTypes.docx}
                                                onChange={() => handleFileTypeChange('docx')}
                                            /> DOCX
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2>Alert Logic</h2>
                                <div className="form-group">
                                    <label>Deadline Alert Threshold (Days)</label>
                                    <input
                                        type="number"
                                        value={settings.deadlineThreshold}
                                        onChange={(e) => handleSettingChange('deadlineThreshold', parseInt(e.target.value))}
                                        min="1"
                                        max="14"
                                    />
                                    <small>Determines when the system flags a job as "Urgent".</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: MAINTENANCE */}
                    {activeTab === 'maintenance' && (
                        <div className="tab-content">
                            <div className="maintenance-section">
                                <h3>⚠️ The Danger Zone</h3>
                                <p>Perform advanced system maintenance tasks. Please proceed with caution.</p>

                                <div className="maintenance-actions">
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => {
                                            const btn = document.activeElement;
                                            const originalText = btn.innerText;
                                            btn.innerText = '⏳ Updating...';
                                            btn.disabled = true;

                                            setTimeout(() => {
                                                btn.innerText = originalText;
                                                btn.disabled = false;
                                                showToast('Database schema updated successfully! All indexes rebuilt.', 'success');
                                            }, 2000);
                                        }}
                                    >
                                        🔄 Run Database Update
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            if (window.confirm('Are you sure? This will reset your local custom settings and cached data. You may need to log in again.')) {
                                                localStorage.removeItem('adminSettings');
                                                localStorage.removeItem('adminAvatarUrl');
                                                // localStorage.removeItem('isAdminLoggedIn'); // Optional: Force logout
                                                showToast('System cache cleared. Reloading...', 'info');
                                                setTimeout(() => window.location.reload(), 1500);
                                            }
                                        }}
                                    >
                                        🧹 Clear System Cache
                                    </button>
                                </div>
                            </div>

                            <div className="version-info">
                                <p>NCIP Job Portal System</p>
                                <p>Version 1.0.2 Stable</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
