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
                                            📍 Zamboanga Peninsula, Region IX
                                        </p>
                                    </div>
                                    <div className="premium-icon-circle" style={{ width: '64px', height: '64px', fontSize: '2rem', background: 'var(--primary-color)', color: 'white', borderRadius: '16px' }}>
                                        💼
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
                                <span className="ats-label-premium">COMPENSATION</span>
                                <span className="ats-value-premium" style={{ fontSize: '1.25rem' }}>{job.salary_grade || 'Fixed Grade'}</span>
                            </div>

                            <div className="premium-sidebar-item" style={{ alignItems: 'center', textAlign: 'center' }}>
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
                                    className="ats-btn ats-btn-primary"
                                    style={{
                                        width: '100%',
                                        height: '56px',
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    Apply for this Role
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
