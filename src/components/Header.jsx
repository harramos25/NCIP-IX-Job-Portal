import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/ncip-logo.png';

export default function Header() {
    const [isNavOpen, setIsNavOpen] = useState(false);

    useEffect(() => {
        document.title = "NCIP IX Job Portal";
    }, []);

    return (
        <header className="public-header">
            <div className="header-content">
                <div className="logo-container">
                    <img
                        src={logo}
                        alt="NCIP Logo"
                        className="header-logo"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <h1>NCIP IX JOB PORTAL</h1>
                </div>
                <button
                    className="menu-toggle"
                    aria-label="Toggle navigation"
                    aria-expanded={isNavOpen}
                    onClick={() => setIsNavOpen(!isNavOpen)}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        {isNavOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                            <>
                                <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </>
                        )}
                    </svg>
                </button>
                <nav className={isNavOpen ? 'nav-open' : ''}>
                    <Link to="/">Job Vacancies</Link>
                    <Link to="/about">About NCIP</Link>
                    <Link to="/admin">Admin Login</Link>
                </nav>
            </div>
        </header>
    );
}
