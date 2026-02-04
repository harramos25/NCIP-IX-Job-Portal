import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [searchTerm, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('applications')
                .select(`
                    *,
                    jobs ( position_title )
                `)
                .order('created_at', { ascending: false }); // Usually created_at is safer in Supabase

            if (statusFilter) {
                // Ensure the status filter value matches what we store (PascalCase)
                query = query.eq('status', statusFilter);
            }

            if (searchTerm) {
                query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;
            if (error) {
                console.error('Fetch error:', error);
                throw error;
            }
            setApplications(data || []);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const StatusBadge = ({ status }) => {
        const s = status || 'Unread';
        return (
            <span className={`status-badge status-${s.toLowerCase()}`} style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                {s.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="admin-view-root">
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="premium-title">Applicant <span style={{ color: 'var(--primary-color)' }}>Management</span></h1>
                    <p className="premium-subtitle">View and process candidate applications matching your current criteria.</p>
                </div>

                <div className="glass-card-v3" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.5rem',
                                        borderRadius: '1.25rem',
                                        border: '1px solid rgba(255,255,255,0.5)',
                                        background: 'rgba(255,255,255,0.4)',
                                        backdropFilter: 'blur(5px)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        color: 'var(--primary-dark)',
                                        fontWeight: '500'
                                    }}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderRadius: '1.25rem',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    background: 'rgba(255,255,255,0.4)',
                                    backdropFilter: 'blur(5px)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    color: 'var(--primary-dark)',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">ALL STATUS</option>
                                <option value="Unread">UNREAD</option>
                                <option value="Viewed">VIEWED</option>
                                <option value="Shortlisted">SHORTLISTED</option>
                                <option value="Rejected">REJECTED</option>
                                <option value="Archived">ARCHIVED</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>
                                    <th style={{ padding: '1rem' }}>CANDIDATE</th>
                                    <th style={{ padding: '1rem' }}>POSITION</th>
                                    <th style={{ padding: '1rem' }}>SUBMITTED</th>
                                    <th style={{ padding: '1rem' }}>STATUS</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Syncing applications...</td></tr>
                                ) : applications.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No matching candidates found.</td></tr>
                                ) : (
                                    applications.map(app => (
                                        <tr key={app.id} style={{
                                            background: 'rgba(255,255,255,0.45)',
                                            borderRadius: '1.5rem',
                                            transition: 'transform 0.2s ease',
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.005)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <td style={{ padding: '1.25rem', borderRadius: '1.5rem 0 0 1.5rem' }}>
                                                <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{app.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{app.email}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{app.jobs?.position_title || 'N/A'}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{formatDate(app.created_at)}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right', borderRadius: '0 1.5rem 1.5rem 0' }}>
                                                <Link
                                                    to={`/admin/applications/${app.id}`}
                                                    style={{
                                                        background: 'var(--primary-color)',
                                                        color: 'white',
                                                        padding: '0.6rem 1.25rem',
                                                        borderRadius: '1rem',
                                                        textDecoration: 'none',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '700',
                                                        display: 'inline-block',
                                                        boxShadow: '0 4px 10px rgba(51, 78, 172, 0.2)'
                                                    }}
                                                >
                                                    REVIEW FILE
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminApplications;
