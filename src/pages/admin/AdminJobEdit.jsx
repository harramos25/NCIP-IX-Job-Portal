import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';



const AdminJobEdit = () => {
    const { showToast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Separate state for handling date string format
    const [formData, setFormData] = useState({
        position_title: '',
        job_description: '',
        salary_grade: '',
        qualifications: '',
        deadline: '',
        facebook_name: '',
        status: 'Open'
    });

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
                navigate('/admin/jobs');
            } else {
                setFormData(data);
            }
            setLoading(false);
        };
        fetchJob();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const { error } = await supabase
            .from('jobs')
            .update(formData)
            .eq('id', id);

        if (error) {
            showToast('Error updating job: ' + error.message, 'error');
        } else {
            showToast('Job updated successfully!', 'success');
            navigate('/admin/jobs');
        }
        setSaving(false);
    };

    if (loading) return <div className="text-center p-5">Loading job details...</div>;

    return (
        <div className="admin-page-background">
            <div className="container dashboard-container">
                <div className="page-header">
                    <div className="page-header-content">
                        <h1>Edit Job</h1>
                        <Link to="/admin/jobs" className="btn-link">← Back to Jobs</Link>
                    </div>
                </div>

                <div className="glass-card form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Position Title</label>
                            <input type="text" name="position_title" required value={formData.position_title} onChange={handleChange} className="form-input" />
                        </div>

                        <div className="form-group">
                            <label>Facebook Account Name (Optional)</label>
                            <input type="text" name="facebook_name" value={formData.facebook_name || ''} onChange={handleChange} className="form-input" placeholder="e.g. NCIP Region IX" />
                        </div>


                        <div className="form-row">
                            <div className="form-group">
                                <label>Salary Grade</label>
                                <input type="text" name="salary_grade" value={formData.salary_grade} onChange={handleChange} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label>Deadline</label>
                                <input type="date" name="deadline" required value={formData.deadline} onChange={handleChange} className="form-input" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Job Description</label>
                            <textarea name="job_description" rows="5" required value={formData.job_description} onChange={handleChange} className="form-textarea"></textarea>
                        </div>

                        <div className="form-group">
                            <label>Qualifications</label>
                            <textarea name="qualifications" rows="4" required value={formData.qualifications} onChange={handleChange} className="form-textarea"></textarea>
                        </div>


                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Update Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminJobEdit;
