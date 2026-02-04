import React from 'react';
import { Link } from 'react-router-dom';

export default function JobCard({ job, index }) {
    // Format date similar to PHP's formatDate function (assuming d M, Y format or similar)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Truncate description
    const truncate = (str, n) => {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    };

    return (
        <div className="job-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="job-card-header">
                <div className="job-title-wrapper">
                    <span className="job-icon">💼</span>
                    <h3>{job.position_title}</h3>
                </div>
            </div>
            <div className="job-card-body">
                <p className="job-description">
                    {truncate(job.job_description, 150)}
                </p>
                <div className="job-meta">
                    <span className="job-deadline">
                        <span className="deadline-icon">📅</span>
                        <span className="deadline-label">Deadline: </span>
                        <span className="deadline-date">{formatDate(job.deadline)}</span>
                    </span>
                </div>
            </div>
            <div className="job-card-footer">
                <Link to={`/job/${job.id}`} className="btn btn-primary btn-block">View Details</Link>
            </div>
        </div>
    );
}
