"use client";

import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Terms of Use</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground mb-12 pb-8 border-b border-border">
                            <p className="font-medium">Beunec Technologies, Inc.</p>
                            <p>Beunec Cloud Platform Terms of Use</p>
                            <p>Effective Date: April 30, 2025</p>
                            <p>Last Updated: August 01, 2025</p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>Welcome to Beunec Cloud, an innovative, privacy-first, AI-powered productivity platform offered by Beunec Technologies, Inc., a corporation registered in New Jersey, USA. This Platform unifies digital workplace tools to enhance collaboration, increase productivity, and ensure strict data privacy for professionals, teams, and students. The 'Beunec' name is a registered trademark with the USPTO (registration pending, 2025), and all associated intellectual property is owned by Beunec Technologies, Inc.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Acceptance of Terms</h2>
                                <p>By accessing or using the Beunec Cloud platform (the "Platform"), you ("User," "you," or "your") agree to be legally bound by these Terms of Use ("Terms"), our Privacy Policy located at www.beunec.co/privacy-policy, our Data Readiness Policy located at www.beunec.co/data-readiness, and our Refund Policy located at www.beunec.co/refund-policy. Your use of the Platform constitutes your acceptance of these Terms as a binding contract. You also agree to comply with all applicable laws, including the New Jersey Data Privacy Act (NJDPA) and relevant federal regulations. If you do not agree to these Terms, you may not access or use the Platform.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Description of Research, Deployment, & Services</h2>
                                <p>The Platform provides a unified, AI-powered workspace with features including secure file management, AI-assisted document summarization and writing, encrypted messaging, customizable cloud workspaces, and various pricing plans (free Base tier, Pro subscription, and usage-based PAYG add-on). The Platform is provided on an "as is" and "as available" basis.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. User Responsibilities</h2>
                                <div className="space-y-4">
                                    <p><strong>4.1 Compliance:</strong> You agree to use the Platform in compliance with all federal, state (New Jersey), and local laws, including but not limited to the NJDPA, N.J.S.A. 56:8-161 et seq. (Identity Theft Prevention Act), and labor regulations (e.g., 29 U.S.C. § 201 et seq.). You are solely responsible for your actions and for complying with any agreements related to your use of the Platform.</p>
                                    <p><strong>4.2 Account Management:</strong> You are responsible for all activities that occur under your account. You agree to provide accurate and complete information during account creation and to keep it updated.</p>
                                    <p><strong>4.3 Authentication Verification Process:</strong> Users may be required to undergo authentication via Auth0 to ensure authenticity and comply with Beunec’s security standards. Upon successful authentication, you will be able to select and manage your unique Beunec Cloud Handle.</p>
                                    <p>The Beunec Cloud Handle is a unique, user-assigned identity that acts as your digital identifier within the Platform. The general format is &#123;username&#125;@beunec.cloud. Special domains exist for specific user groups, such as &#123;username&#125;@beunec.cloud.edu for educational users and &#123;username&#125;@beunec.cloud.gov for government users. Your handle is required for logging in, accessing features, and is used for secure file sharing, messaging, and collaboration within the Beunec Cloud ecosystem.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Personal and Non-Commercial Use Limitation</h2>
                                <p>The Platform is intended for personal and professional use to enhance productivity and collaboration. It is not for commercial exploitation, such as reselling access to the Platform or its features. Limited commercial use, such as under an organizational subscription or a specific enterprise agreement, is permitted only with the explicit written approval of Beunec Technologies, Inc. You may not use the Platform to develop competing services, distribute its content without written consent, or engage in unauthorized data extraction.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Privacy and Protection of Personal Information</h2>
                                <p>Your use of the Platform is governed by our Privacy Policy, which details how Beunec Technologies, Inc. collects, stores, processes, and protects your personal data. By using the Platform, you consent to the data practices described in that policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. Content</h2>
                                <div className="space-y-4">
                                    <p><strong>7.1 Beunec Content:</strong> All content, including but not limited to text, graphics, logos, and software, made available on the Platform by Beunec Technologies, Inc. is the exclusive property of Beunec or its licensors and is protected by copyright, trademark, and other intellectual property laws.</p>
                                    <p><strong>7.2 User Content:</strong> You retain all ownership rights to the data, files, and information you create, store, or transmit on the Platform ("User Content"). However, by using the Platform, you grant Beunec Technologies, Inc. a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, and sublicensable license to use, reproduce, modify, and distribute User Content solely for the purpose of providing, maintaining, and improving the Platform's services. This includes using aggregated and anonymized data for platform improvement and AI model development, but your personal data will not be used for third-party AI training without your explicit consent.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Software</h2>
                                <p>Any software provided by Beunec as part of the Platform is licensed, not sold, to you. You may not copy, modify, distribute, sell, or lease any part of our software or reverse engineer or attempt to extract the source code, unless such restrictions are prohibited by law.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. Documents</h2>
                                <p>Documents made available on the Platform (e.g., user agreements, research summaries) are the property of Beunec Technologies, Inc. or are licensed to us. You may access them for personal use but may not redistribute or alter them without our express written permission, in compliance with applicable copyright law.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
                                <div className="space-y-4">
                                    <p>TO THE FULLEST EXTENT PERMITTED BY LAW, BEUNEC TECHNOLOGIES, INC., ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM; (iii) ANY CONTENT OBTAINED FROM THE PLATFORM; AND (iv) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</p>
                                    <p>BEUNEC TECHNOLOGIES, INC. AND ITS AFFILIATES WILL NOT BE RESPONSIBLE FOR USER'S MISUSAGE, USER'S MISTAKES, OR USER'S MISUNDERSTANDINGS. USER AND SITE AUDIENCES WAIVE THEIR RIGHTS TO TAKE LEGAL ACTIONS AGAINST BEUNEC TECHNOLOGIES, INC., ITS INTELLECTUAL PROPERTIES (IPS), AND ITS AFFILIATES. USER AND SITE AUDIENCES ARE LEGALLY BOUND TO OUR TERMS OF USE, PRIVACY POLICY, DATA READINESS POLICY, AND REFUND POLICY IMMEDIATELY UPON ACCESSING THIS SITE, USING THE BEUNEC CLOUD PLATFORM, OR USING OTHER BEUNEC'S PRODUCTS OR PRODUCTS THAT HAVE TRACES OF ITS IP. USERS ARE SOLELY RESPONSIBLE FOR THEIR OWN CONDUCT WHEN FILE SHARING, COMMUNICATING, NETWORKING, OR COLLABORATING WITH OTHER USERS ON OUR BEUNEC CLOUD PLATFORM AND OTHER SOLUTIONS.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">11. User Persona Account, Password, and Security</h2>
                                <p>You are responsible for protecting your login information, Beunec Cloud Handle, and bcid (beunec cloud identification). You must notify Beunec immediately of any unauthorized use or breach of security. While Beunec implements various security measures, including MFA and encryption, you acknowledge that no system is completely secure, and you are responsible for maintaining the confidentiality of your account credentials. If you are under 18, you are not of the required age to access this platform. Please contact us at support@beunec.com for any inquiry.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">12. User Persona Dashboard</h2>
                                <p>The Platform provides various dashboards tailored to different user personas, including professionals, students, and teams, to provide a customized user experience.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">13. No Unlawful or Prohibited Use</h2>
                                <div className="space-y-4">
                                    <p>You may not use the Platform for any purpose that is unlawful or prohibited by these Terms. Prohibited activities include, but are not limited to:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Illegal activities, including fraud or discrimination, as prohibited by N.J.S.A. 10:5-12.</li>
                                        <li>Unauthorized access, hacking, or data scraping of the Platform or its users.</li>
                                        <li>Posting harmful, obscene, or misleading content.</li>
                                        <li>Disrupting Platform functionality, such as by uploading malware, viruses, or other harmful code.</li>
                                    </ul>
                                    <p>Violations of this section may lead to immediate account termination and potential legal action.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">14. Use of Services & Solutions</h2>
                                <div className="space-y-4">
                                    <p><strong>14.1 Use of Beunec Cloud Perks:</strong></p>
                                    <p><strong>A. Disclosure:</strong> Beunec Technologies, Inc. has strategic alliance or partnership agreements with various providers to display perks to Beunec Cloud users. These perks are offered as a brand-marketing opportunity to the perk's provider. To redeem a perk, you will receive a perk code. You may be required to show your Beunec Cloud ID to confirm authenticity. Each perk is subject to its provider's terms and may be redeemable only once. If a perk code is invalid, you must contact support@beunec.com with the subject "Beunec Cloud Perk Code Invalid Report" and include your valid Beunec Cloud ID for verification.</p>
                                    <p><strong>B. Disclaimer:</strong> Beunec Technologies, Inc. offers perks on an "as is" basis and makes no warranties or guarantees about their value, suitability, or availability. You are solely responsible for evaluating the merits of any perk and for any decisions you make based on the information provided. We are not responsible for any damages or losses resulting from the use of any perks, including financial losses or personal injuries.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">15. Materials Provided to Beunec or Posted at Any Beunec Website</h2>
                                <p>Any materials you submit to the Platform, such as feedback, suggestions, or profile information, must be lawful and non-infringing. By submitting these materials, you grant Beunec Technologies, Inc. a non-exclusive, royalty-free, perpetual, and irrevocable license to use, modify, and incorporate them to improve our services. You retain your moral rights under 17 U.S.C. § 106A unless otherwise agreed upon in writing.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">16. Notices and Procedure for Making Claims of Copyright Infringement</h2>
                                <div className="space-y-4">
                                    <p>Beunec Technologies, Inc. respects the intellectual property rights of others and adheres to the Digital Millennium Copyright Act (DMCA) (17 U.S.C. § 512). To report copyright infringement, please provide a written notice to our Designated Agent with the following information:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                                        <li>Identification of the copyrighted work claimed to have been infringed.</li>
                                        <li>Identification of the material that is claimed to be infringing and its location on the Platform.</li>
                                        <li>Your contact information, including your address, telephone number, and email address.</li>
                                        <li>A statement that you have a good-faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                                        <li>A statement that the information in the notification is accurate, and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
                                    </ul>
                                    <p><strong>Designated Agent:</strong></p>
                                    <p>Beunec Technologies, Inc.<br />971 US HIGHWAY 202N STE N BRANCHBURG, NJ 08876<br />Email: info@beunec.com</p>
                                    <p>Beunec will investigate and may remove content, notifying the poster of the claim and following counter-notice procedures.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">17. Links to Third-Party Sites</h2>
                                <p>The Platform may contain links to third-party websites. These links are provided for your convenience, and Beunec is not responsible for the content, practices, or security of these sites. The inclusion of a link does not imply endorsement by Beunec. You access these sites at your own risk, as per New Jersey contract law.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">18. Unsolicited Idea Submission Policy</h2>
                                <p>Beunec Technologies, Inc. does not accept or consider unsolicited ideas, suggestions, or materials to avoid potential disputes. By submitting any such materials, you waive any claims for compensation or attribution and grant Beunec a non-exclusive, royalty-free license to use them for any purpose, as per N.J.S.A. 2A:14-1. Formal idea submissions should only be made through official channels under a signed NDA.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">19. Dispute Resolution</h2>
                                <div className="space-y-4">
                                    <p><strong>19.1 Informal Resolution:</strong> In the event of a dispute, you agree to first contact support@beunec.com to attempt to resolve the issue informally. Beunec will respond within seven (7) business days.</p>
                                    <p><strong>19.2 Mediation:</strong> If the dispute is not resolved informally, you agree to engage in non-binding mediation in New Brunswick, New Jersey, with shared costs, within thirty (30) days of the informal resolution failing.</p>
                                    <p><strong>19.3 Arbitration:</strong> If mediation fails, any unresolved dispute will be settled by binding arbitration under the rules of the American Arbitration Association (AAA) in Somerset County, New Jersey. YOU AGREE TO WAIVE YOUR RIGHT TO A CLASS ACTION LAWSUIT, AND ALL CLAIMS MUST BE BROUGHT ON AN INDIVIDUAL BASIS. This arbitration provision does not apply to intellectual property disputes, which may be brought in a court of competent jurisdiction.</p>
                                    <p><strong>19.4 Governing Law:</strong> These Terms and any disputes arising from them will be governed by the laws of the State of New Jersey, USA, without regard to its conflict of law principles. Any non-arbitrable disputes will be litigated in the courts of Middlesex County, New Jersey.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">20. Changes to the Terms of Use</h2>
                                <p>Beunec Technologies, Inc. reserves the right to update these Terms at any time. The updated Terms will be effective upon posting at www.beunec.co/terms or upon notification to you. Significant changes will be communicated with at least thirty (30) days' notice. Your continued use of the Platform after the effective date of the changes constitutes your acceptance of the new Terms.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">21. Contact Information</h2>
                                <div className="space-y-2">
                                    <p>For any questions regarding these Terms, please contact:</p>
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
