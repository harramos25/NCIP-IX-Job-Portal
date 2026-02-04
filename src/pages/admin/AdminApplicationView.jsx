import { supabase } from '../../lib/supabase';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';



const AdminApplicationView = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchApplication();
    }, [id]);

    const fetchApplication = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                jobs ( * )
            `)
            .eq('id', id)
            .single();

        if (error) console.error(error);
        else {
            setApplication(data);
            // Auto-mark as Viewed if Unread
            if (data && data.status === 'Unread') {
                updateStatus(data.id, 'Viewed', false);
            }
        }
        setLoading(false);
    };

    const updateStatus = async (appId, newStatus, showMessage = true) => {
        if (showMessage) setStatusUpdating(true);

        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', appId);

        if (!error) {
            setApplication(prev => ({ ...prev, status: newStatus }));
            if (showMessage) showToast(`Application marked as ${newStatus}`, 'success');
        } else {
            console.error(error);
        }

        if (showMessage) setStatusUpdating(false);
    };

    if (loading) return <div className="text-center p-5">Loading application...</div>;
    if (!application) return <div className="text-center p-5">Application not found.</div>;

    return (
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Application Details</h1>
                    <Link to="/admin/applications" className="btn-link">← Back to Applications</Link>
                </div>
                <div className="page-header-actions">
                    <span>Current Status: </span>
                    <span className={`status-badge status-${application.status?.toLowerCase()}`}>{application.status}</span>
                </div>
            </div>

            <div className="glass-card mb-4">
                <div className="card-header">
                    <h2>Applicant Information</h2>
                </div>
                <div className="card-body grid-2-col">
                    <div className="info-group">
                        <label>Full Name</label>
                        <p className="info-value">{application.full_name}</p>
                    </div>
                    <div className="info-group">
                        <label>Email Address</label>
                        <p className="info-value"><a href={`mailto:${application.email}`}>{application.email}</a></p>
                    </div>
                    <div className="info-group">
                        <label>Phone Number</label>
                        <p className="info-value">{application.phone || 'N/A'}</p>
                    </div>
                    <div className="info-group">
                        <label>Address</label>
                        <p className="info-value">{application.address || 'N/A'}</p>
                    </div>
                    <div className="info-group full-width">
                        <label>Applied For</label>
                        <p className="info-value highlighted">{application.jobs?.position_title}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card mb-4">
                <div className="card-header">
                    <h2>Documents</h2>
                </div>
                <div className="card-body">
                    <div className="info-group">
                        <label>Resume / CV</label>
                        {application.resume_url ? (
                            <a href={application.resume_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-2">
                                📄 View Resume
                            </a>
                        ) : (
                            <p className="text-muted">No resume uploaded.</p>
                        )}
                    </div>

                    {/* If you have other document fields, list them here */}
                </div>
            </div>

            <div className="glass-card">
                <div className="card-header">
                    <h2>Actions</h2>
                </div>
                <div className="card-body action-bar">
                    <button
                        onClick={() => updateStatus(application.id, 'Shortlisted')}
                        className="btn btn-success"
                        disabled={statusUpdating}
                    >
                        ✅ Shortlist
                    </button>
                    <button
                        onClick={() => updateStatus(application.id, 'Rejected')}
                        className="btn btn-danger"
                        disabled={statusUpdating}
                    >
                        ❌ Reject
                    </button>
                    <button
                        onClick={() => updateStatus(application.id, 'Archived')}
                        className="btn btn-secondary"
                        disabled={statusUpdating}
                    >
                        📦 Archive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminApplicationView;
