# Security and data handling disclosure

This page explains how Aselius, Beunec's agentic infrastructure software, protects your account, your data and the work your Rivine engines produce. It also states plainly what we do not do, so you can decide whether Aselius fits your security requirements.

## At a glance
- **What it is:** Beunec's public security and data handling overview for Aselius.
- **Best for:** Enterprise customers, security reviewers, startups and teams evaluating Aselius for production use.
- **You get:** Role-based access, TLS 1.2+ in transit, AES-256 at rest, isolated sandboxes, scoped connectors and clear retention rules.
- **Not offered:** End-to-end encryption. The platform can read your data in order to run engines, search and governance.
- **Report a vulnerability:** Email [contact@beunec.com](mailto:contact@beunec.com) or [support@beunec.com](mailto:support@beunec.com). We acknowledge within 48 hours.
- **Data location:** United States.
- **Last updated:** August 2026 (version 1.0).

Aselius is built for teams handling sensitive work: code, legal documents, research and proprietary data. We protect it in layers: authentication, encryption, isolation and role-based access. If a security question is not answered here, ask us (see Contact below).

## Authentication

- **Sign-in:** Through our identity provider, using an industry-standard OpenID Connect flow.
- **Methods:** Username and password, passwordless sign-in, or social login with Google, GitHub or Microsoft.
- **Passkey authentication and email verification:** Sign in with a passkey on your device, and new sign-ins are confirmed by email. This keeps access quick and simple while keeping security high.
- **Multi-factor authentication (MFA):** Planned. We will add it as enterprise and corporate teams join; until then, passkeys and email verification protect every account.
- **Sessions:** Every request and every real-time connection is checked against a signed, time-limited session. You will be asked to sign in again periodically.
- **Signing out:** Ends your session on that device.
- **Enterprise single sign-on:** SAML and OIDC single sign-on (SSO) is available for enterprise accounts, so access reviews can run in your own identity provider.

## Access control by role

Aselius uses role-based access control (RBAC). Roles apply per workspace, so you can hold different roles in different workspaces.

| Role         | Workspace access     | Governance  | Taskspace | Credits             | Files     |
| ------------ | -------------------- | ----------- | --------- | ------------------- | --------- |
| **Owner**    | Full                 | Create/edit | Full      | Manage plan/billing | Full      |
| **Operator** | Manage members/share | Create/edit | Full      | Read credits        | Full      |
| **Member**   | Use taskspaces       | Read only   | Full      | Read credits        | Full      |
| **Guest**    | View only            | Read only   | View only | N/A                 | View only |

- **Invitation only:** You join a shared workspace by explicit invitation. Workspaces have no public links.
- **Checked on the server:** Every request is checked against your membership and role on our servers. A request for a workspace you do not belong to is refused.
- **Rate limits:** Requests are rate limited per user, with limits that depend on your plan.

> **Note:** Publishing a deliverable to the [Preview app](/aselius-platform/docs/preview-app) is separate from workspace access. You choose each publication's access (code access, Open or Members only), and it shows only that one snapshot.

Organization roles in Manage Teams (Owner, Admin, Member) are covered in [Manage Teams](/aselius-platform/docs/manage-teams).

## Encryption

### In transit
- **HTTPS (TLS 1.2+)** for all web and API traffic.
- **Encrypted WebSocket (WSS)** for real-time messaging and Rivine streaming.
- **HTTPS only:** Browsers are told to connect to Aselius over HTTPS only.
- **Forward secrecy:** Each connection uses its own temporary session key.
- **Certificates:** Standard publicly trusted certificates, issued and renewed by a managed certificate service.

### At rest

| Data | How it is protected |
| ---- | ------------------- |
| **Workspace assets** (Taskspace files, code, research outputs) | Encrypted at rest with AES-256. Sensitive metadata gets an extra layer of encryption. |
| **Message content** | Encrypted with AES-256 per workspace before it is stored. Decrypted only when served to an authorized member. |
| **File attachments** | Stored privately with AES-256 encryption. No public read access; downloads use time-limited links only. |
| **Connector credentials** (API keys, OAuth tokens) | Encrypted separately with dedicated keys. Never logged, never cached in plain text, never shown to agents. |
| **Backups** | Encrypted with the same protection as live data. |

### Key management
- **Managed keys:** Our cloud provider's key management service holds the primary encryption keys.
- **Customer-managed keys:** Available for enterprise contracts.
- **Rotation:** Keys that protect connector credentials are rotated annually.
- **No secrets in code:** Secrets are kept in a managed secrets store, never in source code or configuration files.

## Sandbox isolation

Rivine Code, and other engine steps that run code, execute inside sandboxes run by our sandbox provider.

- **Isolated and ephemeral:** Each session gets its own sandbox. It cannot reach other sandboxes or other users' sessions.
- **Cleaned up:** The sandbox's files are deleted when the session ends.
- **Resource limits:** Memory, CPU and run time are capped for every session.
- **What survives:** Only what is saved to Assets. When a Rivine Code turn completes, its project tree is saved to Assets as a versioned code project, opened only through your signed-in account.
- **Run output:** Output from code runs appears in the taskspace, where workspace members who can view it will see it. We redact strings that look like secrets, but do not print secrets in your code.

## Connectors, OAuth scopes and revocation

### Supported connectors
- **Native (RCP) apps:** Gmail, Microsoft 365, Supabase, Firebase, MongoDB, Stripe, GitHub and more.
- **Enterprise (MCP) apps:** Notion, Linear, Slack, Asana, Airtable, Google Drive, Figma, Zapier and more than 10 others.

### How connecting works
1. Click **Connect** for an app on the **Connector** page.
2. You are sent to that app's own sign-in and consent screen.
3. Approve the specific scopes Aselius asks for, such as reading email or writing tasks.
4. The app sends you back to Aselius, which stores the resulting token encrypted.
5. Engines can now use that connector, only within the scopes you approved.

### Scopes and safeguards
- **Per user:** Each connection belongs to the person who connected it.
- **Least scope:** Each connector asks only for what it needs. For example, Gmail asks to read and send mail, not for calendar or contacts.
- **Broader scopes only when required:** For example, Stripe needs transaction scopes.
- **No passwords:** We never ask for your password for a connected app. Connections use OAuth tokens only.
- **No raw credentials for agents:** Engines never see your tokens. Every connector action goes through governed checks.
- **You approve actions:** Before an engine acts in a connected app, it shows you the exact action with **Deny** and **Approve & run**. When it needs input from you, it asks one question and waits.

### Revocation
- Revoke any connection from the **Connector** page at any time.
- Revoking deletes the stored credential and notifies the third-party app.
- Engines lose access to that connector immediately.

## Personal data we collect and why

| Category | Data | Why |
| -------- | ---- | --- |
| **Required** | Email address | Sign-in and account notices |
| **Required** | CloudHandle (the username you choose) | Your identity for invites, connections and sharing |
| **Required** | Display name, and an optional domain alias | How you appear to others |
| **Required** | Workspace membership and team information | Access control and collaboration |
| **Optional** | Files you upload | Your choice, for the work you ask engines to do |
| **Optional** | Location | Used only if you grant browser location permission |
| **Optional** | Chat messages | Your conversations, stored encrypted |

**What we do not collect:**
- **Phone numbers:** We do not ask for one to create or use your account. If you link a chat app channel, we keep that link so requests sent there run on your wallet ([Messaging channels](/aselius-platform/docs/messaging-channels)).
- **Payment card details:** Our payment processor handles payments. We see only transaction metadata.
- **Profiling data:** We do not keep browsing history or IP logs for profiling.

## Personal data in AI outputs

Rivine engines are designed to:
- Flag personal data (names, emails, phone numbers, Social Security numbers, card details) in outputs before delivery.
- Decline requests to generate fake personal data.
- Leave internal infrastructure details out of the error messages you see.

If a deliverable contains sensitive data, edit it in the **Preview Panel** before you share or download it.

## Data retention

| Data | Retained |
| ---- | -------- |
| Chat messages | For the life of the workspace, or until an Owner deletes them |
| Taskspace assets | Until you delete them |
| Aggregated billing records | 7 years (legal and tax requirement) |
| Session logs | Purged after 90 days |
| Deleted workspaces | Permanently removed within 30 days |
| Backups | Deleted after 7 days |
| Earlier versions of files | Deleted after 90 days |

## File and asset security

### Upload validation
- **Blocked types:** Executables (such as `.exe`, `.sh`, `.bat`), archives (such as `.zip`, `.rar`) and other potentially dangerous file types.
- **Size limits:** 200 MB per file in Workspace, 100 MB per file in Messages.
- **Content checks:** Our servers check that each file's content matches the type it claims to be.

### Who can open your assets
- **Your files:** Only you, and workspace members whose role allows it.
- **Engine-generated assets:** Saved with their engine, date and citation details. Visible to workspace members.
- **Shared assets:** Shared through workspace roles or time-limited links. There is no public index of files.
- **Versions:** Saved outputs, including code projects, are kept as versioned snapshots that cannot be changed after the fact.

### Time-limited download links
- A download link stops working after a short time, typically one hour.
- Every download gets a fresh link.
- Links work only for the signed-in account they were created for. Another account cannot use them.

## Governance, audit and transparency

### Workspace governance
Owners can set:
- **System instructions:** Role descriptions and behavioral guidelines for engines in the workspace.
- **Content restrictions:** Prohibited topics and content filter rules.
- **Access policies:** Which roles can share, invite or manage taskspaces.

The platform enforces governance rules on every engine run in that workspace. They are not just a display preference.

### Audit and transparency
- **Run records:** Every Rivine engine run is recorded with the user, engine, start and end time, token usage and credits debited.
- **Owner visibility:** Owners can review usage activity in the **Credits** app.
- **Your choice is shown:** The engine and specialty you chose for a turn appear in the taskspace next to the result. The engine you pick is the engine that runs.
- **Internal agent logs:** Logs of internal agent decision-making are not shown to users.

### Compliance roadmap

| Framework | Status |
| --------- | ------ |
| **GDPR** | Deletion and export requests supported. Privacy impact assessment in progress. |
| **SOC 2** | Audit in scope for H2 2026. Report expected Q2 2027. |
| **HIPAA** | Not yet in scope. It would need a BAA and additional controls. |
| **CCPA** | Supported. California privacy disclosures are available. |

## What we do not do

- **End-to-end encryption (E2EE):** Your data is encrypted at rest, but the platform decrypts it to serve you, so our servers can read it. We chose this on purpose: E2EE would rule out AI search, workspace-wide governance and multi-agent collaboration. If you need true E2EE, Aselius is not the right choice for that work.
- **Our own hardware security modules (HSMs):** Keys are managed through our cloud provider's key management service. Dedicated arrangements can be discussed for enterprise contracts case by case.
- **Unannounced penetration testing by users:** We run regular internal security audits. Arrange external testing with us in advance through the security contact below, not ad hoc.

## Sandboxes and temporary data

- Sandboxes do not persist between sessions. Only what is saved to Assets survives.
- Each sandbox is isolated from every other user's.
- Output captured from code runs may appear in the taskspace. Strings that look like secrets are redacted.

## Third-party risk

- **What we depend on:** An identity provider, a cloud infrastructure provider, a sandbox provider, a payment processor, and the third-party apps you choose to connect.
- **How far a compromise reaches:** A compromise of a core provider could affect Aselius. A compromise of an app you connect affects only that connector's scopes.
- **Monitoring:** We watch our providers' status pages and security advisories. Ask us about specific vendors (see Contact below).

## Reporting a vulnerability

> **Note:** Do not report a security vulnerability in a public GitHub issue or any other public place.

Email **[contact@beunec.com](mailto:contact@beunec.com)** or **[support@beunec.com](mailto:support@beunec.com)** with:
1. The affected component (for example Workspace, Messages or Rivine Code).
2. Steps to reproduce.
3. The potential impact on confidentiality, integrity or availability.

We will credit you unless you ask to stay anonymous.

## Response commitments

| Stage | Commitment |
| ----- | ---------- |
| Acknowledgment | Within 48 hours |
| Critical fix | Under 7 days |
| High-severity fix | 14 days |
| Medium-severity fix | 30 days |
| Public disclosure | Coordinated with you on a shared timeline |
| Incident affecting your account | You are notified within 24 hours |

When we find a security issue ourselves, or someone reports one, we fix it on these timelines and tell affected customers. We will not hide security shortcomings or promise features we do not have. We update this page as our security posture changes and announce new limitations in the product and by email to affected users.

## For security reviewers and enterprises

### What you can request
- **Architecture review:** Detailed security architecture, reviewed under NDA.
- **Penetration test results:** Available with enterprise contracts.
- **SOC 2 status:** Audit in progress, report expected Q2 2027.
- **Data residency:** Data is stored in the United States.
- **Your own keys:** Customer-managed encryption keys are supported.
- **Questionnaires:** Security and risk questionnaires and ISO 27001 alignment. Contact sales.

### Fitting Aselius into your security program
- **Inventory:** Track the workspaces, taskspaces and assets Aselius holds in your SaaS inventory.
- **Access reviews:** Use enterprise SSO (SAML or OIDC) to run access reviews in your own identity provider.
- **Data classification:** Tag a workspace in governance, for example as "confidential" or "internal".
- **Incident notification:** We notify you within 24 hours of a security incident affecting your account.

## Data location and transfers

### Where data is stored
- **Primary location:** United States.
- **Backups:** Replicated automatically by our cloud provider.
- **Legal jurisdiction:** Beunec Technologies Inc. is registered in the USA. Data processing terms are available on request.

### Cross-border transfers
- EU users' data transferred to the USA may be covered by Standard Contractual Clauses (SCCs), in line with GDPR.
- Beunec is not certified under any adequacy decision today. We transfer data under SCCs.

### Deleting your data
- Delete specific assets, taskspaces or whole workspaces from the UI.
- Deleted data is purged from live systems within 30 days.
- Backups expire after 7 days. Earlier file versions expire after 90 days.
- To delete a whole account or make another large request, contact [support@beunec.com](mailto:support@beunec.com).

## Contact

| Purpose | Contact | Response time |
| ------- | ------- | ------------- |
| Security concerns and vulnerability reports | **[contact@beunec.com](mailto:contact@beunec.com)** or **[support@beunec.com](mailto:support@beunec.com)** | 48 hours |
| Compliance and procurement security questionnaires | **[contact@beunec.com](mailto:contact@beunec.com)** | 5 business days |
| General product security questions | In-product chat, or **[support@beunec.com](mailto:support@beunec.com)** | |
| Data access and privacy requests (GDPR, CCPA, LGPD subject rights) | **[privacy@beunec.com](mailto:privacy@beunec.com)** | |

## Summary

| Layer              | Protection                         | Details                                         |
| ------------------ | ---------------------------------- | ----------------------------------------------- |
| **Authentication** | Identity provider, signed sessions | Passkeys, email verification, enterprise SSO    |
| **Transit**        | HTTPS and WSS                      | TLS 1.2+, forward secrecy                       |
| **Data at rest**   | AES-256                            | Customer-managed keys available                 |
| **Messages**       | AES-256                            | Encrypted per workspace                         |
| **Files**          | AES-256, private storage           | Time-limited download links, versioning         |
| **Credentials**    | Separate encryption                | Per connector, never visible to agents          |
| **Sandbox**        | Isolation                          | Per session, ephemeral, no access between users |
| **Connectors**     | OAuth, scoped tokens               | No passwords, approve each action               |
| **Personal data**  | Flagging and redaction             | Engine safeguards on outputs                    |
| **Governance**     | RBAC and rules                     | Enforced on every run                           |
| **Audit**          | Usage records                      | Session logs kept 90 days                       |

## Related
- [Workspace](/aselius-platform/docs/workspace)
- [Manage Teams](/aselius-platform/docs/manage-teams)
- [Aselius Preview App](/aselius-platform/docs/preview-app)
- [Aselius MCP](/aselius-platform/docs/aselius-mcp)
- [Messaging Channels](/aselius-platform/docs/messaging-channels)
- [Plans & Pricing](/aselius-platform/docs/plans-pricing)

**© 2026 Beunec Technologies Inc.** Last updated: August 5, 2026.
