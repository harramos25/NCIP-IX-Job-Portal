import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, [searchTerm, statusFilter]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('admin-apps-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'applications' },
                () => {
                    fetchApplications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        setDebugInfo(null);
        try {
            // 1. Try with joined jobs and submitted_at (most likely correct schema)
            let query = supabase
                .from('applications')
                .select(`
                    *,
                    jobs ( position_title )
                `)
                .order('submitted_at', { ascending: false });

            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            if (searchTerm) {
                query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Core Query Fail (Join/submitted_at):', error);

                // 2. Fallback: try without join
                const { data: fb1, error: er1 } = await supabase
                    .from('applications')
                    .select('*')
                    .order('submitted_at', { ascending: false });

                if (er1) {
                    console.error('Fallback 1 Fail (submitted_at):', er1);

                    // 3. Last stand: try created_at without join
                    const { data: fb2, error: er2 } = await supabase
                        .from('applications')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (er2) {
                        setDebugInfo(`SQL Error: ${er2.message}`);
                        throw er2;
                    }
                    setApplications(fb2 || []);
                } else {
                    setApplications(fb1 || []);
                }
            } else {
                setApplications(data || []);
            }
        } catch (error) {
            console.error('Comprehensive Fetch Fail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString, altDate) => {
        const d = dateString || altDate;
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="admin-view-root">
            <div className="container">

                {/* Header Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h1 className="ats-name-header" style={{ margin: 0 }}>Applicant <span style={{ color: 'var(--primary-color)' }}>Management</span></h1>
                                <div className="live-indicator-pill" title="Real-time syncing active">
                                    <span className="live-pulse"></span>
                                    LIVE SYNC
                                </div>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500', marginTop: '0.25rem' }}>
                                Browse and process candidate applications matching your criteria.
                            </p>
                        </div>
                        {debugInfo && (
                            <div style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.75rem' }}>
                                {debugInfo}
                            </div>
                        )}
                    </div>
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
                                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Submitted</th>
                                    <th style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Syncing applications...</td></tr>
                                ) : applications.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No applications found.</td></tr>
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
                                                <div style={{ fontWeight: '500', color: '#475569', fontSize: '0.9rem' }}>{app.jobs?.position_title || 'Application File'}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatDate(app.submitted_at, app.created_at)}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem' }}>
                                                <span className={`ats-pill ${app.status?.toLowerCase() || 'unread'}`}>
                                                    {app.status || 'Unread'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                <Link
                                                    to={`/admin/applications/${app.id}`}
                                                    className="btn btn-sm btn-primary"
                                                    title="View Profile"
                                                >
                                                    <span className="btn-icon">👁️</span>
                                                    <span>View</span>
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
