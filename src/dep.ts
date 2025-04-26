import type { ReactiveEffect } from './effect'

export type Dep = Set<ReactiveEffect>

export function createDep(effects?: ReactiveEffect[]): Dep {
  const dep: Dep = new Set<ReactiveEffect>(effects)
  return dep
}
