import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="public-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Contact Information</h3>
                    <p><strong>Hotline:</strong> (062) 215 4411</p>
                    <p><strong>Email:</strong> region9@ncip.gov.ph</p>
                    <p><strong>Address:</strong> Raiza Building, Rizal Street, Lumbia District Pagadian City, Zamboanga del Sur</p>
                </div>
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul className="footer-links">
                        <li><a href="https://www.ncip.gov.ph" target="_blank" rel="noopener noreferrer">About NCIP</a></li>
                        <li><Link to="/">Job Vacancies</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Follow Us</h3>
                    <div className="social-links">
                        <a href="https://www.facebook.com/NCIPRegion9/" target="_blank" aria-label="Facebook" className="social-link" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} National Commission on Indigenous Peoples (NCIP). All rights reserved.</p>
            </div>
        </footer>
    );
}
