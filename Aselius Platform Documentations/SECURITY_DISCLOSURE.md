# Aselius Platform: Security & Data Handling Disclosure

**Version:** 1.0  
**Last Updated:** August 2026  
**Audience:** Enterprise customers, security reviewers, startups, and teams evaluating Aselius for production use.

---

## Executive Summary

Aselius is built for teams handling sensitive work: code, legal documents, research, and proprietary data. We've designed the platform with **defense-in-depth**: authentication, encryption, isolation, and role-based access at every layer. This document explains our security model, what we protect, and what we don't. We commit to transparency: if a specific security question isn't answered here, you can ask (see **Contact** below).

---



## 1. Authentication & Access Control



### 1.1 User authentication

- **Primary:** Auth0 (industry-standard OpenID Connect provider)
  - Users authenticate with username/password or social login (Google, GitHub, Microsoft)
  - Passwordless Authentication
  - Multi-factor authentication (MFA) available; not yet mandatory
  - Auth0 JWTs with RS256 signature are issued on login and refreshed per session
  - Token expiry: 24 hours (refresh token: 7 days)
- **Session management:**
  - JWT carried in `Authorization: Bearer` headers for API calls
  - WebSocket connections validated with JWT on upgrade (real-time messaging)
  - Logout revokes the session; clients must discard tokens (no server-side blocklist yet)



### 1.2 Workspace & resource access control

Aselius uses **role-based access control (RBAC):**


| Role         | Workspace access     | Governance  | Taskspace | Credits             | Files     |
| ------------ | -------------------- | ----------- | --------- | ------------------- | --------- |
| **Owner**    | Full                 | Create/edit | Full      | Manage plan/billing | Full      |
| **Operator** | Manage members/share | Create/edit | Full      | Read credits        | Full      |
| **Member**   | Use taskspaces       | Read only   | Full      | Read credits        | Full      |
| **Guest**    | View only            | Read only   | View only | N/A                 | View only |


- Roles are scoped per workspace; a user can have different roles in different workspaces.
- Shared workspaces use explicit invitation-based access (no public links).



### 1.3 API authentication

All backend APIs require:

- Valid JWT in `Authorization: Bearer` header
- Workspace membership / resource ownership check (server-side)
- Rate limiting per user (tier-dependent limits)

Example: `/api/workspaces/{id}/chats` returns 403 Forbidden if the JWT's user is not a member of `{id}`.

---



## 2. Data Encryption



### 2.1 In transit

- **HTTPS (TLS 1.2+)** for all HTTP/REST APIs
- **WSS (encrypted WebSocket)** for real-time messaging and Rivine streaming
- **HSTS (HTTP Strict-Transport-Security)** headers enabled
- **Perfect forward secrecy** via TLS ephemeral key exchange

Certificate pinning and certificate transparency: standard HTTPS stack (no custom pin list); certificates via AWS Certificate Manager.

### 2.2 At rest

**Workspace assets (Taskspace files, code, research outputs):**

- Stored in PostgreSQL (RDS, us-east-2)
- Database encryption: AWS RDS KMS (customer-managed key available for enterprise)
- Column-level encryption for sensitive metadata (e.g., API credential references)

**Message content (DynamoDB):**

- AES-256-GCM encryption before DynamoDB storage
- Encryption key per-workspace, derived from workspace identity + platform master key
- Messages are **not accessible** via raw DynamoDB scans; decryption happens at API layer

**File attachments (S3):**

- Private buckets: `stores` code/research assets and  message attachments
- Encryption: **AES-256 with bucket-key** (AWS S3 managed key)
- Access: Authenticated presigned URLs only; no public read access
- Versioning enabled; lifecycle policies delete old versions after 90 days
- Block all public access flags enabled

**Connector credentials (external API keys, OAuth tokens):**

- Encrypted with Fernet (AES-128-CBC + HMAC, Python cryptography library)
- Stored in `a connector token` table (Postgres)
- Keys are **never** logged, cached in plaintext, or exposed to agents

**Backups:**

- RDS snapshots encrypted with the same KMS key as the live database
- S3 bucket versioning + lifecycle policies serve as the file-level backup mechanism
- Snapshots are retained for 7 days, then deleted

### 2.3 Key management

- Primary encryption keys: AWS KMS (customer-managed or AWS-managed)
- Fernet keys for connector credentials: rotated annually (next rotation: August 2027)
- No hardcoded secrets in code or configuration files (all loaded from environment/secrets manager)

---



## 3. Sandbox Isolation & Execution Safety

**Rivine Code sandbox:**

- Each session runs in an isolated, **ephemeral** sandbox
- No network access between sandboxes or to other user sessions
- File system: per-session temporary directory, cleaned up on session end
- Process limits: memory, CPU, and runtime duration enforced
- Output: code edits and execution results are persisted to Assets only via explicit user action

**Asset persistence:**

- Sandbox outputs (code projects, generated files) are versioned in Assets as immutable snapshots
- Code projects are stored as JSON manifests in S3, versioned and encrypted
- No direct filesystem exposure; assets are accessed through authenticated API endpoints

**Connector scoping:**

- Each connector (Gmail, GitHub, Stripe, etc.) is bound to a single user
- Tokens are scoped to their specific purpose (e.g., Gmail token has `mail.read` + `mail.send` only, not calendar or contacts)
- Agents receive **no direct credential access**; connectors are called via governed API gates, not as raw tools

---



## 4. Third-party Integrations & OAuth



### 4.1 Supported connectors

- **Native (RCP):** Gmail, Microsoft 365, Supabase, Firebase, MongoDB, Stripe, GitHub and more
- **Enterprise (MCP):** Notion, Linear, Slack, Asana, Airtable, Google Drive, Figma, Zapier, and 10+ others



### 4.2 OAuth flow

1. User clicks "Connect [app]" in Connector settings
2. User is redirected to the third-party OAuth provider (e.g., Google, Notion)
3. User authorizes Aselius to access specific scopes (read emails, write tasks, etc.)
4. OAuth provider redirects to Aselius with an authorization code
5. Aselius exchanges the code for a refresh token and stores it encrypted
6. Agents can now call that connector's tools (within the scopes the user authorized)

**What we don't ask for:**

- We never ask for passwords; we use OAuth (token-based) exclusively
- We never request "full account access" scopes unless explicitly necessary (e.g., Stripe requires transaction scopes)
- We never store OAuth credentials unencrypted



### 4.3 Revocation

- Users can revoke connector access from the Connector page at any time
- Revocation deletes the stored credential and notifies the third-party provider
- Agents immediately lose access to that connector

---



## 5. Personally Identifiable Information (PII) Handling



### 5.1 What we collect

**Required for service:**

- Email address  
- CloudHandle (user-chosen username)
- Display name and optional domain alias (customizable)
- Workspace membership and team information

**Optional / contextual:**

- File attachments you upload (your choice)
- Location (browser geolocation permission, your choice)
- Chat messages (ephemeral, encrypted)

**Not collected:**

- Phone numbers
- Payment card details (Stripe handles payments, we see only transaction metadata)
- Browsing history or IP logs for profiling



### 5.2 PII in AI outputs

Rivine engines are instructed to:

- Flag PII (names, emails, phone numbers, SSNs, card details) in outputs before delivery
- Decline requests that ask them to generate fake PII
- Redact internal infrastructure details from error messages shown to you

If an engine's deliverables contains sensitive data, you can edit it in the Preview Panel before sharing or downloading.

### 5.3 Data retention

- Chat messages: retained for the lifetime of the workspace (can be deleted by Owner)
- Taskspace assets: retained until explicitly deleted
- Usage logs: aggregated billing data retained for 7 years (legal/tax requirement); session logs purged after 90 days
- Deleted workspaces: permanently removed within 30 days

---



## 6. File & Asset Security



### 6.1 Upload validation

- File type checking: blocks executables (`.exe`, `.sh`, `.bat`, etc.), archives (`.zip`, `.rar`), and other potentially dangerous types
- File size limits: 200 MB per file in Workspace; 100 MB per file in Messages
- MIME type validation: server-side checks ensure the content matches the claimed type



### 6.2 Access to assets

- **Your files:** only you (and workspace members with appropriate roles) can read them
- **AI-generated assets:** saved with metadata (engine, date, citation info); accessible to workspace members
- **Shared assets:** explicit sharing via workspace roles or presigned URLs; no "public listing" (no index of all files)



### 6.3 Presigned URLs (file download)

- Time-limited (typically 1 hour), regenerated on each access
- Single-use: each download request generates a fresh URL
- Bound to the authenticated user; no cross-account access

---



## 7. Governance & Compliance



### 7.1 Workspace governance

Owners can set:

- **System instructions:** role descriptions, behavioral guidelines for AI agents within this workspace
- **Content restrictions:** prohibited topics, content filter rules
- **Access policies:** which roles can share, invite, or manage taskspaces

Governance rules are **enforced at the runtime level**, not just a UI preference. Agents receive these rules as part of their harness instructions.

### 7.2 Audit & transparency

- All Rivine engine runs are logged with metadata: user, engine, start/end time, token usage, credits debited
- Usage activity is queryable by workspace Owners (see `/credits` page)
- Mediator routing decisions are annotated in chat (which engine was selected and why)
- No detailed agent decision-making logs are exposed to users (internal topology kept internal)



### 7.3 Compliance roadmap

- **GDPR:** deletion & export requests supported; privacy impact assessment in progress
- **SOC 2:** audit in scope for H2 2026
- **HIPAA:** not yet in scope (would require BAA and additional controls)
- **CCPA:** supported (California privacy disclosures available)

---



## 8. Known Limitations & Security Notes



### 8.1 What we do *not* do

- **End-to-end encryption (E2EE):** Messages and assets are encrypted at rest on our servers, but the platform decrypts them at API layer (the server can always read your data). This is a deliberate trade-off: E2EE would break our ability to offer features like AI search, workspace-wide governance, and multi-agent collaboration. If true E2EE is required, Aselius is not the right choice for that use case.
- **Hardware security modules (HSMs):** Encryption keys are managed via AWS KMS; we don't operate our own HSM infrastructure (available for enterprise contracts on a case-by-case basis).
- **Penetration testing by users:** We conduct regular internal security audits; external pen-testing is arranged via responsible disclosure (see below), not ad-hoc.
- **Server-side blocklist for invalidated tokens:** Token revocation relies on expiry; logging out invalidates your refresh token locally, but short-lived JWTs in flight are still valid until their 24-hour window closes. For highly sensitive scenarios, request a token refresh or re-authenticate.



### 8.2 Sandboxes & ephemeral data

- E2B sandboxes are **not persistent** across sessions; only what you explicitly save to Assets survives
- Sandbox file systems are not encrypted (the sandbox itself is isolated from other users, but not encrypted at the filesystem level)
- Logs from sandbox execution may include captured stdout/stderr; we redact secrets-shaped strings



### 8.3 Third-party risk

- We depend on Auth0 (authentication), AWS (infrastructure), E2B (sandbox), and third-party APIs you connect (Gmail, Notion, etc.)
- A compromise of Auth0 or AWS would compromise Aselius; a compromise of a connector you authorize only affects that specific connector's scope
- We monitor third-party status pages and security advisories; see **Contact** below to ask about specific vendors

---



## 9. Vulnerability Disclosure & Incident Response



### 9.1 Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, email **[contact@beunec.com](mailto:security@beunec.com)** with:

- Affected component (e.g., Workspace, Messages, Rivine Code)
- Steps to reproduce
- Potential impact (confidentiality, integrity, availability)

**What to expect:**

- Acknowledgment within 48 hours
- Investigation and fix prioritized based on severity (critical fixes: < 7 days; high: 14 days; medium: 30 days)
- Coordinated disclosure: we will work with you on a public announcement timeline

We will credit the reporter unless you request anonymity.

### 9.2 Known issues (transparency)

- **MFA not yet mandatory:** we encourage users to enable it; mandatory rollout planned Q2 2027
- **Session refresh:** short-lived tokens mean re-authentication may be required periodically in long-running operations (future: implement refresh token grant flow)
- **Sandbox execution logs:** stdout/stderr is captured and may be visible to workspace members (future: separate sensitive log handling)

---



## 10. For Security Reviewers & Enterprises



### 10.1 What to ask us about

- Detailed security architecture (architecture review available under NDA)
- Penetration testing results (available for enterprise contracts)
- SOC 2 audit status (in progress; expected Q2 2027)
- Data residency requirements (currently: us-east-2; other regions available for enterprise)
- Custom encryption key management (AWS KMS customer-managed keys supported)
- Compliance questionnaires (Security & Risk Questionnaire, ISO 27001 alignment; contact sales)



### 10.2 Integration with your security program

- **Inventory management:** Aselius stores workspaces, taskspaces, and assets; these should be tracked in your SaaS inventory
- **Access reviews:** SAML/OIDC single sign-on (SSO) available for enterprise (enables access reviews in your IdP)
- **Data classification:** we support workspace-level governance tags; you can mark workspaces as "confidential", "internal", etc.
- **Incident notification:** we will notify customers of security incidents affecting their account within 24 hours

---



## 11. Privacy & Data Protection



### 11.1 Data location

- Primary: AWS us-east-2 (Northern Virginia, USA)
- Backups: geo-replicated within AWS (automated)
- Legal jurisdiction: Beunec Technologies Inc. is registered in the USA; data processing terms available upon request



### 11.2 Cross-border transfers

- Users in the EU may be subject to Standard Contractual Clauses (SCCs) for data transfers to the USA (GDPR compliance)
- Beunec is not currently certified under any adequacy decision but will operate under SCCs



### 11.3 Data deletion

- You can delete specific assets, taskspaces, or entire workspaces from the UI
- Deleted data is purged from live databases within 30 days
- Backups are automatically deleted per retention policies (7-day RDS snapshot retention, 90-day S3 version retention)
- For larger deletion requests (e.g., entire account), contact [support@beunec.com](mailto:support@beunec.com)

---



## 12. Transparency Commitment

We are committed to **honest disclosure**: we will not hide security shortcomings or overpromise features. This document will be updated as our security posture evolves. Breaking changes or new limitations will be announced via the product (in-app notices) and email to affected users.

**Questions?** See the contact section below.

---



## 13. Contact & Further Questions

**Security concerns or vulnerability reports:**  
Email: **[contact@beunec.com](mailto:security@beunec.com)**  
Response time: 48 hours

**Compliance / procurement security questionnaires:**  
Email: **[contact@beunec.com](mailto:security@beunec.com)**  
Response time: 5 business days

**General product security questions:**  
Use the in-product chat or email: **[support@beunec.com](mailto:support@beunec.com)**

**Data access / privacy requests:**  
Email: **[contact@beunec.com](mailto:privacy@beunec.com)**  
(GDPR, CCPA, LGPD subject rights)

---



## Appendix: Summary Table


| Layer              | Protection            | Details                                 |
| ------------------ | --------------------- | --------------------------------------- |
| **Authentication** | JWT (RS256) + Auth0   | 24-hour token expiry, optional MFA      |
| **Transit**        | HTTPS + WSS           | TLS 1.2+, perfect forward secrecy       |
| **Database**       | AWS RDS KMS + AES-256 | Customer-managed keys available         |
| **Messages**       | AES-256-GCM           | Per-workspace encryption                |
| **Files (S3)**     | AES-256 bucket-key    | Versioning + lifecycle policies         |
| **Credentials**    | Fernet encryption     | Per-connector, not accessible to agents |
| **Sandbox**        | E2B isolation         | Per-session, ephemeral, no cross-access |
| **Connectors**     | OAuth + scoped tokens | Never ask for passwords                 |
| **PII**            | Flagging + redaction  | Agent instructions + output sanitizers  |
| **Governance**     | RBAC + rules          | Enforced at runtime level               |
| **Audit**          | Usage logs            | 90-day retention for session data       |


---

**© 2026 Beunec Technologies Inc.**  
Last updated: August 5, 2026