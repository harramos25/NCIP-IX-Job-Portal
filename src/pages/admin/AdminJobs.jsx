import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';



const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [searchTerm, statusFilter]);

    const fetchJobs = async () => {
        setLoading(true);
        let query = supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }

        if (searchTerm) {
            query = query.ilike('position_title', `%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching jobs:', error);
        else setJobs(data || []);
        setLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Manage Job Postings</h1>
                    <p>View, edit, or create new job opportunities.</p>
                </div>
                <div className="page-header-actions">
                    <Link to="/admin/jobs/create" className="btn btn-primary">
                        <span className="btn-icon">➕</span> Create New Job
                    </Link>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>All Jobs</h2>
                    <div className="section-filters">
                        <div className="inline-form">
                            <input
                                type="text"
                                placeholder="Search position..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="filter-search"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Position Title</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                            ) : jobs.length === 0 ? (
                                <tr><td colSpan="5" className="text-center">No jobs found.</td></tr>
                            ) : (
                                jobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.position_title}</td>
                                        <td>{formatDate(job.deadline)}</td>
                                        <td>
                                            <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/admin/jobs/edit/${job.id}`} className="btn btn-sm btn-secondary" title="Edit">
                                                    ✏️
                                                </Link>
                                                <Link to={`/admin/jobs/${job.id}`} className="btn btn-sm btn-primary" title="View details">
                                                    👁️
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminJobs;
