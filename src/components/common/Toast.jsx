import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation slightly before the toast is removed from DOM by Provider
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 2700); // 3000 total duration - 300ms animation

        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    };

    return (
        <div className={`toast-item toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
            <div className="toast-icon">{getIcon()}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={() => {
                setIsExiting(true);
                setTimeout(onClose, 300);
            }}>×</button>
        </div>
    );
};

export default Toast;
