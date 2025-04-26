import type { Mock } from 'vitest'
import type { Reactive, Ref } from '../src'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { effect, reactive, ref } from '../src'

function testReactivity3(state: any, key: string, getStateEffect: () => any, fn: Mock) {
  expect(fn.mock.calls.length).toBe(1)
  expect(fn.mock.calls[0]).toStrictEqual([1])

  expect(state[key]).toBe(1)
  expect(getStateEffect()).toBe(1)
  state[key]++
  expect(state[key]).toBe(2)
  expect(getStateEffect()).toBe(2)
  state[key] -= 5
  expect(state[key]).toBe(-3)
  expect(getStateEffect()).toBe(-3)

  expect(fn.mock.calls).toStrictEqual([[1], [2], [-3]])
}

describe('reactivity', () => {
  it('reactive types correct', () => {
    expectTypeOf(reactive({ a: 0 })).toMatchTypeOf<Reactive<{ a: number }>>()

    expectTypeOf(reactive({ a: 'foo' })).toMatchTypeOf<Reactive<{ a: string }>>()
  })
  it('ref types correct', () => {
    expectTypeOf(ref(0)).toMatchTypeOf<Ref<number>>()
    expectTypeOf(ref({ a: 0 })).toMatchTypeOf<Reactive<{ a: number }>>()
    expectTypeOf(ref({ a: 0 })).toMatchTypeOf<Ref<{ a: number }>>()

    expectTypeOf(ref({ a: 'foo' })).toMatchTypeOf<Reactive<{ a: string }>>()
    expectTypeOf(ref({ a: 'foo' })).toMatchTypeOf<Ref<{ a: string }>>()
  })
  it('reactive & effect works correct', () => {
    const fn = vi.fn()
    let stateEffect: number | null = null

    const state = reactive({ count: 1 })
    expect(state).toStrictEqual({ count: 1 })

    effect(() => {
      stateEffect = state.count
      fn(state.count)
    })

    testReactivity3(state, 'count', () => stateEffect, fn)
  })
  it('ref(obj) & effect works correct', () => {
    const fn = vi.fn()
    let stateEffect: number | null = null

    const state = ref({ count: 1 })
    expect(state).toStrictEqual({ count: 1 })

    effect(() => {
      stateEffect = state.count
      fn(state.count)
    })
    testReactivity3(state, 'count', () => stateEffect, fn)
  })
  it('ref(non-obj) & effect works correct', () => {
    const fn = vi.fn()
    let stateEffect: number | null = null

    const state = ref(1)
    expect(state).toStrictEqual({ value: 1 })

    effect(() => {
      stateEffect = state.value
      fn(state.value)
    })

    testReactivity3(state, 'value', () => stateEffect, fn)
  })
})
