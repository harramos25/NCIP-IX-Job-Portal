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
                            <span style={{ marginRight: '8px' }}>✏️</span> Edit Position
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
                            <div className="premium-icon-circle">💰</div>
                            <span className="ats-label-premium">SALARY GRADE</span>
                            <span className="ats-value-premium">{job.salary_grade || 'None Specified'}</span>
                        </div>

                        <div className="premium-sidebar-item">
                            <div className="premium-icon-circle">📅</div>
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
                            <div className="premium-icon-circle">⚡</div>
                            <span className="ats-label-premium">POSTING STATUS</span>
                            <div style={{ marginTop: '0.25rem' }}>
                                <span className={`ats-pill ${job.status?.toLowerCase() === 'open' ? 'active' : 'archived'}`}>
                                    {job.status}
                                </span>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(0,0,0,0.05)',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                                System ID: <code style={{ fontSize: '0.75rem' }}>{id.slice(0, 8)}...</code>
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default AdminJobView;
