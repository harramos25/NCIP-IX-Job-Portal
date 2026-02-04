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
                `);

            // Standardizing on created_at for reliable sorting
            query = query.order('created_at', { ascending: false });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            if (searchTerm) {
                query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase Query Error:', error);
                // Fallback without join
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('applications')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (fallbackError) throw fallbackError;
                setApplications(fallbackData || []);
            } else {
                setApplications(data || []);
            }
        } catch (error) {
            console.error('Fetch Error:', error);
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

    return (
        <div className="admin-view-root">
            <div className="container">

                {/* Header Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h1 className="ats-name-header">Applicant <span style={{ color: 'var(--primary-color)' }}>Management</span></h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
                        Browse and process candidate applications with the refined ATS workflow.
                    </p>
                </div>

                {/* Filter & Search Bar */}
                <div className="ats-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    background: '#F8FAFC'
                                }}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#475569',
                                cursor: 'pointer',
                                background: '#F8FAFC'
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

                {/* Applications Table */}
                <div className="ats-card" style={{ padding: '0' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #F1F5F9' }}>
                                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Applied</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Syncing applications...</td></tr>
                                ) : applications.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No applications matching your search.</td></tr>
                                ) : (
                                    applications.map(app => (
                                        <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{app.full_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.email}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontWeight: '500', color: '#475569', fontSize: '0.9rem' }}>{app.jobs?.position_title || 'N/A'}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatDate(app.created_at)}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span className={`ats-pill ${app.status?.toLowerCase() || 'unread'}`}>
                                                    {app.status || 'Unread'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                <Link
                                                    to={`/admin/applications/${app.id}`}
                                                    className="ats-btn ats-btn-ghost"
                                                    style={{ fontSize: '0.75rem', fontWeight: '700' }}
                                                >
                                                    VIEW PROFILE
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
