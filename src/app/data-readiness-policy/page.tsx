"use client";

import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function DataReadinessPolicyPage() {
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
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Data Readiness Policy</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground mb-12 pb-8 border-b border-border">
                            <p className="font-medium">Beunec Technologies, Inc.</p>
                            <p>Data Readiness Policy for the Aselius Platform and all Beunec Services</p>
                            <p>Effective Date: April 30, 2025</p>
                            <p>Last Updated: August 14, 2026</p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>This Data Readiness Policy outlines Beunec Technologies, Inc.’s commitment to ensuring the quality, availability, integrity, security, and continuity of services provided through all Beunec Services, including the Aselius Platform at https://aselius.beunec.com, the public website at https://beunec.co, research and experimental programs (including Rivine, Brolostack, Agentic Infrastructure, and related research and development), APIs, connectors, sandboxes, and any other deployed solutions, including successor products to offerings previously described as “Beunec Cloud.” It details our preparedness for data handling, incident response, and business continuity, affirming our dedication to a privacy-first approach and compliance with relevant regulations, including the New Jersey Data Privacy Act (NJDPA), applicable United States federal and state privacy and data-security laws, and, where applicable, GDPR, UK GDPR, and CCPA/CPRA. This Policy is intended to be read together with our Terms of Use and Privacy Policy. Service-level figures in this Policy are operational targets, not independent warranties, except to the extent a separate written enterprise agreement expressly provides otherwise.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Availability and Uptime</h2>
                                <div className="space-y-4">
                                    <p>We strive to provide highly available services for the Aselius Platform and other production Beunec Services. Research, experimental, preview, and documentation websites may have different availability characteristics and are not subject to the same targets as production Aselius.</p>
                                    <p><strong>Service Level Agreement (SLA) Targets:</strong> For generally available Aselius Platform core services, Beunec aims for an uptime of 99.9%, excluding scheduled maintenance, force majeure, third-party identity or cloud-provider outages outside Beunec’s reasonable control, and misuse of the Services. This target is an operational objective. Credits, if any, for missed targets are available only if stated in a written enterprise agreement.</p>
                                    <p><strong>Scheduled Maintenance:</strong> We conduct scheduled maintenance to ensure optimal performance and security. Users will be notified at least forty-eight (48) hours in advance of any planned downtime that is expected to materially affect production Aselius, via email and/or in-app announcements, except for emergency security maintenance, which may proceed with shorter or concurrent notice.</p>
                                    <p><strong>Outage Handling:</strong> In the event of an unscheduled outage, our incident response team will work to restore services as quickly as possible. Updates on the status of outages will be provided through available status communications (including any status page Beunec maintains, in-app notices, and, for prolonged incidents, email to account contacts we have on file).</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Integrity and Backup</h2>
                                <div className="space-y-4">
                                    <p>Maintaining the integrity and availability of your data is paramount across Aselius workspaces, messaging, file storage, and other production Services that store User Content.</p>
                                    <p><strong>Backup Frequency:</strong> Production user data on the Aselius Platform is backed up automatically at least daily. Critical system data may be backed up more frequently. Backup copies are encrypted in line with our Privacy Policy and Security Disclosure practices.</p>
                                    <p><strong>Recovery Handling:</strong> In the event of data loss or corruption caused by Beunec infrastructure failure, we maintain data-recovery procedures designed to restore services and data from our backups with minimal disruption. Recovery time and recovery point objectives are internal operational targets and may vary by component (databases, object storage, search indexes, and sandbox ephemeral disks). Ephemeral sandbox files that you did not persist to Assets or Manage Files may not be recoverable after session end, as disclosed in Aselius documentation.</p>
                                    <p><strong>User Responsibilities:</strong> While Beunec Technologies, Inc. performs regular backups of production Services, users are encouraged to maintain their own local or organizational backups of critical files and information stored on Aselius or other Services, especially for highly sensitive data, legal holds, and regulatory archives. Beunec is not a substitute for your records-retention program.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Incident Response</h2>
                                <div className="space-y-4">
                                    <p>We have an incident response plan to detect, respond to, and mitigate security and data incidents affecting the Aselius Platform, other production Services, and, where applicable, research systems that process personal data.</p>
                                    <p><strong>Detection:</strong> We utilize monitoring and threat-detection practices to identify potential security incidents or data breaches.</p>
                                    <p><strong>Response:</strong> Our security personnel follow a structured protocol to investigate, contain, and remediate identified incidents promptly, including isolating affected systems, rotating credentials where warranted, and preserving evidence as required by law or investigation needs.</p>
                                    <p><strong>Notification:</strong> In compliance with applicable laws and regulations, including the NJDPA and other state breach-notification statutes that may apply, we will notify affected users and, where required, regulators without undue delay in the event of a confirmed personal-data breach that poses a significant risk to rights and freedoms, or that otherwise meets a statutory notification threshold. Notifications will include details about the incident, the data affected to the extent known, and steps being taken to mitigate impact, unless a law-enforcement delay is legally required. For Aselius organizational customers, Beunec will notify the account owner or designated security contact.</p>
                                    <p><strong>Vulnerability reports:</strong> Security researchers and customers may report vulnerabilities to the contacts published in the Aselius Security Disclosure. Do not publicly post exploit details before Beunec has had a reasonable opportunity to remediate.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Portability</h2>
                                <div className="space-y-4">
                                    <p>We believe in user control over data, including the ability to move it, consistent with NJDPA, GDPR, and CCPA/CPRA portability rights where those laws apply.</p>
                                    <p><strong>Data Export:</strong> The Aselius Platform provides mechanisms for users to export eligible data in commonly used, machine-readable or document formats (for example, Markdown, JSON, CSV, PDF, DOCX, or HTML, depending on the feature). This capability is accessible via product export controls, account settings, or by requesting assistance at support@beunec.com or privacy@beunec.com for personal-data portability requests.</p>
                                    <p><strong>Data Import:</strong> While we support data export, the ability to import data from other platforms may vary by feature and is continually being enhanced. Connectors you authorize may import data from third-party services subject to those services’ terms.</p>
                                    <p><strong>Organizational data:</strong> If your organization is the controller of workspace content, export and deletion requests for that content should be directed to the organization; Beunec will assist as processor.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Business Continuity</h2>
                                <div className="space-y-4">
                                    <p>Beunec Technologies, Inc. maintains business-continuity practices to support the ongoing availability of production Services under reasonably foreseeable circumstances, including vendor dependency, regional cloud disruption, and staffing continuity for critical operations.</p>
                                    <p><strong>Company Acquisition or Merger:</strong> In the event of an acquisition or merger, user data will be transferred under equivalent or stronger data-protection policies. Users will be notified of such changes in advance as required by the Privacy Policy and applicable law.</p>
                                    <p><strong>Bankruptcy or Service Discontinuity:</strong> In the unlikely event of company bankruptcy or an unforeseen discontinuation of a production Service, we will provide users with ample notice (minimum ninety (90) days where reasonably practicable) and a clear process to download their data before service termination, except where a shorter period is imposed by a court, regulator, or infrastructure provider. Research and experimental Services may be withdrawn with less notice.</p>
                                    <p><strong>Dependencies:</strong> Continuity of Aselius depends in part on subprocessors (including cloud infrastructure and Auth0). Beunec monitors material vendor status and maintains contractual security commitments with processors as described in the Privacy Policy.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. Compliance</h2>
                                <div className="space-y-4">
                                    <p>Beunec Technologies, Inc. is committed to complying with relevant data-protection and data-security regulations applicable to the Services we offer.</p>
                                    <p><strong>Assurance of Compliance:</strong> Our data-handling practices are designed to comply with the New Jersey Data Privacy Act (NJDPA) and, where applicable, international and other state regulations such as the General Data Protection Regulation (GDPR), the UK GDPR, and the California Consumer Privacy Act as amended by the CPRA. We also consider COPPA (we do not offer Services to children under 18), applicable breach-notification laws, and export-control restrictions. NJDPA requires, among other things, data minimization, purpose limitation, reasonable administrative, technical, and physical safeguards, consumer rights handling, and, for processing that presents a heightened risk of harm, data-protection assessments. Beunec conducts such assessments for processing activities that meet that statutory threshold (including sensitive data and certain profiling) and will make assessments available to the New Jersey Division of Consumer Affairs upon lawful request, consistent with confidentiality protections in the statute.</p>
                                    <p><strong>Regular Audits:</strong> We conduct regular internal reviews, and may conduct external audits, of our data-readiness and security practices to ensure ongoing compliance and identify areas for improvement. Formal certifications (for example, SOC 2) are provided only if and when Beunec has completed them and offers them under NDA or customer inquiry; this Policy does not represent that a particular certification is currently in force unless separately confirmed in writing.</p>
                                    <p><strong>Research and development:</strong> Research systems are segregated from production customer workloads to the extent reasonably practicable. Data used for published research is aggregated or otherwise de-identified unless participants have consented to identifiable use.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Relationship to Product Documentation</h2>
                                <p>Technical details specific to Aselius (encryption implementations, sandbox isolation, connector scoping, and vulnerability reporting) are described in the Aselius Security Disclosure at https://beunec.co/aselius-platform/docs/security-disclosure. If there is a conflict between marketing language and this Policy, this Policy and the Terms of Use control. If there is a conflict between this Policy and a written enterprise agreement signed by Beunec, the enterprise agreement controls for that customer’s production use of the covered Service.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes and Contact</h2>
                                <div className="space-y-4">
                                    <p>We may update this Data Readiness Policy as our Services and legal obligations evolve. Updates will be posted at https://beunec.co/data-readiness-policy. Material changes will be communicated in the same manner as Privacy Policy updates.</p>
                                    <p>Questions regarding data readiness, continuity, or incident notification may be sent to support@beunec.com or privacy@beunec.com.</p>
                                    <p>Beunec Technologies, Inc., 971 US HIGHWAY 202N STE N BRANCHBURG, NJ 08876. Phone: +19147503008.</p>
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
