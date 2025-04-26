import type { Dep } from './dep'
import { createDep } from './dep'

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

// // eslint-disable-next-line import/no-mutable-exports
// export let activeEffect: ReactiveEffect | undefined

let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run(): ReturnType<typeof this.fn> {
    const parent: ReactiveEffect | undefined = activeEffect
    // eslint-disable-next-line ts/no-this-alias
    activeEffect = this
    const res = this.fn()
    activeEffect = parent
    return res
  }
}

export function track(target: object, key: unknown): void {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }

  if (activeEffect) {
    dep.add(activeEffect)
  }
}

export function trigger(target: object, key?: unknown): void {
  const depsMap = targetMap.get(target)
  if (!depsMap)
    return

  const dep = depsMap.get(key)

  if (dep) {
    const effects = [...dep]
    for (const effect of effects) {
      effect.run()
    }
  }
}

export function effect<T = any>(fn: () => T): ReactiveEffect {
  const createdEffect = new ReactiveEffect(fn)
  createdEffect.run()
  return createdEffect
}
