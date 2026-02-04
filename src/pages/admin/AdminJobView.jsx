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
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Job Details</h1>
                    <Link to="/admin/jobs" className="btn-link">← Back to Jobs</Link>
                </div>
                <div className="page-header-actions">
                    <Link to={`/admin/jobs/edit/${job.id}`} className="btn btn-primary">
                        ✏️ Edit this Job
                    </Link>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="glass-card detail-card main-details">
                    <div className="detail-section">
                        <span className="detail-label">Position Title</span>
                        <h2 className="detail-value">{job.position_title}</h2>
                    </div>


                    <div className="detail-row">
                        <div className="detail-section">
                            <span className="detail-label">Salary Grade</span>
                            <p className="detail-value">{job.salary_grade || 'N/A'}</p>
                        </div>
                        <div className="detail-section">
                            <span className="detail-label">Deadline</span>
                            <p className="detail-value text-danger">{new Date(job.deadline).toLocaleDateString()}</p>
                        </div>
                        <div className="detail-section">
                            <span className="detail-label">Status</span>
                            <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                                {job.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card detail-card content-details">
                    <div className="detail-section">
                        <span className="detail-label">Job Description</span>
                        <div className="detail-content">{job.job_description}</div>
                    </div>

                    <div className="detail-section mt-4">
                        <span className="detail-label">Qualifications</span>
                        <div className="detail-content">{job.qualifications}</div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                }
                .detail-card {
                    padding: 2rem;
                }
                .detail-section {
                    margin-bottom: 1.5rem;
                }
                .detail-section:last-child {
                    margin-bottom: 0;
                }
                .detail-label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                }
                .detail-value {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin: 0;
                }
                h2.detail-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                }
                .detail-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(0,0,0,0.05);
                }
                .detail-content {
                    white-space: pre-wrap;
                    color: var(--text-primary);
                    line-height: 1.7;
                    background: rgba(255,255,255,0.3);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    border: 1px solid rgba(255,255,255,0.5);
                }
                .mt-4 { margin-top: 2rem; }
            `}} />
        </div>
    );
};

export default AdminJobView;
