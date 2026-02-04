import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import DashboardWelcomeCard from '../../components/admin/DashboardWelcomeCard';

// Import Assets
import totalJobIcon from '../../assets/images/total-job-posting.svg';
import openJobIcon from '../../assets/images/open-position.svg';
import totalAppIcon from '../../assets/images/total-application.svg';
import unreadAppIcon from '../../assets/images/unread-applications.svg';

// Initialize Supabase client


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalJobs: 0,
        openJobs: 0,
        totalApplications: 0,
        unreadApplications: 0,
        applicationsThisMonth: 0,
        newApplicationsWeek: 0
    });
    const [mostApplied, setMostApplied] = useState({ position_title: 'N/A', count: 0 });
    const [deadlineAlerts, setDeadlineAlerts] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [appSearch, setAppSearch] = useState('');
    const [appStatusFilter, setAppStatusFilter] = useState('');
    const [jobStatusFilter, setJobStatusFilter] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // 1. Basic Stats
                const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
                const { count: openJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'Open');
                const { count: totalApplications } = await supabase.from('applications').select('*', { count: 'exact', head: true });
                const { count: unreadApplications } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Unread');

                // 2. Weekly/Monthly Stats
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const { count: newApplicationsWeek } = await supabase.from('applications').select('*', { count: 'exact', head: true }).gte('submitted_at', weekAgo.toISOString());

                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                const { count: applicationsThisMonth } = await supabase.from('applications').select('*', { count: 'exact', head: true }).gte('submitted_at', startOfMonth.toISOString());

                setStats({
                    totalJobs: totalJobs || 0,
                    openJobs: openJobs || 0,
                    totalApplications: totalApplications || 0,
                    unreadApplications: unreadApplications || 0,
                    newApplicationsWeek: newApplicationsWeek || 0,
                    applicationsThisMonth: applicationsThisMonth || 0
                });

                // 3. Deadline Alerts (Jobs appearing within 3 days)
                const today = new Date();
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(today.getDate() + 3);

                const { data: alerts } = await supabase
                    .from('jobs')
                    .select('id, position_title, deadline')
                    .eq('status', 'Open')
                    .gte('deadline', today.toISOString().split('T')[0])
                    .lte('deadline', threeDaysFromNow.toISOString().split('T')[0])
                    .order('deadline', { ascending: true });

                setDeadlineAlerts(alerts || []);

                // 4. Most Applied Job (Complex query approximation)
                // Note: Supabase doesn't support complex joins/groups easily on client-side. 
                // We'll fetch all applications and count manually for this demo or use a simpler approach.
                // For performance in real app, use an RPC or edge function.
                const { data: allApps } = await supabase.from('applications').select('job_id');
                if (allApps && allApps.length > 0) {
                    const counts = {};
                    allApps.forEach(app => { counts[app.job_id] = (counts[app.job_id] || 0) + 1; });
                    const sortedJobIds = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                    if (sortedJobIds.length > 0) {
                        const topJobId = sortedJobIds[0][0];
                        const count = sortedJobIds[0][1];
                        const { data: jobData } = await supabase.from('jobs').select('position_title').eq('id', topJobId).single();
                        if (jobData) {
                            setMostApplied({ position_title: jobData.position_title, count });
                        }
                    }
                }

                await fetchRecentApplications();
                await fetchRecentJobs();

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
            // Initial fetch on mount
            useEffect(() => {
                fetchDashboardData();
            }, []);

            // Set up Realtime subscriptions
            useEffect(() => {
                const jobsChannel = supabase
                    .channel('jobs-changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
                        fetchDashboardData();
                        fetchRecentJobs();
                    })
                    .subscribe();

                const applicationsChannel = supabase
                    .channel('applications-changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
                        fetchDashboardData();
                        fetchRecentApplications();
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(jobsChannel);
                    supabase.removeChannel(applicationsChannel);
                };
            }, [appSearch, appStatusFilter, jobStatusFilter]);

            // Separate fetchers for specific filtered lists
            useEffect(() => {
                fetchRecentApplications();
            }, [appSearch, appStatusFilter]);

            useEffect(() => {
                fetchRecentJobs();
            }, [jobStatusFilter]);


            const formatDate = (dateString) => {
                if (!dateString) return '';
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                return new Date(dateString).toLocaleDateString(undefined, options);
            };

            const getDaysLeft = (deadline) => {
                const diffTime = new Date(deadline) - new Date();
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            };

            return (
                <div className="container dashboard-container">
                    <div className="page-header">
                        <div className="page-header-content">
                            <h1>Dashboard</h1>
                            <p>Welcome back, NCIP Admin!</p>
                            <div style={{
                                marginTop: '1.5rem',
                                height: '3px',
                                width: '60px',
                                backgroundColor: '#334EAC',
                                borderRadius: '2px'
                            }}></div>
                        </div>
                    </div>

                    {/* Welcome Summary Card */}
                    <DashboardWelcomeCard
                        newApplicantsCount={stats.newApplicationsWeek}
                        jobsDeadlineCount={deadlineAlerts.length}
                    />

                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="card-content">
                                <div className="stat-info">
                                    <h3>{stats.totalJobs}</h3>
                                    <p>Total Job Postings</p>
                                </div>
                            </div>
                            <div className="icon-watermark">
                                <img src={totalJobIcon} alt="Total Job Posting" />
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="card-content">
                                <div className="stat-info">
                                    <h3>{stats.openJobs}</h3>
                                    <p>Open Positions</p>
                                </div>
                            </div>
                            <div className="icon-watermark">
                                <img src={openJobIcon} alt="Open Positions" />
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="card-content">
                                <div className="stat-info">
                                    <h3>{stats.totalApplications}</h3>
                                    <p>Total Applicants</p>
                                </div>
                            </div>
                            <div className="icon-watermark">
                                <img src={totalAppIcon} alt="Total Applicants" />
                            </div>
                        </div>

                        <div className="stat-card stat-card-highlight">
                            <div className="card-content">
                                <div className="stat-info">
                                    <h3>{stats.unreadApplications}</h3>
                                    <p>Unread Applicants</p>
                                </div>
                            </div>
                            <div className="icon-watermark">
                                <img src={unreadAppIcon} alt="Unread Applicants" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <Link to="/admin/jobs/create" className="btn btn-primary btn-action-primary">
                            <span className="btn-icon">➕</span>
                            <span>Create New Job Posting</span>
                        </Link>
                        <Link to="/admin/applications" className="btn btn-secondary btn-action-secondary">
                            <span>View All Applicants</span>
                        </Link>
                        <Link to="/admin/jobs" className="btn btn-secondary btn-action-secondary">
                            <span>Manage Job Postings</span>
                        </Link>
                    </div>

                    {/* Deadline Alerts */}
                    {deadlineAlerts.length > 0 && (
                        <div className="deadline-alerts">
                            <h3 className="deadline-alerts-title">⚠️ Deadline Alerts</h3>
                            <div className="deadline-alerts-grid">
                                {deadlineAlerts.map(alert => {
                                    const daysLeft = getDaysLeft(alert.deadline);
                                    const alertClass = daysLeft <= 0 ? 'deadline-today' : (daysLeft <= 1 ? 'deadline-urgent' : 'deadline-warning');
                                    const badgeText = daysLeft <= 0 ? 'Deadline Today' : (daysLeft === 1 ? '1 day left' : `${daysLeft} days left`);

                                    return (
                                        <div key={alert.id} className={`deadline-alert-item ${alertClass}`}>
                                            <span className="deadline-alert-job">{alert.position_title}</span>
                                            <span className="deadline-alert-badge">
                                                {badgeText}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Analytics Section */}
                    <div className="dashboard-section analytics-section">
                        <h2>📈 Analytics Overview</h2>
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="analytics-label">Applicants This Month</div>
                                <div className="analytics-value">{stats.applicationsThisMonth}</div>
                                <div className="analytics-change">+{stats.newApplicationsWeek} this week</div>
                            </div>
                            <div className="analytics-card">
                                <div className="analytics-label">Most Applied Position</div>
                                <div className="analytics-value">{mostApplied.position_title}</div>
                                <div className="analytics-change">{mostApplied.count} applicants</div>
                            </div>
                            <div className="analytics-card">
                                <div className="analytics-label">Open Positions</div>
                                <div className="analytics-value">{stats.openJobs}</div>
                                <div className="analytics-change">of {stats.totalJobs} total</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Applications */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>Recent Applicants</h2>
                            <div className="section-filters">
                                <div className="inline-form">
                                    <input
                                        type="text"
                                        placeholder="Search applicants..."
                                        value={appSearch}
                                        onChange={(e) => setAppSearch(e.target.value)}
                                        className="filter-search"
                                    />
                                    <select
                                        value={appStatusFilter}
                                        onChange={(e) => setAppStatusFilter(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Status</option>
                                        <option value="Unread">Unread</option>
                                        <option value="Viewed">Viewed</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Position</th>
                                        <th>Email</th>
                                        <th>Date Submitted</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center">No applicants found</td>
                                        </tr>
                                    ) : (
                                        recentApplications.map(app => (
                                            <tr key={app.id} className={app.status?.toLowerCase()}>
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
                                                    <Link to={`/admin/applications/${app.id}`} className="btn btn-sm btn-primary" title="View Application">
                                                        <span className="btn-icon">👁️</span>
                                                        <span>View</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-right mt-2">
                            <Link to="/admin/applications" className="btn btn-link">View All Applicants →</Link>
                        </div>
                    </div>

                    {/* Recent Job Postings */}
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2>Recent Job Postings</h2>
                            <div className="section-filters">
                                <div className="inline-form">
                                    <select
                                        value={jobStatusFilter}
                                        onChange={(e) => setJobStatusFilter(e.target.value)}
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
                                    {recentJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">No job postings found</td>
                                        </tr>
                                    ) : (
                                        recentJobs.map(job => {
                                            const daysLeft = getDaysLeft(job.deadline);
                                            let deadlineBadge = null;

                                            if (daysLeft <= 3 && daysLeft >= 0) {
                                                const badgeClass = daysLeft <= 0 ? 'deadline-badge-today' : (daysLeft <= 1 ? 'deadline-badge-urgent' : 'deadline-badge-warning');
                                                const badgeText = daysLeft <= 0 ? '⚠️ Today' : (daysLeft === 1 ? '⚠️ 1 day' : `⚠️ ${daysLeft} days`);
                                                deadlineBadge = <span className={`deadline-badge ${badgeClass}`}>{badgeText}</span>;
                                            }

                                            return (
                                                <tr key={job.id}>
                                                    <td>{job.position_title}</td>
                                                    <td>
                                                        {formatDate(job.deadline)}
                                                        {deadlineBadge}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${job.status?.toLowerCase()}`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <Link to={`/admin/jobs/edit/${job.id}`} className="btn btn-sm btn-secondary" title="Edit Job">
                                                                <span className="btn-icon">✏️</span>
                                                                <span>Edit</span>
                                                            </Link>
                                                            <Link to={`/admin/jobs/${job.id}`} className="btn btn-sm btn-primary" title="View Job">
                                                                <span className="btn-icon">👁️</span>
                                                                <span>View</span>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="text-right mt-2">
                            <Link to="/admin/jobs" className="btn btn-link">View All Jobs →</Link>
                        </div>
                    </div>
                </div>
            );
        };

        export default AdminDashboard;
