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
            // Ensure status casing matches expected values
            const normalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();

            const { error } = await supabase
                .from('applications')
                .update({ status: normalizedStatus })
                .eq('id', appId);

            if (error) throw error;

            if (showMessage) {
                showToast(`Application successfully marked as ${normalizedStatus}`, 'success');
                // Brief delay before redirecting to let the user see the success
                setTimeout(() => {
                    navigate('/admin/applications');
                }, 1500);
            } else {
                setApplication(prev => ({ ...prev, status: normalizedStatus }));
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
    if (!application) return (
        <div className="container py-5 text-center">
            <h2 className="premium-title">Not Found</h2>
            <p className="premium-subtitle">The application record could not be located.</p>
            <Link to="/admin/applications" className="btn btn-primary mt-4" style={{ borderRadius: '1rem' }}>Back to Applicants</Link>
        </div>
    );

    return (
        <div className="admin-view-root">
            {/* Premium Background Decorations */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>
            <div className="bg-glow glow-3"></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                {/* Header Section */}
                <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Link to="/admin/applications" style={{
                                background: 'rgba(255,255,255,0.5)',
                                padding: '0.6rem 1.25rem',
                                borderRadius: '1rem',
                                fontSize: '0.8rem',
                                color: 'var(--primary-dark)',
                                textDecoration: 'none',
                                fontWeight: '700',
                                border: '1px solid rgba(255,255,255,0.7)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>← BACK TO APPLICANTS</Link>
                        </div>
                        <h1 className="premium-title">
                            Application <span style={{ color: 'var(--primary-color)' }}>Review</span>
                        </h1>
                        <p className="premium-subtitle">Evaluating candidate submission for the role of <strong>{application.jobs?.position_title}</strong></p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary-color)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>CURRENT STATUS</div>
                        <div className={`status-badge status-${application.status?.toLowerCase()}`} style={{
                            fontSize: '1.25rem',
                            padding: '1rem 2rem',
                            borderRadius: '1.5rem',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                            border: '2px solid white'
                        }}>
                            {application.status?.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Main Premium Layout */}
                <div className="premium-layout">

                    {/* Left Column: Profile */}
                    <div className="glass-card-v3">
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2.5rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.75rem' }}>👤</span> Candidate Profile
                        </h2>

                        <div className="info-pill">
                            <label>FULL LEGAL NAME</label>
                            <div className="value">{application.full_name}</div>
                        </div>

                        <div className="info-pill">
                            <label>CONTACT EMAIL</label>
                            <div className="value">
                                <a href={`mailto:${application.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{application.email}</a>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="info-pill">
                                <label>PHONE</label>
                                <div className="value">{application.phone_number || 'N/A'}</div>
                            </div>
                            <div className="info-pill">
                                <label>SUBMITTED ON</label>
                                <div className="value">{new Date(application.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="info-pill">
                            <label>RESIDENTIAL ADDRESS</label>
                            <div className="value">{application.address || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Right Column: Documents & Actions */}
                    <div>
                        <div className="glass-card-v3" style={{ padding: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>📂</span> Documents
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <div key={doc.id} className="doc-link-card">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontSize: '1.5rem' }}>📄</div>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{doc.document_type}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>PDF • {formatSize(doc.file_size)}</div>
                                                </div>
                                            </div>
                                            <a
                                                href={`${supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.75rem',
                                                    background: 'var(--primary-bg)',
                                                    color: 'var(--primary-dark)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700'
                                                }}
                                            >VIEW</a>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>
                                        No documents attached.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="glass-card-v3" style={{ padding: '2rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-dark)', margin: 0 }}>ADMINISTRATIVE ACTIONS</h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.25rem' }}>Direct status updates for this candidate</p>
                            </div>

                            <div className="action-bar-horizontal">
                                <button
                                    onClick={() => updateStatus(application.id, 'Shortlisted')}
                                    className="btn-premium shortlist"
                                    disabled={statusUpdating}
                                    title="Shortlist Candidate"
                                >
                                    <span>✅</span> SHORTLIST
                                </button>
                                <button
                                    onClick={() => updateStatus(application.id, 'Rejected')}
                                    className="btn-premium reject"
                                    disabled={statusUpdating}
                                    title="Reject Application"
                                >
                                    <span>❌</span> REJECT
                                </button>
                                <button
                                    onClick={() => updateStatus(application.id, 'Archived')}
                                    className="btn-premium archive"
                                    disabled={statusUpdating}
                                    title="Archive Record"
                                >
                                    <span>📦</span> ARCHIVE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminApplicationView;
