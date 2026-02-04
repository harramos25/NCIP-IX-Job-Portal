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
                        <polygon
                            points="7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7"
                            fill="#F7F2EB"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        ></polygon>
                        <line className="menu-line" x1="7" y1="9" x2="17" y2="9"></line>
                        <line className="menu-line" x1="7" y1="12" x2="17" y2="12"></line>
                        <line className="menu-line" x1="7" y1="15" x2="17" y2="15"></line>
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
