import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';



const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchApplications();
    }, [searchTerm, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        let query = supabase
            .from('applications')
            .select(`
                *,
                jobs ( position_title )
            `)
            .order('submitted_at', { ascending: false });

        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }

        if (searchTerm) {
            query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching applications:', error);
        else setApplications(data || []);
        setLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Manage Applications</h1>
                    <p>Review and manage incoming job applications.</p>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>All Applicants</h2>
                    <div className="section-filters">
                        <div className="inline-form">
                            <input
                                type="text"
                                placeholder="Search applicant..."
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
                                <option value="Unread">Unread</option>
                                <option value="Viewed">Viewed</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Position Applied</th>
                                <th>Email</th>
                                <th>Date Submitted</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                            ) : applications.length === 0 ? (
                                <tr><td colSpan="6" className="text-center">No applications found.</td></tr>
                            ) : (
                                applications.map(app => (
                                    <tr key={app.id}>
                                        <td>{app.full_name}</td>
                                        <td>{app.jobs?.position_title || 'Unknown Job'}</td>
                                        <td>{app.email}</td>
                                        <td>{formatDate(app.submitted_at)}</td>
                                        <td>
                                            <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/admin/applications/${app.id}`} className="btn btn-sm btn-primary">
                                                View Application
                                            </Link>
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

export default AdminApplications;
