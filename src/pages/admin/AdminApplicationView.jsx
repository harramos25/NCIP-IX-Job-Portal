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
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Application Details</h1>
                    <Link to="/admin/applications" className="btn-link">← Back to Applicants</Link>
                </div>
                <div className="page-header-actions">
                    <span style={{ marginRight: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>CURRENT STATUS:</span>
                    <span className={`status-badge status-${application.status?.toLowerCase()}`}>{application.status}</span>
                </div>
            </div>

            <div className="glass-card">
                <div className="card-header">
                    <h2>Applicant Information</h2>
                </div>
                <div className="grid-2-col">
                    <div className="info-group">
                        <label>Full Name</label>
                        <p className="info-value">{application.full_name}</p>
                    </div>
                    <div className="info-group">
                        <label>Email Address</label>
                        <p className="info-value">
                            <a href={`mailto:${application.email}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                                {application.email}
                            </a>
                        </p>
                    </div>
                    <div className="info-group">
                        <label>Phone Number</label>
                        <p className="info-value">{application.phone_number || 'N/A'}</p>
                    </div>
                    <div className="info-group">
                        <label>Address</label>
                        <p className="info-value">{application.address || 'N/A'}</p>
                    </div>
                    <div className="info-group full-width">
                        <label>Applied For</label>
                        <p className="info-value highlighted">{application.jobs?.position_title}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="card-header">
                    <h2>Submitted Documents</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {documents.length > 0 ? (
                        documents.map((doc) => (
                            <div key={doc.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                background: 'rgba(255, 255, 255, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                borderRadius: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                    <div>
                                        <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{doc.document_type}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatSize(doc.file_size)} • PDF Document</div>
                                    </div>
                                </div>
                                <a
                                    href={`${supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm"
                                    style={{ borderRadius: '0.5rem' }}
                                >
                                    View File
                                </a>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.02)', borderRadius: '1rem' }}>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No documents found for this application.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card">
                <div className="card-header">
                    <h2>Application Actions</h2>
                </div>
                <div className="action-bar">
                    <button
                        onClick={() => updateStatus(application.id, 'Shortlisted')}
                        className="btn btn-success"
                        disabled={statusUpdating}
                        style={{ borderRadius: '2rem', padding: '0.75rem 2rem' }}
                    >
                        ✅ Shortlist
                    </button>
                    <button
                        onClick={() => updateStatus(application.id, 'Rejected')}
                        className="btn btn-danger"
                        disabled={statusUpdating}
                        style={{ borderRadius: '2rem', padding: '0.75rem 2rem' }}
                    >
                        ❌ Reject
                    </button>
                    <button
                        onClick={() => updateStatus(application.id, 'Archived')}
                        className="btn btn-secondary"
                        disabled={statusUpdating}
                        style={{ borderRadius: '2rem', padding: '0.75rem 2rem' }}
                    >
                        📦 Archive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminApplicationView;
