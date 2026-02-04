import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/ncip-logo.png';
import { settingsService } from '../services/settingsService';

const AdminHeader = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // 1. Initial State from Storage or Fallback
    const [avatarSrc, setAvatarSrc] = useState(
        localStorage.getItem('adminAvatarUrl') ||
        "https://api.dicebear.com/7.x/avataaars/svg?seed=NCIPAdmin"
    );

    const fallbackAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=NCIPAdmin";

    // 2. Listen for Updates & Initial Fetch
    useEffect(() => {
        // Initial Fetch from DB
        const fetchAvatar = async () => {
            const dbAvatar = await settingsService.getAdminAvatar();
            if (dbAvatar) {
                setAvatarSrc(dbAvatar);
                localStorage.setItem('adminAvatarUrl', dbAvatar); // Sync local
            }
        };
        fetchAvatar();

        // Listen for local updates (e.g., immediate upload feedback)
        const handleAvatarUpdate = () => {
            const newAvatar = localStorage.getItem('adminAvatarUrl');
            if (newAvatar) {
                setAvatarSrc(newAvatar);
            }
        };

        window.addEventListener('admin-avatar-updated', handleAvatarUpdate);
        return () => window.removeEventListener('admin-avatar-updated', handleAvatarUpdate);
    }, []);

    // Click Outside Logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 3. System Title Logic
    const [systemTitle, setSystemTitle] = useState("NCIP IX JOB PORTAL");

    useEffect(() => {
        const loadSettings = () => {
            const saved = localStorage.getItem('adminSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.systemTitle) {
                    setSystemTitle(parsed.systemTitle);
                }
            }
        };

        loadSettings(); // Initial load

        window.addEventListener('admin-settings-updated', loadSettings);
        return () => window.removeEventListener('admin-settings-updated', loadSettings);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        console.log("Logging out...");
        localStorage.removeItem('isAdminLoggedIn');
        navigate('/admin/login');
    };

    return (
        <header className="admin-header">
            <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                {/* Left Side: Branding */}
                <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                        src={logo}
                        alt="NCIP Logo"
                        className="header-logo"
                        style={{ height: '50px', width: 'auto' }}
                    />
                    <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: '800', color: 'var(--primary-dark)', textTransform: 'uppercase', fontSize: '1.25rem' }}>
                        {systemTitle}
                    </h2>
                </div>

                {/* Right Side: Navigation & Profile */}
                <nav className="admin-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/admin/dashboard" style={{ fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary-dark)' }}>DASHBOARD</Link>
                    <Link to="/admin/jobs" style={{ fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary-dark)' }}>JOBS</Link>
                    <Link to="/admin/applications" style={{ fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary-dark)' }}>APPLICATIONS</Link>

                    {/* Profile Dropdown */}
                    <div className="user-menu-dropdown" ref={dropdownRef} style={{ position: 'relative', marginLeft: '1rem' }}>
                        <button
                            className={`profile-trigger ${isDropdownOpen ? 'active' : ''}`}
                            onClick={toggleDropdown}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {/* Profile Image with Fallback */}
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => { e.target.src = fallbackAvatar; }}
                            />

                            <span className="admin-name" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>NCIP Admin</span>
                            <span className="dropdown-arrow" style={{ fontSize: '0.8rem' }}>▼</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="dropdown-content glass-effect" style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                background: 'white',
                                borderRadius: '0.5rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                minWidth: '200px',
                                overflow: 'hidden',
                                zIndex: 50,
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#4b5563', transition: 'background 0.2s' }}>
                                    <span className="icon">🏠</span>
                                    <span>DASHBOARD</span>
                                </Link>
                                <Link to="/admin/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#4b5563', transition: 'background 0.2s' }}>
                                    <span className="icon">⚙️</span>
                                    <span>SETTINGS</span>
                                </Link>
                                <Link to="/admin/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#4b5563', transition: 'background 0.2s' }}>
                                    <span className="icon">👤</span>
                                    <span>PROFILE</span>
                                </Link>
                                <div className="dropdown-divider" style={{ height: '1px', background: '#e5e7eb', margin: '0' }}></div>
                                <button onClick={handleLogout} className="dropdown-item logout-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', textDecoration: 'none', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
                                    <span className="icon">🚪</span>
                                    <span>LOGOUT</span>
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default AdminHeader;
