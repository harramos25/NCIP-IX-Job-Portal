import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const AdminApplicationView = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchApplicationDetails();
    }, [id]);

    const fetchApplicationDetails = async () => {
        setLoading(true);
        try {
            // 1. Fetch Application & Job
            const { data: app, error: appError } = await supabase
                .from('applications')
                .select(`
                    *,
                    jobs ( * )
                `)
                .eq('id', id)
                .single();

            if (appError) throw appError;
            setApplication(app);

            // 2. Fetch Associated Documents
            const { data: docs, error: docsError } = await supabase
                .from('application_documents')
                .select('*')
                .eq('application_id', id);

            if (docsError) throw docsError;
            setDocuments(docs || []);

            // 3. Auto-mark as Viewed if Unread
            if (app.status === 'Unread') {
                await updateStatus(app.id, 'Viewed', false);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            showToast('Failed to load application details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appId, newStatus, showMessage = true) => {
        if (showMessage) setStatusUpdating(true);

        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', appId);

            if (error) throw error;

            if (showMessage) {
                showToast(`Application successfully marking as ${newStatus}`, 'success');
                // Redirect back to applicants list after action
                setTimeout(() => {
                    navigate('/admin/applications');
                }, 1500);
            } else {
                setApplication(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Update error:', error);
            if (showMessage) showToast('Failed to update status', 'error');
        } finally {
            if (showMessage) setStatusUpdating(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return <div className="container py-5 text-center"><div className="loader">Loading application details...</div></div>;
    if (!application) return <div className="container py-5 text-center"><h2>Application not found</h2><Link to="/admin/applications" className="btn btn-primary mt-3">Back to List</Link></div>;

    return (
        <div className="admin-view-root">
            {/* Background Decorations */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="page-header" style={{ marginBottom: '3rem' }}>
                    <div className="page-header-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Link to="/admin/applications" className="btn-link" style={{
                                background: 'rgba(255,255,255,0.4)',
                                padding: '0.5rem 1rem',
                                borderRadius: '1rem',
                                fontSize: '0.85rem',
                                color: 'var(--primary-dark)',
                                textDecoration: 'none'
                            }}>← BACK TO LIST</Link>
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary-dark)', letterSpacing: '-0.02em', margin: 0 }}>
                            Application <span style={{ color: 'var(--primary-color)' }}>Details</span>
                        </h1>
                    </div>
                    <div className="page-header-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-color)', letterSpacing: '0.1em' }}>STATUS</span>
                        <span className={`status-badge status-${application.status?.toLowerCase()}`} style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem', borderRadius: '1rem' }}>
                            {application.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header-v2">
                        <h2><span>👤</span> Applicant Profile</h2>
                    </div>
                    <div className="grid-detailed">
                        <div className="info-box">
                            <label>Full Name</label>
                            <div className="val">{application.full_name}</div>
                        </div>
                        <div className="info-box">
                            <label>Email Address</label>
                            <div className="val">
                                <a href={`mailto:${application.email}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                                    {application.email}
                                </a>
                            </div>
                        </div>
                        <div className="info-box">
                            <label>Phone Number</label>
                            <div className="val">{application.phone_number || 'N/A'}</div>
                        </div>
                        <div className="info-box">
                            <label>Permanent Address</label>
                            <div className="val">{application.address || 'N/A'}</div>
                        </div>
                        <div className="info-box" style={{ gridColumn: '1 / -1', background: 'rgba(51, 78, 172, 0.05)', borderColor: 'rgba(51, 78, 172, 0.1)' }}>
                            <label>Applied For Position</label>
                            <div className="val" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-dark)' }}>
                                {application.jobs?.position_title}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card">
                    <div className="card-header-v2">
                        <h2><span>📄</span> Submitted Documents</h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{documents.length} Files Attached</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <div key={doc.id} className="doc-pill">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '1rem',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                                        }}>📂</div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--primary-dark)', fontSize: '1.05rem' }}>{doc.document_type}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                {formatSize(doc.file_size)} • PDF DOCUMENT
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={`${supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ borderRadius: '1rem', padding: '0.6rem 1.5rem', fontWeight: '600' }}
                                    >
                                        VIEW DOCUMENT
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(0,0,0,0.02)', borderRadius: '2rem', border: '2px dashed rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📁</div>
                                <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No documents found for this application.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
                    <div className="card-header-v2">
                        <h2><span>⚡</span> Administrative Actions</h2>
                    </div>
                    <div className="action-bar" style={{ gap: '1.5rem' }}>
                        <button
                            onClick={() => updateStatus(application.id, 'Shortlisted')}
                            className="btn btn-success btn-action-p"
                            disabled={statusUpdating}
                            style={{ background: '#10b981', color: 'white', border: 'none' }}
                        >
                            <span>✅</span> SHORTLIST CANDIDATE
                        </button>
                        <button
                            onClick={() => updateStatus(application.id, 'Rejected')}
                            className="btn btn-danger btn-action-p"
                            disabled={statusUpdating}
                            style={{ background: '#ef4444', color: 'white', border: 'none' }}
                        >
                            <span>❌</span> REJECT APPLICATION
                        </button>
                        <button
                            onClick={() => updateStatus(application.id, 'Archived')}
                            className="btn btn-secondary btn-action-p"
                            disabled={statusUpdating}
                            style={{ background: '#64748b', color: 'white', border: 'none' }}
                        >
                            <span>📦</span> ARCHIVE RECORD
                        </button>
                    </div>
                    <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        * Taking an action will automatically save the status and return you to the applicants list.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminApplicationView;
