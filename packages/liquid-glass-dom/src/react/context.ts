import { createContext, useContext } from 'react'
import { Container as GlassContainer } from '../scene'
import type { PlacementMode, RootContextValue } from './types'

export const RootContext = createContext<RootContextValue | null>(null)
export const PlacementContext = createContext<PlacementMode>('root')
export const ContainerContext = createContext<GlassContainer | null>(null)

/**
 * Reads the current React root runtime and throws a component-specific error
 * when the caller is rendered outside {@link Root}.
 */
export function useRootContext(componentName: string) {
  const context = useContext(RootContext)
  if (!context) {
    throw new Error(`${componentName} must be rendered under <Root>.`)
  }

  return context
}

/**
 * Enforces where a React scene component is allowed to appear in the tree.
 *
 * The React layer keeps backdrop content, hidden overlay layout, and glass
 * content as separate domains. This hook validates that a component is rendered
 * in the correct domain and throws explicit errors for invalid nesting.
 */
export function usePlacement(componentName: string, allowedPlacement: PlacementMode) {
  const placement = useContext(PlacementContext)
  if (placement === allowedPlacement) {
    return placement
  }

  if (componentName === 'Container' && placement === 'container-overlay') {
    throw new Error('<Container> cannot be nested inside another <Container>.')
  }
  if (componentName === 'Container' && placement === 'glass-content') {
    throw new Error('<Container> cannot be rendered inside <Glass> content.')
  }
  if (componentName === 'Container' && placement === 'backdrop') {
    throw new Error('<Container> cannot be rendered inside Root backdrop content.')
  }
  if (componentName === 'Glass' && placement === 'backdrop') {
    throw new Error('<Glass> cannot be rendered inside Root backdrop content.')
  }
  if (componentName === 'Glass' && placement === 'glass-content') {
    throw new Error('<Glass> cannot be rendered inside another <Glass> content subtree.')
  }

  throw new Error(`<${componentName}> is not allowed in this part of the Root tree.`)
}
