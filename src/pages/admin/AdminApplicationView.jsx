import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AdminApplicationView = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('documents');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idPicture, setIdPicture] = useState(null);

    useEffect(() => {
        fetchApplicationDetails();
    }, [id]);

    // Realtime subscription for single application & its documents
    useEffect(() => {
        const appChannel = supabase
            .channel(`admin-app-detail-${id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'applications', filter: `id=eq.${id}` },
                () => fetchApplicationDetails()
            )
            .subscribe();

        const docsChannel = supabase
            .channel(`admin-docs-realtime-${id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'application_documents', filter: `application_id=eq.${id}` },
                () => fetchApplicationDetails()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(appChannel);
            supabase.removeChannel(docsChannel);
        };
    }, [id]);

    const fetchApplicationDetails = async () => {
        setLoading(true);
        try {
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

            const { data: docs, error: docsError } = await supabase
                .from('application_documents')
                .select('*')
                .eq('application_id', id);

            if (docsError) throw docsError;
            setDocuments(docs || []);

            // Identify 2x2 Image
            const pic = docs?.find(d => d.document_type === '2x2 ID Picture');
            if (pic) {
                const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(pic.file_path);
                setIdPicture(publicUrl);
            }

            // Auto-mark as Viewed if Unread
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
            const normalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
            const { error } = await supabase
                .from('applications')
                .update({ status: normalizedStatus })
                .eq('id', appId);

            if (error) throw error;

            if (showMessage) {
                showToast(`Application marked as ${normalizedStatus}`, 'success');
                setTimeout(() => navigate('/admin/applications'), 1500);
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

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const performDelete = async () => {
        setIsDeleteModalOpen(false);
        setStatusUpdating(true);
        try {
            // 1. Get associated document paths
            const { data: docs, error: docsError } = await supabase
                .from('application_documents')
                .select('file_path')
                .eq('application_id', id);

            if (docsError) throw docsError;

            // 2. Clear from Storage if they exist
            if (docs && docs.length > 0) {
                const paths = docs.map(d => d.file_path);
                const { error: storageError } = await supabase.storage
                    .from('documents')
                    .remove(paths);

                if (storageError) {
                    console.warn('Storage cleanup warning:', storageError);
                }
            }

            // 3. Delete application
            const { error: deleteError, count } = await supabase
                .from('applications')
                .delete({ count: 'exact' })
                .eq('id', id);

            if (deleteError) throw deleteError;

            if (count === 0) {
                throw new Error('Deletion failed: Record not found or Permission denied by RLS.');
            }

            showToast('Applicant and all data deleted successfully', 'success');
            navigate('/admin/applications');
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete applicant: ' + error.message, 'error');
        } finally {
            setStatusUpdating(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return <div className="admin-view-root text-center py-5"><div className="loader">Loading...</div></div>;
    if (!application) return <div className="admin-view-root text-center py-5"><h2>Record Not Found</h2></div>;

    return (
        <div className="admin-view-root">
            <div className="container">

                {/* Header & Breadcrumbs */}
                <header style={{ marginBottom: '2.5rem' }}>
                    <nav>
                        <Link to="/admin/applications" className="ats-breadcrumb">
                            <span>←</span> Back to List
                        </Link>
                    </nav>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <h1 className="ats-name-header" style={{ margin: 0 }}>{application.full_name}</h1>
                                <span className={`ats-pill ${application.status?.toLowerCase() || 'unread'}`}>
                                    {application.status || 'Unread'}
                                </span>
                            </div>

                            {/* Action Bar (Top Right) */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => updateStatus(application.id, 'Shortlisted')}
                                    className="ats-btn ats-btn-primary"
                                    disabled={statusUpdating}
                                >Shortlist</button>
                                <button
                                    onClick={() => updateStatus(application.id, 'Rejected')}
                                    className="ats-btn ats-btn-outline-red"
                                    disabled={statusUpdating}
                                >Reject</button>
                                <button
                                    onClick={() => updateStatus(application.id, 'Archived')}
                                    className="ats-btn ats-btn-ghost"
                                    disabled={statusUpdating}
                                >Archive</button>
                                <button
                                    onClick={handleDelete}
                                    className="ats-btn ats-btn-outline-red"
                                    style={{ borderStyle: 'dashed', opacity: 0.8 }}
                                    disabled={statusUpdating}
                                    title="Permanently delete all data"
                                >Delete Info</button>
                            </div>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Left Column (Profile) */}
                    <aside className="ats-card">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            {idPicture ? (
                                <img
                                    src={idPicture}
                                    alt="2x2"
                                    style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'rgb(241, 245, 249)', margin: '0px auto 1rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2rem', objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', background: 'rgb(241, 245, 249)',
                                    margin: '0px auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2rem'
                                }}>👤</div>
                            )}
                            <div className="ats-highlight-box">
                                <div className="ats-label">APPLIED POSITION</div>
                                <div className="ats-value" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                    {application.jobs?.position_title}
                                </div>
                            </div>
                        </div>

                        <div className="ats-section-title">Contact Details</div>
                        <div className="ats-detail-list">
                            <div className="ats-detail-item">
                                <div className="ats-icon-circle">✉️</div>
                                <div>
                                    <div className="ats-label">EMAIL ADDRESS</div>
                                    <div className="ats-value">{application.email}</div>
                                </div>
                            </div>
                            <div className="ats-detail-item">
                                <div className="ats-icon-circle">📞</div>
                                <div>
                                    <div className="ats-label">PHONE NUMBER</div>
                                    <div className="ats-value">{application.phone_number || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="ats-detail-item">
                                <div className="ats-icon-circle">📍</div>
                                <div>
                                    <div className="ats-label">RESIDENTIAL ADDRESS</div>
                                    <div className="ats-value">{application.address || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column (Main Content) */}
                    <main className="ats-card" style={{ minHeight: '500px' }}>
                        <div className="ats-tabs-nav">
                            <div
                                className={`ats-tab-link ${activeTab === 'documents' ? 'active' : ''}`}
                                onClick={() => setActiveTab('documents')}
                            >Submitted Documents ({documents.length})</div>
                            <div
                                className={`ats-tab-link ${activeTab === 'notes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notes')}
                            >Internal Notes</div>
                        </div>

                        {activeTab === 'documents' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <div key={doc.id} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '1.5rem' }}>📄</span>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{doc.document_type}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        {doc.file_name?.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Image'} • {formatSize(doc.file_size)}
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={`${supabase.storage.from('documents').getPublicUrl(doc.file_path).data.publicUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ats-btn ats-btn-ghost"
                                                style={{ fontSize: '0.75rem' }}
                                            >DOWNLOAD</a>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                                        <p>No documents found for this application.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
                                <p>Internal notes feature coming soon.</p>
                            </div>
                        )}
                    </main>

                </div>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={performDelete}
                title="Delete Applicant Data"
                message="Are you absolutely sure? This will permanently remove all personal information and uploaded files from the system. This action cannot be undone."
                confirmText="Delete Permanently"
                type="danger"
                isLoading={statusUpdating}
            />
        </div >
    );
};

export default AdminApplicationView;
