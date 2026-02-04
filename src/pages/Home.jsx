import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import JobCard from '../components/JobCard';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Home() {
    const { showToast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    // Filter states
    const searchTerm = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 12;

    useEffect(() => {
        fetchJobs();
    }, [searchTerm, page]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('jobs')
                .select('*', { count: 'exact' })
                .eq('status', 'Open');

            if (searchTerm) {
                query = query.or(`position_title.ilike.%${searchTerm}%,job_description.ilike.%${searchTerm}%`);
            }

            const from = (page - 1) * perPage;
            const to = from + perPage - 1;

            const { data, count, error } = await query
                .order('deadline', { ascending: true })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) {
                console.error('Supabase Query Error:', error);
                throw error;
            }

            setJobs(data || []);
            setTotalJobs(count || 0);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            // Display error to user
            setJobs([]);
            showToast(`Connection Error: ${error.message || JSON.stringify(error)}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const search = formData.get('search');

        setSearchParams({
            search: search,
            page: 1
        });
    };

    // Pagination helpers
    const totalPages = Math.ceil(totalJobs / perPage);

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h2 className="hero-title">Join the National Commission on Indigenous Peoples</h2>
                    <p className="hero-subtitle">Empowering Indigenous Cultural Communities nationwide through dedicated public service</p>
                    <a href="#vacancies-header" className="scroll-down-indicator">
                        <span className="scroll-text">Browse Vacancies</span>
                        <svg className="scroll-arrow" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </a>
                </div>
            </section>



            <div className="container">
                <div className="page-header">
                    <div className="page-header-content">
                        <h1 id="vacancies-header">Available Job Vacancies</h1>
                        <p>Apply for positions at the National Commission on Indigenous Peoples (NCIP)</p>
                    </div>
                </div>

                {/* Enhanced Search and Filter */}
                <div className="search-filter-bar">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search job titles, keywords, or descriptions..."
                            defaultValue={searchTerm}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-primary btn-search">Search</button>
                        {(searchTerm) && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setSearchParams({})}
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* Job Listings */}
                <div className="jobs-grid" id="job-listings">
                    {loading ? (
                        <div className="text-center py-5">Loading jobs...</div>
                    ) : jobs.length === 0 ? (
                        <div className="no-results">
                            <p>No job vacancies available at the moment.</p>
                            <p>Please check back later or contact NCIP for more information.</p>
                        </div>
                    ) : (
                        jobs.map((job, index) => (
                            <JobCard key={job.id} job={job} index={index} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <div className="pagination-info">
                            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalJobs)} of {totalJobs} positions
                        </div>
                        <div className="pagination-controls">
                            {page > 1 && (
                                <button
                                    onClick={() => setSearchParams({ search: searchTerm, page: page - 1 })}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Previous
                                </button>
                            )}

                            {/* Simple pagination: showing current page */}
                            <span className="mx-2">Page {page} of {totalPages}</span>

                            {page < totalPages && (
                                <button
                                    onClick={() => setSearchParams({ search: searchTerm, page: page + 1 })}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
