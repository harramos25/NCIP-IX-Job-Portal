import React from 'react';

const About = () => {
    <div className="container about-container">
        <h1 className="text-center mb-5">About NCIP Information</h1>

        {/* Top Section: Mandate & Rights */}
        <section className="about-card">
            <h2>Mandate</h2>
            <p style={{ marginBottom: '2.5rem' }}>
                Republic Act 8371, otherwise known as “The Indigenous Peoples’ Rights Act of 1997”, created on October 29, 1997, the National Commission on Indigenous Peoples (NCIP), as the primary government agency responsible for the formulation and implementation of policies, plans, and programs to promote and protect the rights and well-being of the Indigenous Cultural Communities/Indigenous Peoples (ICCs/IPs) and the recognition of their Ancestral Domains (ADs) as well as their rights thereto.
            </p>

            <h3>Indigenous Peoples Rights</h3>
            <ul className="rights-list">
                <li>
                    <strong>Right to Ancestral Domains</strong> – The rights of ownership and possession of ICCs/IPs to their Ancestral Domains shall be recognized and protected.
                </li>
                <li>
                    <strong>Right to Self-Governance and Empowerment</strong> – The state recognizes the inherent right of ICC/IPs to self-governance and self-determination and respects the integrity of their values, practices, and institutions. Consequently, the state shall guarantee the right of ICCs/IPs to freely pursue their economic, social, and cultural development.
                </li>
                <li>
                    <strong>Social Justice and Human Rights</strong> – The state shall likewise ensure that the employment of any form or coercion against ICCs/IPs shall be dealt with by law.
                </li>
                <li>
                    <strong>Cultural Integrity</strong> – The State shall respect, recognize, and protect the rights of ICCs/IPs to preserve and protect their culture, traditions, and institutions. It shall consider these rights in the formulation and application of national plans and policies.
                </li>
            </ul>
        </section>

        {/* Bottom Section: Vision & Mission Split */}
        <div className="about-split-grid">

            {/* Left Card: Vision */}
            <div className="about-card center-content">
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vision</h3>
                <p>
                    "An esteemed Commission committed to the delivery of quality services to ICCs/IPs with their rights fully respected, recognized, promoted, and protected."
                </p>
            </div>

            {/* Right Card: Mission */}
            <div className="about-card center-content">
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mission</h3>
                <p>
                    "The NCIP is the primary government agency that formulates and implements policies, plans, and programs for the recognition, respect, promotion, and protection of the rights and well-being of IPs with due regard to their ancestral domains and lands, self-governance and empowerment, social justice and human rights, and cultural integrity."
                </p>
            </div>

        </div>

    </div>
    );
};

export default About;
