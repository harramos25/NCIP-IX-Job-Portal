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
        <div className="container">
            <div className="breadcrumb">
                <Link to="/">← Back to Job Listings</Link>
            </div>

            <div className="job-details-card">
                <div className="job-header">
                    <h1>{job.position_title}</h1>
                    <div className="job-meta-info">
                        {job.salary_grade && (
                            <span className="job-salary">Salary: <strong>{job.salary_grade}</strong></span>
                        )}
                    </div>
                </div>

                <div className="job-section">
                    <h2>Job Description</h2>
                    <div className="job-content" style={{ whiteSpace: 'pre-wrap' }}>
                        {job.job_description}
                    </div>
                </div>

                <div className="job-section">
                    <h2>Qualifications</h2>
                    <div className="job-content" style={{ whiteSpace: 'pre-wrap' }}>
                        {job.qualifications}
                    </div>
                </div>


                <div className="job-deadline-box">
                    <strong>Application Deadline:</strong> {formatDate(job.deadline)}
                </div>

                <div className="apply-section">
                    <Link to={`/job/${job.id}/apply`} className="btn btn-primary btn-large">Apply Now</Link>
                </div>
            </div>
        </div>
    );
}
