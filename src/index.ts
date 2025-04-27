export type Dep = Set<ReactiveEffect>

export function createDep(effects?: ReactiveEffect[]): Dep {
  const dep: Dep = new Set<ReactiveEffect>(effects)
  return dep
}

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

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

export function effect<T = any>(fn: () => T): ReactiveEffect {
  const createdEffect = new ReactiveEffect(fn)
  createdEffect.run()
  return createdEffect
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

export const mutableHandlers: ProxyHandler<object> = {
  get(target: object, key: string | symbol, receiver: object) {
    track(target, key)

    const res = Reflect.get(target, key, receiver)
    if (res !== null && typeof res === 'object') {
      return reactive(res)
    }

    return res
  },

  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const oldValue = (target as any)[key]
    Reflect.set(target, key, value, receiver)
    if (!Object.is(value, oldValue)) {
      trigger(target, key)
    }
    return true
  },
}

export type Reactive<T> = T

export function reactive<T extends object>(target: T): Reactive<T> {
  const proxy = new Proxy(target, mutableHandlers)
  return proxy as T
}

export type Ref<T> = (T extends object ? Reactive<T> : { value: T })

export function ref<T>(init: T): Ref<T> {
  return reactive(
    (typeof init === 'object' && init !== null && !Array.isArray(init))
      ? init
      : { value: init },
  ) as Ref<T>
}
