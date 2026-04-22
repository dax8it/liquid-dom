import { Children, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PlacementContext, RootContext } from './context'
import { pollWithAnimationFrame } from './poll'
import type { RootContextValue } from './types'

type UseGlassContentRootParams = {
  children: ReactNode
  contentElement: HTMLDivElement
  rootContext: RootContextValue
}

/**
 * Mounts React children into the DOM host rendered inside a glass.
 *
 * Hosted glass content is rendered with a separate React root because the host
 * element is managed outside the normal React DOM tree by the renderer. This
 * hook waits until that host is connected, renders children into it, and tears
 * the root down on unmount.
 *
 * The return value indicates whether the glass currently has any hosted content.
 */
export function useGlassContentRoot({
  children,
  contentElement,
  rootContext,
}: UseGlassContentRootParams) {
  const contentRootRef = useRef<Root | null>(null)
  const hasContent = Children.toArray(children).length > 0

  useLayoutEffect(() => {
    if (!hasContent) {
      contentRootRef.current?.render(null)
      return
    }

    const contentTree = (
      <RootContext.Provider value={rootContext}>
        <PlacementContext.Provider value="glass-content">{children}</PlacementContext.Provider>
      </RootContext.Provider>
    )

    return pollWithAnimationFrame(
      () => contentElement.isConnected,
      () => {
        if (!contentRootRef.current) {
          contentRootRef.current = createRoot(contentElement)
        }

        contentRootRef.current.render(contentTree)
      },
    )
  }, [children, contentElement, hasContent, rootContext])

  useLayoutEffect(() => {
    return () => {
      contentRootRef.current?.unmount()
      contentRootRef.current = null
    }
  }, [])

  return hasContent
}
