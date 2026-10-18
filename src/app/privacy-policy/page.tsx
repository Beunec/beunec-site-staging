import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="baap-page min-h-screen">
            <Header />

            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="kt-fade"
                     style={{ ["--d" as string]: "0s" }}>
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Privacy Policy</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground mb-12 pb-8 border-b border-border">
                            <p className="font-medium">Beunec Technologies, Inc.</p>
                            <p>Privacy Policy for the Aselius Platform and all Beunec Services</p>
                            <p>Effective Date: April 30, 2025</p>
                            <p>Last Updated: August 14, 2026</p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>This Privacy Policy outlines how Beunec Technologies, Inc. (“Beunec,” “we,” “us,” or “our”) collects, uses, stores, discloses, and protects personal data in connection with your use of the Services. For purposes of this Policy, “Services” means all Beunec products, websites, research programs, experimental offerings, and deployed solutions, including without limitation: the Aselius Platform (also referred to as “Aselius”) at https://aselius.beunec.com; the public website at https://beunec.co; documentation, publications, and related informational materials; research and development programs (including Rivine, Brolostack, Agentic Infrastructure, and other initiatives Beunec may operate); APIs, connectors, sandboxes, and preview environments; and successor products to offerings previously described as “Beunec Cloud.” As a New Jersey-based corporation, we are committed to a privacy-first approach, ensuring the confidentiality and security of your information in compliance with the New Jersey Data Privacy Act (NJDPA), N.J.S.A. 56:8-166.1 et seq., other applicable United States federal and state laws (including, where applicable, the CCPA/CPRA), COPPA (15 U.S.C. § 6501 et seq.) to the extent it applies, and, where we offer Services to individuals in the European Economic Area, United Kingdom, or Switzerland, the GDPR, UK GDPR, and Swiss FADP. Beunec is the controller of personal data we collect to operate our own accounts, websites, billing, security, and research programs. When an organization uses Aselius or another Service to process personal data about its own personnel or customers, that organization is typically the controller of that data and Beunec acts as a processor, except where Beunec independently determines purposes and means as described in this Policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Data Collection</h2>
                                <div className="space-y-4">
                                    <p>We collect the following categories of data to provide and improve the Services. We collect personal data only when reasonably necessary, adhering to NJDPA data-minimization principles, and with your consent where required (for example, during account creation, or before processing sensitive data as defined by applicable law).</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Account and identity data:</strong> Information you provide when you create an account or use our Services, such as your name, email address, CloudHandle, company or educational institution, role, and authentication identifiers issued by Auth0 or other identity providers.</li>
                                        <li><strong>Billing and transaction data:</strong> Plan selection, prepaid credit purchases, invoices, limited payment metadata processed by our payment processors (Beunec does not store full payment-card numbers on Aselius application servers).</li>
                                        <li><strong>User Content / Input:</strong> Files, messages, prompts, attachments, workspace content, connector data you authorize, and other materials you submit to Aselius or other Services.</li>
                                        <li><strong>Usage Data:</strong> Automatically collected data about your interaction with the Services, including your IP address, browser type, device information, access times, pages viewed, feature usage, approximate location derived from IP, and diagnostic logs needed for security and reliability.</li>
                                        <li><strong>Research and development data:</strong> Data you choose to provide for research purposes, such as survey responses, feedback on new features, or participation in experimental programs, and de-identified or aggregated telemetry used for internal research as described in Section 13.</li>
                                        <li><strong>Communication Data:</strong> Messages, feedback, or support inquiries you submit through the Services or to support@beunec.com, privacy@beunec.com, or other published Beunec addresses.</li>
                                        <li><strong>Cookies and similar technologies:</strong> As described in Section 8.</li>
                                    </ul>
                                    <p>We do not require you to provide sensitive data (such as precise geolocation, biometric identifiers, or government ID numbers) as a condition of using the public website. If you or your organization upload sensitive data into Aselius workspaces, you are responsible for having a lawful basis to do so. Beunec will process such data to provide the Service you requested and will not use it for third-party advertising.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Usage</h2>
                                <div className="space-y-4">
                                    <p>We use your data for the following purposes, which we consider the disclosed processing purposes under NJDPA and similar laws:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Provide Services:</strong> To operate the Aselius Platform and other Services, deliver agentic and collaboration features, authenticate users, manage workspaces, process credits, and administer your account.</li>
                                        <li><strong>Improve the Services:</strong> To analyze usage patterns, troubleshoot issues, and enhance the performance, safety, and features of our Services, using aggregated or de-identified data where reasonably practicable.</li>
                                        <li><strong>Conduct Research and Development:</strong> To develop new features and capabilities, including Rivine-related research and other internal R&amp;D, based on anonymized or aggregated data, or on data you expressly contribute to a research program. Beunec does not treat customer User Content as “internal research” training data for third-party foundation models without affirmative consent, consistent with NJDPA principles on research and sensitive processing.</li>
                                        <li><strong>Communicate:</strong> To send you service updates, security notices, or support responses. You have the option to opt out of non-essential communications in your account settings or by using unsubscribe mechanisms in emails.</li>
                                        <li><strong>Ensure Compliance and Safety:</strong> To verify user identities, maintain security, detect abuse, and prevent fraudulent activity, in compliance with regulations including N.J.S.A. 56:8-161 et seq. and applicable export and sanctions rules.</li>
                                        <li><strong>Legal obligations:</strong> To comply with law, lawful process, and enforcement of our Terms of Use.</li>
                                    </ul>
                                    <p>Data usage is limited to these purposes, ensuring transparency and user trust. We will not process personal data for materially new purposes without providing notice and, where required, obtaining consent or offering an opt-out.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Protection</h2>
                                <div className="space-y-4">
                                    <p>We are committed to protecting your data with administrative, technical, and physical safeguards appropriate to the nature of the Services:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Encryption in transit:</strong> We use TLS 1.2 or higher for HTTP/REST APIs and encrypted WebSockets for real-time features, in line with widely accepted industry practice and NIST-aligned guidance, to protect information from unauthorized interception.</li>
                                        <li><strong>Encryption at rest:</strong> Aselius Platform data stores use encryption at rest (including AES-256 class encryption for designated stores such as message content using AES-256-GCM, as described in Aselius documentation). Additional application-layer encryption may apply to connector credentials.</li>
                                        <li><strong>Access Controls:</strong> Access to user data is strictly limited to authorized personnel on a need-to-know basis through role-based access controls. Authentication for Aselius is provided via Auth0. Users sign in with passkey authentication and email verification; multi-factor authentication (MFA) is planned as enterprise and corporate teams join, and Beunec may require additional verification for certain privileged internal access.</li>
                                        <li><strong>Monitoring:</strong> We employ monitoring and threat detection and conduct security reviews, which may include third-party assessments, to prevent and respond to security incidents.</li>
                                        <li><strong>Secure Storage:</strong> Your data is stored on cloud infrastructure provided by subprocessors such as Amazon Web Services, Auth0, and other vendors bound by written terms. Beunec does not claim that all communications are end-to-end encrypted in a manner that prevents Beunec from providing the Service; encryption models vary by feature and are described more fully in the Aselius Security Disclosure for that product.</li>
                                        <li><strong>What we keep, and what we hash:</strong> Sign-in credentials are handled by Auth0 and are not stored by Beunec in plain form. A code that protects a published link is one-way hashed (so Beunec itself cannot read it back) before it is stored, and the key used to open a protected page is encrypted at rest. We keep what the Service needs to run and to bill correctly (your account, workspace, and usage records), and we do not keep a readable copy of a security credential that only you should be able to present.</li>
                                    </ul>
                                    <p>These measures are designed to comply with N.J.S.A. 56:8-161 et seq. and other applicable federal and state regulations, safeguarding the Aselius Platform, other Beunec Services, and user data. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Retention</h2>
                                <div className="space-y-4">
                                    <p>We retain data only for as long as necessary to fulfill the purposes for which it was collected, as specified by our data-governance practices and applicable law, including the Beunec Sacred Data Governance Framework where it applies to a given Service.</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Personal and account data:</strong> Retained for the duration of your active account and a reasonable period thereafter for legal, audit, security, dispute-resolution, or backup purposes.</li>
                                        <li><strong>Workspace and User Content:</strong> Retained while the workspace or account remains active, subject to owner-initiated deletion and legal holds.</li>
                                        <li><strong>Usage Data:</strong> Anonymized or aggregated data may be retained indefinitely for Service improvement.</li>
                                        <li><strong>Research Data:</strong> Retained for the duration of the research project, after which it is anonymized or securely disposed of, unless you consent to a longer period or law requires retention.</li>
                                        <li><strong>Security and abuse logs:</strong> Retained for a period reasonably necessary to detect and investigate incidents.</li>
                                    </ul>
                                    <p>Data is securely disposed of using methods aligned with NIST SP 800-88 for digital records and certified shredding for any physical copies, as per N.J.S.A. 56:8-162 where applicable. Retention schedules are reviewed periodically.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Reasons We Share Personal Data</h2>
                                <div className="space-y-4">
                                    <p>We do not sell your personal data as “sale” is commonly understood in consumer commerce. We do not sell personal data for monetary consideration. We only share personal data under the following conditions:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>With Your Consent:</strong> We will share your data with a third party if you provide your explicit consent, including when you connect a third-party application.</li>
                                        <li><strong>Service Providers / Processors:</strong> We may share data with trusted vendors and service providers (including AWS, Auth0, and other infrastructure, communications, analytics, and payment processors) who are bound by written terms to process data only on our instructions and to implement appropriate security, and who assist us in operating the Services.</li>
                                        <li><strong>What a processor receives:</strong> A model or infrastructure provider processing a Rivine engine turn receives the content of that turn and a request-scoped technical identifier (such as a billing context id), not your account profile, name, or email. Resolving that identifier back to an account requires both our own internal admin access and your own CloudHandle or account identifier; a processor holding only the technical identifier it was given cannot, on its own, trace a request to a specific individual.</li>
                                        <li><strong>Partners:</strong> Anonymized or aggregated data that is not reasonably identifiable may be shared with research or ecosystem partners. It will not contain personally identifiable information.</li>
                                        <li><strong>Legal Requirements:</strong> If required by law (for example, a court order or lawful government request), we will share the minimal amount of data necessary. Where legally permitted, we will notify you, as contemplated by N.J.S.A. 56:8-163 and similar notice principles.</li>
                                        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred under equivalent protections, with prior notice to you where required by law.</li>
                                        <li><strong>Safety and enforcement:</strong> We may share data to protect the rights, property, or safety of Beunec, our users, or the public, including to investigate Terms violations.</li>
                                    </ul>
                                    <p>We do not share personal data with third parties for their independent cross-context behavioral advertising. If that practice ever changes, we will update this Policy and provide any required opt-out, including honor of Global Privacy Control (GPC) signals where NJDPA or similar law requires a universal opt-out mechanism.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. How to Access and Control Your Personal Data; Consumer Rights</h2>
                                <div className="space-y-4">
                                    <p>Depending on your location, including under the NJDPA, CCPA/CPRA, and GDPR where applicable, you may have some or all of the following rights regarding your personal data:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><strong>Access and portability:</strong> You can view and request a copy of personal data we hold about you, including in a portable format where required.</li>
                                        <li><strong>Correct:</strong> You can update inaccurate information in your user profile at any time, and you may request that we correct data we control.</li>
                                        <li><strong>Delete:</strong> You can request the deletion of your personal data, subject to any legal retention, security, or dispute-related exceptions.</li>
                                        <li><strong>Opt-Out:</strong> You can opt out of marketing communications or, where applicable, targeted advertising, sale, or sharing of personal data, and you may use a recognized universal opt-out signal such as GPC.</li>
                                        <li><strong>Restrict or object:</strong> Where GDPR or similar law applies, you may object to or request restriction of certain processing.</li>
                                        <li><strong>Appeal:</strong> If we decline a consumer-rights request, you may appeal by emailing privacy@beunec.com with the subject “Privacy Request Appeal.”</li>
                                        <li><strong>Non-discrimination:</strong> We will not discriminate against you for exercising privacy rights, except that we may offer different prices or features that reasonably relate to the value of the data as permitted by law.</li>
                                    </ul>
                                    <p>To exercise these rights, please contact privacy@beunec.com. We will verify your request as required by law and will respond within the statutory period (including forty-five (45) days under NJDPA, which we may extend once as permitted, or thirty (30) days under GDPR where it applies). We will not charge a fee unless requests are excessive, repetitive, or manifestly unfounded, in which case we will explain our decision. Authorized agents may submit requests as permitted by applicable law, subject to verification of authority.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Cookies and Similar Technologies</h2>
                                <p>We use cookies and similar technologies to remember your preferences (including theme), authenticate your account, analyze usage patterns, and provide a personalized user experience. Essential cookies are required for security and session integrity. Analytics cookies, if used, help us understand how the public website and Services are used. You can manage non-essential cookie preferences through your browser settings. Where required by law, we will obtain consent before setting non-essential cookies. We honor Do Not Track and GPC signals as described in Section 12 to the extent technically feasible for our stack.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. Solutions Provided by You: Notice to End Users and Organizations</h2>
                                <p>This Policy applies to all users of the Services, including individual users of Aselius, visitors to beunec.co, research participants, and organizational customers. Organizational or enterprise users are responsible for ensuring their use of the Services and any data they submit complies with their internal privacy policies and any legal obligations they may have, including providing notices to their own employees, students, or customers. If you are an end user of an organization that has provisioned Aselius for you, please contact that organization for many rights requests relating to workspace content they control; Beunec will assist the organization as processor where appropriate.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">10. Aselius Platform and Other Beunec Accounts</h2>
                                <div className="space-y-4">
                                    <p><strong>Creation:</strong> Your account is created when you sign up for the Aselius Platform or another Service that requires authentication.</p>
                                    <p><strong>Security:</strong> You are responsible for securing your account credentials, including your password and CloudHandle. Enable MFA where available.</p>
                                    <p><strong>Management:</strong> You can manage your account details, privacy settings, and communication preferences in your user dashboard where those controls are offered.</p>
                                    <p><strong>Termination:</strong> You may terminate your account at any time. We will delete or de-identify your personal data as per our retention policy, subject to legal requirements and residual backup copies that are overwritten on a rolling schedule.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">11. Collection of Data from Professionals of All Levels</h2>
                                <p>We may collect data from professionals, including resumes, skills, and work preferences, solely to enhance their experience on the Services or in connection with research or recruiting simulations that you opt into. This data is used only with your consent where required, and you have control over sharing settings in your dashboard where those settings exist, ensuring transparency and compliance with NJDPA.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">12. Other Important Privacy Information</h2>
                                <div className="space-y-4">
                                    <p><strong>Children’s Privacy:</strong> The Services are not intended for users under the age of 18. We do not knowingly collect personal information from children under 18, in compliance with COPPA (15 U.S.C. § 6501) and NJDPA rules regarding known children. If we learn that we have collected personal data from a child under 18, we will delete it promptly. Please contact privacy@beunec.com if you believe we have collected such data.</p>
                                    <p><strong>International Users:</strong> Your data may be processed in the United States or other locations where we or our service providers operate. We ensure that any data transfers comply with applicable laws, including providing GDPR-appropriate safeguards (such as Standard Contractual Clauses) where necessary for transfers from the EEA, UK, or Switzerland.</p>
                                    <p><strong>Do Not Track and GPC:</strong> We honor “Do Not Track” signals from your browser and Global Privacy Control signals to the extent required and technically feasible, limiting tracking where requested, in line with NJDPA universal opt-out requirements and CCPA/CPRA principles.</p>
                                    <p><strong>Sensitive data:</strong> We will not process sensitive personal data, as defined by NJDPA or similar law, for our own independent purposes without consent, except as exempted by law (for example, to provide a Service you requested or to detect security incidents).</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">13. Artificial Intelligence, Agentic Engines, and Research and Development</h2>
                                <p>The Services use artificial intelligence and agentic systems, including Rivine engines available through the Aselius Platform (such as TaskForce, Research, Code, and Cicero, and other engines Beunec may offer when generally available), to provide features such as research reports, software delivery in sandboxes, legal-information drafting support, file assistance, and related productivity functions. Beunec does not disclose specific third-party model identifiers in this Policy. We guarantee that your personal data and User Content are not used for third-party foundation-model training without your explicit consent, except as required to operate a feature you invoked (for example, sending a prompt to a model provider acting as Beunec’s processor under contract). AI outputs may be reviewed for safety, abuse, and quality as part of our data-governance practices. Outputs can be incorrect; you should not rely on them as a sole source of truth. Human-in-the-loop approval features, where offered, do not shift legal responsibility for your use of Output. Research and experimental programs may process data you voluntarily submit under additional notices provided at the time of participation. Participation in research is optional unless it is inseparable from a Service you choose to use, in which case the processing is described at sign-up or in product documentation.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">14. Productivity and Communications Products</h2>
                                <p>Communications on the Aselius Platform (including Messages) are protected in transit using TLS/WSS and are encrypted at rest as described in Aselius documentation. Data access is restricted to authorized personnel and to workspace members according to role-based access control. We use your communication data solely to provide and improve the Service, to secure it, and to comply with law. You may opt out of non-essential communications (for example, newsletters) via your account settings. Messages is a human collaboration product and is not an AI chatbot unless Beunec later discloses otherwise in product documentation and this Policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">15. Search and Browse</h2>
                                <p>Website search, documentation browse, and in-product search features may collect usage data to improve relevance and reliability. This data is anonymized or aggregated where reasonably possible. We do not use search queries to build advertising profiles. We do not track sensitive queries for advertising, and we will not use search content for third-party advertising without your explicit consent, ensuring compliance with NJDPA.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">16. Beunec Services Generally</h2>
                                <p>All personal data across Beunec Services is processed in a transparent manner, as described in Sections 2 through 4, and in compliance with federal, New Jersey, and other applicable laws. This Policy applies uniformly to Aselius, the Beunec website, research publications hosted by Beunec, and other deployed solutions, except where a specific Service presents a supplemental notice (for example, a research-consent form) that adds to, and does not silently reduce, the protections in this Policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">17. Simulation, Experimental, and Related Services</h2>
                                <p>As part of our long-horizon research agenda, we may develop future services, including immersive training, recruitment simulations, or experimental runtimes. Data for these services will be collected with explicit user consent where required, encrypted in transit, stored securely according to the standards described in this Policy, and subject to clear opt-out options except where processing is strictly necessary to provide a Service you requested. Experimental Services may have additional residual risk; we will disclose material additional processing at the point of enrollment.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">18. Changes to the Privacy Policy</h2>
                                <p>We may update this Privacy Policy to reflect changes in our legal obligations or Services. Any changes will be effective upon posting at https://beunec.co/privacy-policy or upon notification to you. Significant changes, such as new data uses or new categories of recipients, will be communicated with at least thirty (30) days’ notice via email or in-app alerts where we have a working email for you, except where a shorter period is required for security or legal compliance. Your continued use of the Services constitutes your acceptance of the new Policy to the extent permitted by law. If you do not agree, you must stop using the Services and may request deletion under Section 7.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">19. Contact Information</h2>
                                <div className="space-y-2">
                                    <p>For privacy questions or to exercise your rights, please contact our privacy team:</p>
                                    <p>Beunec Technologies, Inc.</p>
                                    <p>971 US HIGHWAY 202N STE N BRANCHBURG, NJ 08876</p>
                                    <p>Email: privacy@beunec.com (rights requests) or support@beunec.com (general support)</p>
                                    <p>Phone: +19147503008</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
