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
                            <p>Beunec Platform Data Readiness Policy</p>
                            <p>Effective Date: April 30, 2025</p>
                            <p>Last Updated: August 01, 2025</p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>This Data Readiness Policy outlines Beunec Technologies, Inc.'s commitment to ensuring the quality, availability, integrity, and continuity of services provided through the Beunec Cloud platform. It details our preparedness for data handling, incident response, and business continuity, affirming our dedication to a privacy-first approach and compliance with relevant regulations.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Availability & Uptime</h2>
                                <div className="space-y-4">
                                    <p>We strive to provide highly available services for Beunec Cloud.</p>
                                    <p><strong>Service Level Agreement (SLA) Targets:</strong> Beunec Cloud aims for an uptime of 99.9% for core services, excluding scheduled maintenance.</p>
                                    <p><strong>Scheduled Maintenance:</strong> We conduct scheduled maintenance to ensure optimal performance and security. Users will be notified at least 48 hours in advance of any planned downtime via email and in-app announcements.</p>
                                    <p><strong>Outage Handling:</strong> In the event of an unscheduled outage, our incident response team will work to restore services as quickly as possible. Updates on the status of outages will be provided through our status page at status.beunec.co and, for prolonged incidents, via email.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Integrity & Backup</h2>
                                <div className="space-y-4">
                                    <p>Maintaining the integrity and availability of your data is paramount.</p>
                                    <p><strong>Backup Frequency:</strong> All user data on Beunec Cloud is backed up automatically at least daily. Critical system data may be backed up more frequently.</p>
                                    <p><strong>Recovery Handling:</strong> In the event of data loss or corruption, we maintain robust data recovery procedures designed to restore services and data from our backups with minimal disruption.</p>
                                    <p><strong>User Responsibilities:</strong> While Beunec Technologies, Inc. performs regular backups, users are encouraged to maintain their own local backups of critical files and information stored on Beunec Cloud, especially for highly sensitive data.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Incident Response</h2>
                                <div className="space-y-4">
                                    <p>We have a comprehensive incident response plan to detect, respond to, and mitigate security and data incidents.</p>
                                    <p><strong>Detection:</strong> We utilize continuous monitoring and advanced threat detection systems to identify potential security incidents or data breaches.</p>
                                    <p><strong>Response:</strong> Our dedicated security team follows a structured protocol to investigate, contain, and remediate any identified incidents promptly.</p>
                                    <p><strong>Notification:</strong> In compliance with applicable laws and regulations, including the NJDPA, we will notify affected users without undue delay in the event of a confirmed data breach that poses a significant risk to their rights and freedoms. Notifications will include details about the incident, the data affected, and steps being taken to mitigate impact.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Portability</h2>
                                <div className="space-y-4">
                                    <p>We believe in user control over data, including the ability to move it.</p>
                                    <p><strong>Data Export:</strong> Beunec Cloud provides mechanisms for users to export their data in commonly used, machine-readable formats (e.g., JSON, CSV, standard document formats). This feature is accessible via your account settings.</p>
                                    <p><strong>Data Import:</strong> While we support data export, the ability to import data from other platforms may vary by feature and is continually being enhanced.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Business Continuity</h2>
                                <div className="space-y-4">
                                    <p>Beunec Technologies, Inc. has a business continuity plan to ensure the ongoing availability of services under various circumstances.</p>
                                    <p><strong>Company Acquisition or Merger:</strong> In the event of an acquisition or merger, user data will be transferred under equivalent or stronger data protection policies. Users will be notified of such changes in advance.</p>
                                    <p><strong>Bankruptcy or Service Discontinuity:</strong> In the unlikely event of company bankruptcy or an unforeseen discontinuation of services, we will provide users with ample notice (minimum 90 days) and a clear process to download their data before service termination.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. Compliance</h2>
                                <div className="space-y-4">
                                    <p>Beunec Technologies, Inc. is committed to complying with relevant data protection regulations.</p>
                                    <p><strong>Assurance of Compliance:</strong> Our data handling practices are designed to comply with the New Jersey Data Privacy Act (NJDPA) and, where applicable, international regulations such as the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).</p>
                                    <p><strong>Regular Audits:</strong> We conduct regular internal and external audits of our data readiness and security practices to ensure ongoing compliance and identify areas for improvement.</p>
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
