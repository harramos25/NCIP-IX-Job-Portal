import React from 'react';

// Using inline SVGs to match Lucide/Heroicons style since we cannot install new packages automatically.
// These are styled to match the requested design: Blue stroke, clean outline.

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563EB' }}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563EB' }}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const AlertTriangleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563EB' }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const DashboardWelcomeCard = ({ newApplicantsCount = 0, jobsDeadlineCount = 0 }) => {

    // Helper to format date dynamically
    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '100%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Subtle shadow
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Row 1: Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CalendarIcon />
                    <span style={{
                        color: '#334155', // slate-700 equivalent
                        fontWeight: '600', // slightly bold
                        fontSize: '1rem'
                    }}>
                        {getCurrentDate()}
                    </span>
                </div>

                {/* Row 2: New Applicants */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TrendingUpIcon />
                    <span style={{
                        color: '#334155',
                        fontSize: '1rem'
                    }}>
                        <strong>{newApplicantsCount}</strong> New Applicants This Week
                    </span>
                </div>

                {/* Row 3: Deadline Alert */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertTriangleIcon />
                    <span style={{
                        color: '#334155',
                        fontSize: '1rem'
                    }}>
                        <strong>{jobsDeadlineCount}</strong> Jobs Approaching Deadline
                    </span>
                </div>

            </div>
        </div>
    );
};

export default DashboardWelcomeCard;
