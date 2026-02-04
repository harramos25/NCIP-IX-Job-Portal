import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const REQUIRED_DOCUMENTS = [
    'Application Letter',
    'Personal Data Sheet',
    'Performance Rating',
    'Certificate of Eligibility',
    'Transcript of Records',
    'Training Certificates'
];

export default function Apply() {
    const { showToast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
            setJob(data);
            setLoading(false);
        };
        fetchJob();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData(e.target);
        const fullName = formData.get('full_name');
        const email = formData.get('email');
        const phone = formData.get('phone_number');
        const address = formData.get('address');

        try {
            // 1. Create Application Record
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .insert([{
                    job_id: id,
                    full_name: fullName,
                    email: email,
                    phone_number: phone,
                    address: address
                }])
                .select()
                .single();

            if (appError) throw appError;

            // 2. Upload Files
            const applicationId = appData.id;
            const uploadPromises = [];

            for (const docType of REQUIRED_DOCUMENTS) {
                const fileInput = formData.get(docType.replace(/\s+/g, '_').toLowerCase());
                if (fileInput && fileInput.size > 0) {
                    const fileName = `${applicationId}/${Date.now()}_${docType.replace(/\s+/g, '')}.pdf`;

                    const promise = (async () => {
                        // Upload
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('documents')
                            .upload(fileName, fileInput);

                        if (uploadError) throw uploadError;

                        // Public URL (or just path)
                        const filePath = uploadData.path;

                        // Insert Document Record
                        const { error: docError } = await supabase
                            .from('application_documents')
                            .insert([{
                                application_id: applicationId,
                                document_type: docType,
                                file_path: filePath,
                                file_name: fileInput.name,
                                file_size: fileInput.size
                            }]);

                        if (docError) throw docError;
                    })();

                    uploadPromises.push(promise);
                }
            }

            await Promise.all(uploadPromises);
            showToast('Your application has been submitted successfully!', 'success');

            // Redirect to Job Vacancies (Home) after success toast
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            console.error('Submission error:', err);
            showToast('Failed to submit application: ' + err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container py-5">Loading...</div>;
    if (!job) return <div className="container py-5">Job not found</div>;

    return (
        <div className="container">
            <div className="breadcrumb">
                <Link to={`/job/${id}`}>← Back to Job Details</Link>
            </div>

            <div className="application-form-container">
                <h1>Application Form</h1>
                <p className="form-subtitle">Position: <strong>{job.position_title}</strong></p>

                <form onSubmit={handleSubmit} className="application-form">
                    <div className="form-section">
                        <h2>Personal Information</h2>
                        <div className="form-group">
                            <label htmlFor="full_name">Full Name *</label>
                            <input type="text" id="full_name" name="full_name" required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input type="email" id="email" name="email" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone_number">Phone Number *</label>
                                <input type="tel" id="phone_number" name="phone_number" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address *</label>
                            <textarea id="address" name="address" rows="3" required></textarea>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Required Documents</h2>
                        <p className="form-note">Please upload all required documents in PDF format (Maximum 15MB per file)</p>
                        {REQUIRED_DOCUMENTS.map((doc, i) => (
                            <div className="form-group" key={i}>
                                <label>{doc} *</label>
                                <input
                                    type="file"
                                    name={doc.replace(/\s+/g, '_').toLowerCase()}
                                    accept=".pdf"
                                    required
                                />
                                <small>PDF only</small>
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-large" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <Link to={`/job/${id}`} className="btn btn-secondary">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
