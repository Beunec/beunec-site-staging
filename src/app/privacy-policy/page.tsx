"use client";

import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="baap-page min-h-screen">
            <Header />

            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Privacy Policy</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground mb-12 pb-8 border-b border-border">
                            <p className="font-medium">Beunec Technologies, Inc.</p>
                            <p>Beunec Platform Privacy Policy</p>
                            <p>Effective Date: April 30, 2025</p>
                            <p>Last Updated: August 01, 2025</p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>This Privacy Policy outlines how Beunec Technologies, Inc. ("Beunec," "we," "us," or "our") collects, uses, stores, and protects your data in connection with your use of the Beunec Cloud platform ("Platform"). As a New Jersey-based corporation, we are committed to a privacy-first approach, ensuring the confidentiality and security of your information in compliance with the New Jersey Data Privacy Act (NJDPA) and other applicable federal and international laws.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Data Collection</h2>
                                <div className="space-y-4">
                                    <p>We collect the following data to provide and improve the Platform's services:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Personal Data:</strong> Information you provide when you create an account or use our services, such as your name, email address, company or educational institution, and billing information.</li>
                                        <li><strong>Usage Data:</strong> Automatically collected data about your interaction with the Platform, including your IP address, browser type, device information, access times, pages viewed, and feature usage.</li>
                                        <li><strong>Research Data:</strong> Data you choose to provide for research purposes, such as survey responses or feedback on new features.</li>
                                        <li><strong>Communication Data:</strong> Messages, feedback, or support inquiries you submit through the Platform.</li>
                                    </ul>
                                    <p>Data is collected only when necessary, adhering to NJDPA’s data minimization principles, and with your consent where required (e.g., during account creation).</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Usage</h2>
                                <div className="space-y-4">
                                    <p>We use your data for the following purposes:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Provide Services:</strong> To operate the Platform, deliver the Beunec Cloud services, and manage your account.</li>
                                        <li><strong>Improve the Platform:</strong> To analyze usage patterns, troubleshoot issues, and enhance the performance and features of our services.</li>
                                        <li><strong>Conduct Research:</strong> To develop new features and capabilities, including our AI solutions, based on anonymized or aggregated data.</li>
                                        <li><strong>Communicate:</strong> To send you service updates, important notices, or support responses. You have the option to opt-out of non-essential communications in your account settings.</li>
                                        <li><strong>Ensure Compliance:</strong> To verify user identities, maintain platform security, and prevent fraudulent activity, in compliance with regulations like N.J.S.A. 56:8-161.</li>
                                    </ul>
                                    <p>Data usage is limited to these purposes, ensuring transparency and user trust.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Protection</h2>
                                <div className="space-y-4">
                                    <p>We are committed to protecting your data with robust security measures:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Encryption:</strong> We use AES-256 encryption for data at rest and TLS 1.3 for data in transit, in line with NIST standards, to protect your information from unauthorized access.</li>
                                        <li><strong>Access Controls:</strong> Access to user data is strictly limited to authorized personnel on a need-to-know basis through role-based access controls managed by Auth0. Multi-factor authentication (MFA) is mandatory for all internal access.</li>
                                        <li><strong>Monitoring:</strong> We employ continuous threat detection and undergo annual third-party penetration testing to proactively prevent and respond to security incidents.</li>
                                        <li><strong>Secure Storage:</strong> Your data is stored on secure cloud infrastructure provided by AWS S3, MongoDB Atlas, Google Cloud, and Cloudflare D1/R2. We implement additional encryption to ensure that even our team and cloud providers cannot access or read the content of your messages and file storage, which appears as gibberish characters without your decryption key.</li>
                                    </ul>
                                    <p>These measures comply with N.J.S.A. 56:8-161 et seq. and federal regulations, safeguarding Beunec Cloud and user data.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
                                <div className="space-y-4">
                                    <p>We retain data only for as long as necessary to fulfill the purposes for which it was collected, as specified by our Beunec Sacred Data Governance Framework.</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Personal Data:</strong> Retained for the duration of your active account and a reasonable period thereafter for legal, audit, or backup purposes.</li>
                                        <li><strong>Usage Data:</strong> Anonymized or aggregated data may be retained indefinitely for platform improvement.</li>
                                        <li><strong>Research Data:</strong> Retained for the duration of the research project, after which it is anonymized or securely disposed of.</li>
                                    </ul>
                                    <p>Data is securely disposed of using NIST 800-88 wiping for digital records and certified shredding for physical copies, as per N.J.S.A. 56:8-162. Retention schedules are audited annually.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Reasons We Share Personal Data</h2>
                                <div className="space-y-4">
                                    <p>We do not sell your personal data. We only share it under the following strict conditions:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>With Your Consent:</strong> We will share your data with a third party if you provide your explicit consent.</li>
                                        <li><strong>Service Providers:</strong> We may share data with trusted vendors and service providers (including AWS, Auth0, MongoDB, Google Cloud, & Cloudflare) who are bound by client-provider terms and conditions to ensure NJDPA compliance and assist us in operating the Platform.</li>
                                        <li><strong>Partners:</strong> Anonymized or aggregated data may be shared with partners for research and marketing purposes, but it will not contain personally identifiable information.</li>
                                        <li><strong>Legal Requirements:</strong> If required by law (e.g., a court order), we will share the minimal amount of data necessary after notifying you, unless prohibited by law, as per N.J.S.A. 56:8-163.</li>
                                        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred under equivalent protections, with prior notice to you.</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. How to Access and Control Your Personal Data</h2>
                                <div className="space-y-4">
                                    <p>Under the NJDPA, you have the following rights regarding your data:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Access:</strong> You can view and download your data via your account settings.</li>
                                        <li><strong>Correct:</strong> You can update inaccurate information in your user profile at any time.</li>
                                        <li><strong>Delete:</strong> You can request the deletion of your personal data, subject to any legal retention requirements.</li>
                                        <li><strong>Opt-Out:</strong> You can opt-out of marketing communications or non-essential data sharing via your account settings.</li>
                                    </ul>
                                    <p>To exercise these rights, please contact privacy@beunec.com. We will respond to your request within 30 days, without a fee unless requests are excessive.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Cookies and Similar Technologies</h2>
                                <p>We use cookies and similar technologies to remember your preferences, authenticate your account, analyze usage patterns, and provide a personalized user experience. You can manage your cookie preferences through your browser settings.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. Solutions Provided by You—Notice to End Users</h2>
                                <p>This policy applies to all users of the Platform. Organizational or enterprise users are responsible for ensuring their use of the Platform and any data they submit complies with their internal privacy policies and any legal obligations they may have.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">10. Beunec Cloud Platform Account</h2>
                                <div className="space-y-4">
                                    <p><strong>Creation:</strong> Your account is created when you sign up for the Platform.</p>
                                    <p><strong>Security:</strong> You are responsible for securing your account credentials, including your password and Beunec Cloud Handle.</p>
                                    <p><strong>Management:</strong> You can manage your account details, privacy settings, and communication preferences in your user dashboard.</p>
                                    <p><strong>Termination:</strong> You may terminate your account at any time. We will delete your personal data as per our retention policy, subject to legal requirements.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">11. Collection of Data from Professionals of All Levels</h2>
                                <p>We collect data from professionals, including resumes, skills, and work preferences, solely to enhance their experience on the Platform. This data is used only with your consent, and you have full control over sharing settings in your dashboard, ensuring transparency and compliance with NJDPA.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">12. Other Important Privacy Information</h2>
                                <div className="space-y-4">
                                    <p><strong>Children’s Privacy:</strong> The Platform is not intended for users under the age of 18. We do not knowingly collect personal information from children under 18, in compliance with COPPA (15 U.S.C. § 6501).</p>
                                    <p><strong>International Users:</strong> Your data may be processed in the U.S. or other locations where we or our service providers operate. We ensure that any data transfers comply with applicable laws, including providing GDPR-equivalent protections where necessary.</p>
                                    <p><strong>Do Not Track:</strong> We honor “Do Not Track” signals from your browser, limiting tracking where requested, in line with CCPA principles.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">13. Artificial Intelligence and Aselius AI Capabilities</h2>
                                <p>The Platform uses AI, including Beunec Docs™ and Aselius™, to provide features such as AI-assisted writing, document summarization, and ground searching. We leverage Perplexity Sonar API capabilities to power our “Aselius AI” for GenAI with ground searching and Cloudflare Worker AI to power our “Write with AI” and “Summaries” features in Beunec Docs™. We guarantee that your personal data is not used for third-party AI model training without your explicit consent. AI outputs may be audited for accuracy and fairness as part of our Beunec Sacred Data Governance Framework, with immediate notification to you if this occurs.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">14. Productivity and Communications Products</h2>
                                <p>Communications on the Platform are end-to-end encrypted, and data access is restricted to authorized personnel. We use your communication data solely to provide and improve the service. You may opt out of non-essential communications (e.g., newsletters) via your account settings.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">15. Search and Browse</h2>
                                <p>Platform search and browse features collect usage data to personalize results. This data is anonymized where possible. We do not track sensitive queries without your explicit consent, ensuring compliance with NJDPA.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">16. Beunec Platform</h2>
                                <p>All data is processed in a transparent manner, as described in Sections 2-4, and in compliance with federal and New Jersey laws.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">17. Simulation and Related Services</h2>
                                <p>As part of our 2050 Vision, we are developing future services, including immersive training and recruitment simulations. Data for these services will be collected with explicit user consent, encrypted, and stored securely according to NIST standards, with clear opt-out options available.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">18. Changes to the Privacy Policy</h2>
                                <p>We may update this Privacy Policy to reflect changes in our legal obligations or Platform features. Any changes will be effective upon posting at www.beunec.co/privacy-policy or upon notification to you. Significant changes, such as new data uses, will be communicated with at least 30 days’ notice via email or in-app alerts. Your continued use of the Platform constitutes your acceptance of the new policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">19. Contact Information</h2>
                                <div className="space-y-2">
                                    <p>For privacy questions or to exercise your rights, please contact our privacy team:</p>
                                    <p>Beunec Technologies, Inc.</p>
                                    <p>971 US HIGHWAY 202N STE N BRANCHBURG, NJ 08876</p>
                                    <p>Email: support@beunec.com</p>
                                    <p>Phone: +19147503008</p>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
