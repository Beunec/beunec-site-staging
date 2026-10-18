// Mounts the real OnboardingClient for onboarding-live.mjs (server gating skipped).
import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OnboardingPage from '../../../src/app/onboarding/OnboardingClient'

const qc = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={qc}>
    <OnboardingPage auth0Id="auth0|demo" email="demo@example.com" />
  </QueryClientProvider>,
)
