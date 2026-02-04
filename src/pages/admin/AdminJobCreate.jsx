import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';



const AdminJobCreate = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        position_title: '',
        job_description: '',
        salary_grade: '',
        qualifications: '',
        required_documents: '',
        deadline: '',
        status: 'Open'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('jobs')
            .insert([formData]);

        if (error) {
            showToast('Error creating job: ' + error.message, 'error');
        } else {
            showToast('Job created successfully!', 'success');
            navigate('/admin/jobs');
        }
        setLoading(false);
    };

    return (
        <div className="container dashboard-container">
            <div className="page-header">
                <div className="page-header-content">
                    <h1>Create New Job</h1>
                </div>
            </div>

            <div className="glass-card form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Position Title</label>
                        <input type="text" name="position_title" required value={formData.position_title} onChange={handleChange} className="form-input" />
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
                        <label>Required Documents</label>
                        <textarea name="required_documents" rows="4" required value={formData.required_documents} onChange={handleChange} className="form-textarea"></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminJobCreate;
