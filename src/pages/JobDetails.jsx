import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function JobDetails() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setJob(data);
            } catch (error) {
                console.error('Error fetching job:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    if (loading) return <div className="container py-5 text-center">Loading...</div>;
    if (!job) return <div className="container py-5 text-center">Job not found</div>;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="job-portal-root">
            <div className="container">
                {/* Breadcrumb & Navigation */}
                <nav style={{ marginBottom: '2rem' }}>
                    <Link to="/" className="ats-breadcrumb">
                        <span>←</span> Back to Vacancies
                    </Link>
                </nav>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                    {/* Job Main Content (Left) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <section className="glass-card-premium">
                            <header style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <span className="ats-pill active" style={{ marginBottom: '1rem', display: 'inline-block', fontSize: '0.75rem' }}>
                                            Now Hiring
                                        </span>
                                        <h1 style={{
                                            fontSize: '2.75rem',
                                            fontWeight: '900',
                                            color: '#0F172A',
                                            letterSpacing: '-0.04em',
                                            lineHeight: '1.1',
                                            margin: '0.5rem 0'
                                        }}>
                                            {job.position_title}
                                        </h1>
                                        <p style={{ fontSize: '1.125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            Zamboanga Peninsula, Region IX
                                        </p>
                                    </div>
                                    <div className="premium-icon-circle" style={{ width: '64px', height: '64px', background: 'var(--primary-color)', color: 'white', borderRadius: '16px', boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.25)' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                        </svg>
                                    </div>
                                </div>
                            </header>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                <div className="ats-section-container">
                                    <h3 className="ats-section-title">Job Description</h3>
                                    <div style={{
                                        lineHeight: '1.8',
                                        color: '#334155',
                                        fontSize: '1.1rem',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {job.job_description}
                                    </div>
                                </div>

                                <div className="ats-section-container">
                                    <h3 className="ats-section-title">Key Qualifications</h3>
                                    <div style={{
                                        lineHeight: '1.8',
                                        color: '#334155',
                                        fontSize: '1.1rem',
                                        whiteSpace: 'pre-wrap',
                                        padding: '1.75rem',
                                        background: 'rgba(255, 255, 255, 0.4)',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}>
                                        {job.qualifications}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Action Sidebar (Right) */}
                    <aside style={{ position: 'sticky', top: '2rem' }}>
                        <div className="glass-card-premium" style={{ padding: '2rem', textAlign: 'center' }}>
                            <h3 className="ats-section-title" style={{ marginBottom: '1.75rem', textAlign: 'center' }}>Application Info</h3>

                            <div className="premium-sidebar-item" style={{ alignItems: 'center', textAlign: 'center' }}>
                                <div className="premium-icon-circle" style={{ color: '#2563EB', marginBottom: '0.75rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                        <circle cx="12" cy="12" r="2"></circle>
                                        <path d="M6 12h.01M18 12h.01"></path>
                                    </svg>
                                </div>
                                <span className="ats-label-premium">COMPENSATION</span>
                                <span className="ats-value-premium" style={{ fontSize: '1.25rem' }}>{job.salary_grade || 'Fixed Grade'}</span>
                            </div>

                            <div className="premium-sidebar-item" style={{ alignItems: 'center', textAlign: 'center' }}>
                                <div className="premium-icon-circle" style={{ color: '#EF4444', marginBottom: '0.75rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                                <span className="ats-label-premium">SUBMISSION DEADLINE</span>
                                <span className="ats-value-premium" style={{ color: '#EF4444', fontSize: '1.1rem' }}>
                                    {new Date(job.deadline).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <Link
                                    to={`/job/${job.id}/apply`}
                                    className="btn btn-primary btn-large"
                                    style={{
                                        width: '100%',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <span className="btn-icon">🚀</span>
                                    <span>Apply for this Role</span>
                                </Link>
                                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '1.25rem' }}>
                                    Quick apply process. Ensure documents are ready.
                                </p>
                            </div>
                        </div>

                        {/* Why Join Us Card */}
                        <div className="glass-card-premium" style={{ padding: '1.5rem', marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Why join NCIP?</h4>
                            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                                Be part of a mission-driven team dedicated to protecting and promoting the rights of Indigenous Peoples in Region IX.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
