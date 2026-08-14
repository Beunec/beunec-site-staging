"use client";

import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function TermsOfUsePage() {
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
                        <h1 className="text-4xl md:text-5xl font-serif mb-4">Terms of Use</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground mb-12 pb-8 border-b border-border">
                            <p className="font-medium">Beunec Technologies, Inc.</p>
                            <p>Terms of Use for the Aselius Platform and all Beunec Services</p>
                            <p>Effective Date: April 30, 2025</p>
                            <p>Last Updated: August 14, 2026</p>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-muted-foreground">
                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                                <p>Welcome to the products, websites, research programs, and related offerings of Beunec Technologies, Inc., a corporation registered in the State of New Jersey, United States of America (“Beunec,” “we,” “us,” or “our”). These Terms of Use (“Terms”) govern your access to and use of all Beunec Services, including without limitation: (a) the Aselius Platform (also referred to as “Aselius”), currently made available at https://aselius.beunec.com, together with Workspace, Manage Files, Messages, Manage Teams, Credits, Connector, Governance, and related applications; (b) the public website at https://beunec.co and any associated documentation, publications, audio, and informational materials; (c) research, experimental, and development programs, including without limitation materials relating to Rivine, Brolostack, Agentic Infrastructure, and other research initiatives Beunec may publish or operate; (d) application programming interfaces, software development kits, connectors, sandboxes, preview environments, and integrations, whether generally available or offered as beta, alpha, or research access; and (e) any other software, service, or solution that Beunec deploys, licenses, or makes available now or in the future, including successor products to former offerings previously described as “Beunec Cloud” (collectively, the “Services”). The name “Beunec” and related marks are trademarks of Beunec Technologies, Inc. (including applications pending or registered with the United States Patent and Trademark Office), and all associated intellectual property is owned by Beunec Technologies, Inc. or its licensors. Aselius is Beunec’s software-as-a-service platform for governed agentic work; it is a Service under these Terms and does not exhaust the scope of these Terms.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">2. Acceptance of Terms</h2>
                                <p>By accessing or using any of the Services, including the Aselius Platform, the Beunec website, research materials, or any other Beunec product or solution (together with any product that incorporates Beunec intellectual property), you (“User,” “you,” or “your”) agree to be legally bound by these Terms, our Privacy Policy located at https://beunec.co/privacy-policy, and our Data Readiness Policy located at https://beunec.co/data-readiness-policy. If you use the Services on behalf of an organization, you represent and warrant that you have authority to bind that organization, and “you” includes that organization. Your use of the Services constitutes your acceptance of these Terms as a binding contract. You also agree to comply with all applicable laws, including the New Jersey Data Privacy Act (NJDPA), N.J.S.A. 56:8-166.1 et seq., other applicable United States federal and state privacy, consumer-protection, and intellectual-property laws, and, where applicable, the EU General Data Protection Regulation (GDPR), the UK GDPR, and the California Consumer Privacy Act as amended by the California Privacy Rights Act (CCPA/CPRA). If you do not agree to these Terms, you may not access or use the Services. If you have entered into a separate written enterprise, research, or services agreement with Beunec that expressly governs a particular Service, that written agreement will control to the extent of a direct conflict with these Terms with respect to that Service only.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">3. Description of Research, Deployment, and Services</h2>
                                <p>Beunec is a research and deployment organization. The Services include commercially deployed products, research publications, experimental programs, and development work. The Aselius Platform provides a unified, governed agentic workspace with features that may include secure file management, specialized Rivine agentic engines, encrypted messaging at rest and in transit as described in our Privacy Policy and Security Disclosure, customizable workspaces, team collaboration, connectors to third-party applications you authorize, prepaid credits, and various pricing plans (including a free Base tier, Pro subscription, Essential subscription, and usage-based prepaid credit packs, as described in then-current plan documentation). Research and experimental Services, including Rivine-related research, Brolostack, and other programs Beunec may announce, may be incomplete, change without notice, or be withdrawn. The Services are provided on an “as is” and “as available” basis. Beunec does not warrant that any Service will be uninterrupted, error-free, or suitable for any particular high-stakes decision. You accept and agree that any use of outputs from agentic, generative, or research features is at your sole risk, and that such outputs are not a substitute for professional legal, medical, financial, engineering, or other licensed advice. Human review is required before relying on outputs for high-stakes decisions.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">4. Eligibility; User Responsibilities</h2>
                                <div className="space-y-4">
                                    <p><strong>4.1 Eligibility and age.</strong> You must be at least eighteen (18) years of age to create an account or use the Services. The Services are not directed to children, and Beunec does not knowingly provide the Services to persons under 18. If you are accessing the Services on behalf of an educational, governmental, or enterprise organization, you additionally represent that your use complies with that organization’s policies and applicable procurement, student-privacy, and public-records rules.</p>
                                    <p><strong>4.2 Compliance:</strong> You agree to use the Services in compliance with all federal, state (including New Jersey), and local laws, including but not limited to the NJDPA, N.J.S.A. 56:8-161 et seq. (Identity Theft Prevention Act), export-control and sanctions laws, and labor regulations (e.g., 29 U.S.C. § 201 et seq.). You are solely responsible for your actions and for complying with any agreements related to your use of the Services, including third-party terms that apply to applications you connect through Connector, MCP, OAuth, or similar integrations.</p>
                                    <p><strong>4.3 Account Management:</strong> You are responsible for all activities that occur under your account. You agree to provide accurate and complete information during account creation and to keep it updated. You will not share credentials, impersonate others, or create accounts by automated means without Beunec’s written permission.</p>
                                    <p><strong>4.4 Authentication Verification Process:</strong> Users may be required to undergo authentication via Auth0 or another identity provider designated by Beunec to ensure authenticity and comply with Beunec’s security standards. Upon successful authentication, you will be able to select and manage your unique CloudHandle (previously described in legacy materials as a “Beunec Cloud Handle”).</p>
                                    <p>The CloudHandle is a unique, user-assigned identity that acts as your digital identifier within the Aselius Platform and, where applicable, other Beunec Services. The general format historically used is {"{username}"}@beunec.cloud. Special domains may exist for specific user groups, such as {"{username}"}@beunec.cloud.edu for educational users and {"{username}"}@beunec.cloud.gov for government users, if and when Beunec enables those domains. Your CloudHandle is required for logging in, accessing features, and is used for secure file sharing, messaging, and collaboration within the Aselius Platform and other Beunec solutions that use the same identity system.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">5. Personal, Professional, and Organizational Use; No Unauthorized Commercial Exploitation</h2>
                                <p>The Services are intended for personal, professional, research, and organizational use to enhance productivity, collaboration, and governed agentic work. They are not for unauthorized commercial exploitation, such as reselling access to the Services or their features, sublicensing Beunec software, or operating a service bureau using Beunec’s systems without a written agreement. Limited commercial use, such as under an organizational subscription or a specific enterprise agreement, is permitted only with the explicit written approval of Beunec Technologies, Inc. or under the then-current paid plan terms. You may not use the Services to develop competing services that copy Beunec’s non-public software, orchestration, or documentation; distribute Beunec content without written consent; or engage in unauthorized data extraction, scraping, or bulk harvesting of the Services or of other users’ content.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">6. Privacy and Protection of Personal Information</h2>
                                <p>Your use of the Services is governed by our Privacy Policy, which details how Beunec Technologies, Inc. collects, stores, processes, and protects your personal data across the Aselius Platform, the Beunec website, research programs, and other deployed solutions. By using the Services, you consent to the data practices described in that policy to the extent consent is a valid legal basis. Where another legal basis is required (for example, under GDPR), Beunec will process personal data as described in the Privacy Policy. Organizational customers are controllers of personal data they submit about their personnel and end users, except to the extent Beunec independently determines the purposes and means of processing as described in the Privacy Policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">7. Content; Input and Output</h2>
                                <div className="space-y-4">
                                    <p><strong>7.1 Beunec Content:</strong> All content, including but not limited to text, graphics, logos, documentation, research publications, software, models, prompts that Beunec authors, orchestration logic, and user interfaces, made available through the Services by Beunec Technologies, Inc. is the exclusive property of Beunec or its licensors and is protected by copyright, trademark, trade-secret, and other intellectual property laws. These Terms do not transfer ownership of Beunec Content to you. You receive a limited, revocable, non-exclusive, non-transferable license to access Beunec Content solely as necessary to use the Services in accordance with these Terms.</p>
                                    <p><strong>7.2 User Content and Input:</strong> You retain all ownership rights, to the extent you have them, in the data, files, prompts, attachments, messages, and information you create, store, or transmit through the Services (“User Content” or “Input”). You represent and warrant that you have all rights necessary to provide Input and to grant the licenses in these Terms, and that Input does not infringe third-party rights or violate law.</p>
                                    <p><strong>7.3 Output:</strong> The Services may generate text, code, documents, media, diagrams, and other materials in response to Input (“Output”). As between you and Beunec, and to the extent permitted by applicable law, you own Output. Beunec hereby assigns to you all of Beunec’s right, title, and interest, if any, in and to Output. Output may not be unique, and other users may receive similar output. You are responsible for evaluating Output, including for accuracy, intellectual-property clearance, confidentiality, and fitness for purpose, before you use or publish it. Output is not legal advice, medical advice, investment advice, or a certified professional opinion.</p>
                                    <p><strong>7.4 License to operate the Services:</strong> By using the Services, you grant Beunec Technologies, Inc. a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, transmit, reproduce, modify (for formatting, security, and delivery), display, and otherwise use User Content and Output solely for the purpose of providing, maintaining, securing, troubleshooting, and improving the Services, complying with law, and preventing abuse. This includes using aggregated and anonymized data that does not identify you for service improvement and internal research and development. Your personal data will not be used to train third-party foundation models without your explicit consent, except as otherwise disclosed in the Privacy Policy or a separate written agreement. Beunec does not claim ownership of your Input by virtue of this license.</p>
                                    <p><strong>7.5 Similarity; no confidentiality of prompts sent to shared research surfaces.</strong> Because agentic and generative systems may produce similar Output for similar Input, Beunec does not warrant that Output is exclusive to you. Content you submit to public websites, public research pages, or unauthenticated surfaces is not confidential.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">8. Software</h2>
                                <p>Any software provided by Beunec as part of the Services, including client applications, sandboxes, preview runtimes, and documentation tools, is licensed, not sold, to you. You may not copy, modify, distribute, sell, or lease any part of our software or reverse engineer or attempt to extract the source code, unless such restrictions are prohibited by law. You may not use Output to train competing general-purpose models that replicate Beunec’s Services, except that you may use Output in the ordinary course of your own internal business or research, including to develop classifiers or internal tools that are not offered as a competing agentic platform.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">9. Documents and Research Publications</h2>
                                <p>Documents made available through the Services (for example, user agreements, research summaries, platform documentation, and experimental-project write-ups) are the property of Beunec Technologies, Inc. or are licensed to us. You may access them for personal, professional, or internal organizational use but may not redistribute, scrape, or alter them for commercial publication without our express written permission, in compliance with applicable copyright law. Research publications describe Beunec’s work and are not warranties of product performance. Experimental and research Services may differ from generally available Aselius Platform features.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">10. Fees, Credits, and Taxes</h2>
                                <p>Certain Services require payment of subscription fees, prepaid credits, or usage charges as described in then-current plans and in-product billing terms, including Aselius Base, Pro, and Essential plans and prepaid credit packs. Credits may be consumed by rivine agentic engines, mediator,  usage and may include infrastructure fees as disclosed in plan documentation. Unless a separate written agreement or a statutory right requires otherwise, fees are non-refundable once credits are consumed or a billing period has commenced. Beunec does not presently publish a standalone refund-policy webpage; billing questions, including any request Beunec may grant in its discretion, should be directed to support@beunec.com. You are responsible for applicable taxes. Beunec may change prices upon notice as described in Section 23, except that prepaid unused credits will be honored in accordance with the terms under which they were purchased, unless required otherwise by law.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">11. Limitation of Liability; Disclaimer of Warranties</h2>
                                <div className="space-y-4">
                                    <p>THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” EXCEPT TO THE EXTENT PROHIBITED BY LAW, BEUNEC TECHNOLOGIES, INC. AND ITS AFFILIATES AND LICENSORS MAKE NO WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, OR UNINTERRUPTED OR ERROR-FREE OPERATION.</p>
                                    <p>TO THE FULLEST EXTENT PERMITTED BY LAW, BEUNEC TECHNOLOGIES, INC., ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (i) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES, INCLUDING THE ASELIUS PLATFORM AND ANY RESEARCH OR EXPERIMENTAL OFFERING; (ii) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON OR CONNECTED TO THE SERVICES; (iii) ANY CONTENT OR OUTPUT OBTAINED FROM THE SERVICES; AND (iv) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.</p>
                                    <p>TO THE FULLEST EXTENT PERMITTED BY LAW, BEUNEC’S AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO BEUNEC FOR THE SERVICE GIVING RISE TO THE CLAIM DURING THE TWELVE (12) MONTHS BEFORE THE LIABILITY AROSE, OR (B) ONE HUNDRED UNITED STATES DOLLARS (USD $100). THESE LIMITATIONS APPLY EVEN IF A REMEDY FAILS OF ITS ESSENTIAL PURPOSE, AND APPLY ONLY TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE JURISDICTIONS, BEUNEC’S LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED.</p>
                                    <p>BEUNEC TECHNOLOGIES, INC. AND ITS AFFILIATES WILL NOT BE RESPONSIBLE FOR A USER’S MISUSE, MISTAKES, OR MISUNDERSTANDINGS. USER AND SITE AUDIENCES WAIVE THEIR RIGHTS TO TAKE LEGAL ACTIONS AGAINST BEUNEC TECHNOLOGIES, INC., ITS INTELLECTUAL PROPERTIES (IPS), AND ITS AFFILIATES EXCEPT AS EXPRESSLY PERMITTED BY THESE TERMS AND MANDATORY LAW. USER AND SITE AUDIENCES ARE LEGALLY BOUND TO OUR TERMS OF USE, PRIVACY POLICY, AND DATA READINESS POLICY IMMEDIATELY UPON ACCESSING THIS SITE, USING THE ASELIUS PLATFORM, OR USING OTHER BEUNEC PRODUCTS OR PRODUCTS THAT HAVE TRACES OF ITS IP. USERS ARE SOLELY RESPONSIBLE FOR THEIR OWN CONDUCT WHEN FILE SHARING, COMMUNICATING, NETWORKING, OR COLLABORATING WITH OTHER USERS ON THE ASELIUS PLATFORM AND OTHER SOLUTIONS.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">12. User Persona Account, Password, and Security</h2>
                                <p>You are responsible for protecting your login information, CloudHandle, and any Beunec or Aselius account identifiers. You must notify Beunec immediately of any unauthorized use or breach of security at support@beunec.com. While Beunec implements various security measures, including encryption in transit and at rest as described in our Privacy Policy and, for Aselius, our Security Disclosure, and may offer multi-factor authentication, you acknowledge that no system is completely secure, and you are responsible for maintaining the confidentiality of your account credentials. If you are under 18, you are not of the required age to access the Services. Please contact us at support@beunec.com for any inquiry.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">13. User Persona Dashboard</h2>
                                <p>The Services, including the Aselius Platform, may provide various dashboards tailored to different user personas, including professionals, researchers, students, and teams, to provide a customized user experience. Dashboards, role labels, and persona views are convenience features and do not expand your legal rights beyond these Terms and any written agreement you have with Beunec.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">14. No Unlawful or Prohibited Use</h2>
                                <div className="space-y-4">
                                    <p>You may not use the Services for any purpose that is unlawful or prohibited by these Terms. Prohibited activities include, but are not limited to:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Illegal activities, including fraud or unlawful discrimination, as prohibited by N.J.S.A. 10:5-12 and other applicable law.</li>
                                        <li>Unauthorized access, hacking, credential stuffing, or data scraping of the Services or their users.</li>
                                        <li>Posting harmful, obscene, or misleading content, or attempting to generate such content through the Services.</li>
                                        <li>Disrupting Service functionality, such as by uploading malware, viruses, or other harmful code, or by overloading sandboxes or infrastructure.</li>
                                        <li>Using the Services to develop, probe, or deploy cyber attacks, to violate another party’s security, or to attempt to extract hidden system prompts, model weights, or non-public orchestration details.</li>
                                        <li>Using Output as the sole basis for decisions with legal, medical, credit, employment, housing, or similarly significant effects on individuals without qualified human review.</li>
                                        <li>Violating export controls, sanctions, or anti-money-laundering rules, or using the Services in embargoed jurisdictions where Beunec is prohibited from providing them.</li>
                                    </ul>
                                    <p>Violations of this section may lead to immediate account suspension or termination, preservation of data as required by law, and potential legal action. Beunec may investigate and report unlawful activity to competent authorities where required or permitted by law.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">15. Use of Services and Solutions; Third-Party Perks and Connectors</h2>
                                <div className="space-y-4">
                                    <p><strong>15.1 Use of Beunec or Aselius Perks:</strong></p>
                                    <p><strong>A. Disclosure:</strong> Beunec Technologies, Inc. may have strategic alliance or partnership agreements with various providers to display perks to users of the Aselius Platform or other Beunec Services. These perks are offered as a brand-marketing opportunity to the perk’s provider. To redeem a perk, you may receive a perk code. You may be required to show your CloudHandle or Aselius account identifier to confirm authenticity. Each perk is subject to its provider’s terms and may be redeemable only once. If a perk code is invalid, you must contact support@beunec.com with the subject “Aselius Perk Code Invalid Report” and include your valid CloudHandle or account identifier for verification.</p>
                                    <p><strong>B. Disclaimer:</strong> Beunec Technologies, Inc. offers perks on an “as is” basis and makes no warranties or guarantees about their value, suitability, or availability. You are solely responsible for evaluating the merits of any perk and for any decisions you make based on the information provided. We are not responsible for any damages or losses resulting from the use of any perks, including financial losses or personal injuries.</p>
                                    <p><strong>15.2 Third-party services and connectors.</strong> The Services may permit you to connect third-party applications (for example, through OAuth, MCP, or similar protocols). Those third-party services are not controlled by Beunec. Your use of them is subject to the third party’s terms and privacy policy. Beunec is not responsible for third-party content, availability, or security practices. You authorize Beunec to exchange data with a connected service only as needed to provide the integration you enabled, and you may revoke connections in product settings where that control is offered.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">16. Materials Provided to Beunec or Posted at Any Beunec Website</h2>
                                <p>Any materials you submit to the Services, such as feedback, suggestions, or profile information, must be lawful and non-infringing. By submitting these materials, you grant Beunec Technologies, Inc. a non-exclusive, royalty-free, perpetual, and irrevocable license to use, modify, and incorporate them to improve our Services, provided that we will not publicly attribute unpublished confidential feedback to you without your consent. You retain your moral rights under 17 U.S.C. § 106A unless otherwise agreed upon in writing. Feedback is voluntary and you are not entitled to compensation.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">17. Notices and Procedure for Making Claims of Copyright Infringement</h2>
                                <div className="space-y-4">
                                    <p>Beunec Technologies, Inc. respects the intellectual property rights of others and adheres to the Digital Millennium Copyright Act (DMCA) (17 U.S.C. § 512). To report copyright infringement, please provide a written notice to our Designated Agent with the following information:</p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                                        <li>Identification of the copyrighted work claimed to have been infringed.</li>
                                        <li>Identification of the material that is claimed to be infringing and its location on the Services.</li>
                                        <li>Your contact information, including your address, telephone number, and email address.</li>
                                        <li>A statement that you have a good-faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                                        <li>A statement that the information in the notification is accurate, and, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</li>
                                    </ul>
                                    <p><strong>Designated Agent:</strong></p>
                                    <p>Beunec Technologies, Inc.<br />971 US HIGHWAY 202N STE N BRANCHBURG, NJ 08876<br />Email: info@beunec.com</p>
                                    <p>Beunec will investigate and may remove content, notifying the poster of the claim and following counter-notice procedures under the DMCA. Repeat infringers’ accounts may be terminated in appropriate circumstances.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">18. Links to Third-Party Sites</h2>
                                <p>The Services may contain links to third-party websites. These links are provided for your convenience, and Beunec is not responsible for the content, practices, or security of these sites. The inclusion of a link does not imply endorsement by Beunec. You access these sites at your own risk, as per New Jersey contract law and these Terms.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">19. Unsolicited Idea Submission Policy</h2>
                                <p>Beunec Technologies, Inc. does not accept or consider unsolicited ideas, suggestions, or materials to avoid potential disputes. By submitting any such materials, you waive any claims for compensation or attribution and grant Beunec a non-exclusive, royalty-free license to use them for any purpose, as per N.J.S.A. 2A:14-1, except where mandatory law provides otherwise. Formal idea submissions should only be made through official channels under a signed NDA.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">20. Suspension, Termination, and Research Access</h2>
                                <p>Beunec may suspend or terminate access to any Service, including the Aselius Platform and research or experimental programs, if you materially breach these Terms, if required by law, or if continuation would create security, legal, or operational risk. Beunec may discontinue a Service or a feature; if Beunec discontinues a paid Service entirely, Beunec will provide reasonable advance notice and, where required by law or by the applicable plan terms, a refund of prepaid unused fees for that discontinued Service. Research and experimental access may be revoked at any time. Upon termination, your license to use the Services ends, and Beunec may delete User Content in accordance with the Privacy Policy and Data Readiness Policy, except where retention is required by law or for legitimate security, dispute, or audit purposes.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">21. Indemnification</h2>
                                <p>You will indemnify, defend, and hold harmless Beunec Technologies, Inc., its affiliates, and their officers, directors, employees, and agents from and against any claims, damages, losses, and expenses (including reasonable attorneys’ fees) arising out of or relating to: (a) your Input or your use of Output; (b) your use of the Services in violation of these Terms or applicable law; (c) your infringement of a third party’s rights; or (d) your organization’s end users, if you are an organizational customer, except to the extent caused by Beunec’s willful misconduct.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">22. Dispute Resolution</h2>
                                <div className="space-y-4">
                                    <p><strong>22.1 Informal Resolution:</strong> In the event of a dispute arising out of or relating to these Terms or the Services (a “Dispute”), you agree to first contact support@beunec.com to attempt to resolve the issue informally. Beunec will respond within seven (7) business days.</p>
                                    <p><strong>22.2 Mediation:</strong> If the Dispute is not resolved informally, you agree to engage in non-binding mediation in New Brunswick, New Jersey, with shared costs, within thirty (30) days of the informal resolution failing.</p>
                                    <p><strong>22.3 Arbitration:</strong> If mediation fails, any unresolved Dispute will be settled by binding arbitration under the rules of the American Arbitration Association (AAA) in Somerset County, New Jersey, before a single arbitrator. YOU AGREE TO WAIVE YOUR RIGHT TO A CLASS ACTION LAWSUIT, AND ALL CLAIMS MUST BE BROUGHT ON AN INDIVIDUAL BASIS, EXCEPT WHERE SUCH WAIVER IS UNENFORCEABLE UNDER MANDATORY LAW. This arbitration provision does not apply to: (a) individual claims that may be brought in small-claims court; or (b) intellectual property disputes or requests for injunctive relief to stop unauthorized use of the Services, which may be brought in a court of competent jurisdiction. You may opt out of this arbitration agreement by sending written notice to info@beunec.com within thirty (30) days of first accepting these Terms (or of the effective date of a material update to this Section 22.3), stating your name, CloudHandle or account email, and that you opt out of arbitration.</p>
                                    <p><strong>22.4 Governing Law:</strong> These Terms and any Disputes arising from them will be governed by the laws of the State of New Jersey, USA, without regard to its conflict of law principles. Any non-arbitrable disputes will be litigated in the state or federal courts located in or for Middlesex County, New Jersey, and you consent to personal jurisdiction there.</p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">23. Changes to the Terms of Use</h2>
                                <p>Beunec Technologies, Inc. reserves the right to update these Terms at any time. The updated Terms will be effective upon posting at https://beunec.co/terms-of-use or upon notification to you. Significant changes will be communicated with at least thirty (30) days’ notice, except where a shorter period is required to address security, legal, or abuse issues. Your continued use of the Services after the effective date of the changes constitutes your acceptance of the new Terms. If you do not agree, you must stop using the Services and may request account closure under the Privacy Policy.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">24. Miscellaneous</h2>
                                <p>If any provision of these Terms is held unenforceable, it will be modified to the minimum extent necessary to make it enforceable, and the remaining provisions will remain in effect. Beunec’s failure to enforce a provision is not a waiver. You may not assign these Terms without Beunec’s consent; Beunec may assign them in connection with a merger, acquisition, or sale of assets. These Terms, together with the Privacy Policy and Data Readiness Policy, constitute the entire agreement between you and Beunec regarding the Services, except for any separate written enterprise or research agreement. Headings are for convenience only.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-foreground mb-4">25. Contact Information</h2>
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
