import { mutableHandlers } from './baseHandler'

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

// type Unpack<T> = {
//   [K in keyof T]: T[K] extends object ? Unpack<T[K]> : T[K]
// }

// type B = Unpack<Ref<{ a: 1 }>>
// type C = Unpack<Ref<1>>
