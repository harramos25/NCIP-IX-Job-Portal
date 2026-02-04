import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const AdminJobView = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error(error);
                showToast('Error fetching job details.', 'error');
            } else {
                setJob(data);
            }
            setLoading(false);
        };
        fetchJob();
    }, [id]);

    if (loading) return <div className="text-center p-5">Loading job details...</div>;
    if (!job) return <div className="text-center p-5">Job not found.</div>;

    return (
        <div className="admin-view-root">
            <div className="container">
                {/* Header Section */}
                <header style={{ marginBottom: '2.5rem' }}>
                    <nav>
                        <Link to="/admin/jobs" className="ats-breadcrumb">
                            <span>←</span> Back to Jobs
                        </Link>
                    </nav>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="ats-name-header" style={{ marginBottom: '0.25rem' }}>Job Details</h1>
                            <p style={{ color: '#64748B', margin: 0 }}>Review and manage this position's information</p>
                        </div>
                        <Link to={`/admin/jobs/edit/${job.id}`} className="ats-btn ats-btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit Position
                        </Link>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                    {/* Main Content (Left) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section className="glass-card-premium">
                            <div style={{ marginBottom: '2.5rem' }}>
                                <span className="ats-label-premium">POSITION TITLE</span>
                                <h1 style={{
                                    fontSize: '2.25rem',
                                    fontWeight: '800',
                                    color: 'var(--primary-dark)',
                                    letterSpacing: '-0.03em',
                                    margin: '0.5rem 0'
                                }}>
                                    {job.position_title}
                                </h1>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div className="ats-section-container">
                                    <h3 className="ats-section-title">Job Description</h3>
                                    <div style={{
                                        lineHeight: '1.8',
                                        color: '#334155',
                                        fontSize: '1.05rem',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {job.job_description}
                                    </div>
                                </div>

                                <div className="ats-section-container">
                                    <h3 className="ats-section-title">Qualifications</h3>
                                    <div style={{
                                        lineHeight: '1.8',
                                        color: '#334155',
                                        fontSize: '1.05rem',
                                        whiteSpace: 'pre-wrap',
                                        padding: '1.5rem',
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        {job.qualifications}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar (Right) */}
                    <aside className="glass-card-premium" style={{ padding: '1.75rem' }}>
                        <h3 className="ats-section-title" style={{ marginBottom: '1.5rem' }}>Position Info</h3>

                        <div className="premium-sidebar-item">
                            <div className="premium-icon-circle" style={{ color: '#2563EB' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                    <circle cx="12" cy="12" r="2"></circle>
                                    <path d="M6 12h.01M18 12h.01"></path>
                                </svg>
                            </div>
                            <span className="ats-label-premium">SALARY GRADE</span>
                            <span className="ats-value-premium">{job.salary_grade || 'None Specified'}</span>
                        </div>

                        <div className="premium-sidebar-item">
                            <div className="premium-icon-circle" style={{ color: '#EF4444' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <span className="ats-label-premium">DEADLINE</span>
                            <span className="ats-value-premium" style={{ color: '#EF4444' }}>
                                {new Date(job.deadline).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>

                        <div className="premium-sidebar-item">
                            <div className="premium-icon-circle" style={{ color: '#10B981' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                            </div>
                            <span className="ats-label-premium">POSTING STATUS</span>
                            <div style={{ marginTop: '0.25rem' }}>
                                <span className={`ats-pill ${job.status?.toLowerCase() === 'open' ? 'active' : 'archived'}`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>

                    </aside>
                </div>
            </div>
        </div>
    );
};

export default AdminJobView;
