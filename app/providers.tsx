'use client'

import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from '@/lib/posthog-client'
import { insforge } from '@/lib/insforge-client'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname
      const search = searchParams.toString()
      if (search) {
        url += `?${search}`
      }
      posthog.capture('$pageview', { '$current_url': url })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()

    insforge.auth.getCurrentUser()
      .then(({ data: { user } }) => {
        if (user) {
          posthog.identify(user.id, { email: user.email })
        }
      })
      .catch((err: unknown) => {
        console.error('[PostHogProvider]', err)
      })
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
