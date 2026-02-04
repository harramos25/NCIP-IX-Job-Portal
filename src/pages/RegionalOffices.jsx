import React from 'react';

const RegionalOffices = () => {
    const offices = [
        {
            province: 'Zamboanga del Sur',
            location: 'Pagadian City', // Implicit from request context or can be generic
            officer: 'Provincial Officer Name',
            email: 'zambosur@ncip.gov.ph'
        },
        {
            province: 'Zamboanga del Norte',
            location: 'Dipolog City',
            officer: 'Provincial Officer Name',
            email: 'zambonorte@ncip.gov.ph'
        },
        {
            province: 'Zamboanga Sibugay',
            location: 'Ipil',
            officer: 'Provincial Officer Name',
            email: 'zambosibugay@ncip.gov.ph'
        }
    ];

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '3rem',
                color: '#111827',
                fontSize: '2rem',
                fontWeight: '700'
            }}>Region IX Directory</h2>

            <div className="offices-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {offices.map((office, index) => (
                    <div key={index} className="office-card" style={{
                        backgroundColor: 'white',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e5e7eb',
                        transition: 'transform 0.2s ease',
                        cursor: 'default'
                    }}>
                        {/* Card Header / Title */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb'
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#1f2937'
                            }}>{office.province}</h3>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginBottom: '0.25rem',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                }}>Location</p>
                                <p style={{ color: '#111827', fontWeight: '500' }}>{office.location}</p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginBottom: '0.25rem',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                }}>Provincial Officer</p>
                                <p style={{ color: '#111827', fontWeight: '500' }}>{office.officer}</p>
                            </div>

                            <div>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginBottom: '0.25rem',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                }}>Email</p>
                                <a href={`mailto:${office.email}`} style={{
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                    fontWeight: '500'
                                }}>{office.email}</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Responsive adjustments using style tag */}
            <style>{`
                .office-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                }
            `}</style>
        </div>
    );
};

export default RegionalOffices;
