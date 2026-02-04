import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const REQUIRED_DOCUMENTS = [
    '2x2 ID Picture',
    'Application Letter',
    'Personal Data Sheet/CS Formto 12 (Revise 2025)',
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
        const facebookName = formData.get('facebook_name');
        const address = formData.get('address');

        try {
            // 0. Quick Size Validation
            for (const docType of REQUIRED_DOCUMENTS) {
                const inputName = docType.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                const fileInput = formData.get(inputName);
                if (fileInput && fileInput.size > 5 * 1024 * 1024) { // 5MB
                    throw new Error(`${docType} exceeds the 5MB limit. Please compress your file.`);
                }
            }

            // 1. Create Application Record
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .insert([{
                    job_id: id,
                    full_name: fullName,
                    email: email,
                    phone_number: phone,
                    facebook_name: facebookName,
                    address: address,
                    status: 'Unread'
                }])
                .select()
                .single();

            if (appError) throw appError;

            // 2. Upload Files
            const applicationId = appData.id;
            const uploadPromises = [];

            for (const docType of REQUIRED_DOCUMENTS) {
                const inputName = docType.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                const fileInput = formData.get(inputName);
                if (fileInput && fileInput.size > 0) {
                    const isImage = docType === '2x2 ID Picture';
                    const extension = isImage ? (fileInput.name.split('.').pop() || 'png') : 'pdf';
                    const fileName = `${applicationId}/${Date.now()}_${docType.replace(/[^a-zA-Z0-9]/g, '')}.${extension}`;

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
                            <label htmlFor="facebook_name">Facebook Account Name</label>
                            <input type="text" id="facebook_name" name="facebook_name" placeholder="e.g. Juan De La Cruz (Used for verification)" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address *</label>
                            <textarea id="address" name="address" rows="3" required></textarea>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Required Documents</h2>
                        <p className="form-note">Please upload all required documents (Max 5MB per file)</p>
                        {REQUIRED_DOCUMENTS.map((doc, i) => (
                            <div className="form-group" key={i}>
                                <label>{doc} *</label>
                                <input
                                    type="file"
                                    name={doc.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}
                                    accept={doc === '2x2 ID Picture' ? "image/png" : ".pdf"}
                                    required
                                />
                                <small>{doc === '2x2 ID Picture' ? "PNG image only" : "PDF files only"}</small>
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
