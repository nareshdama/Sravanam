import { describe, it, expect, vi } from 'vitest'
import { createStore } from './store'

describe('createStore', () => {
  it('returns initial state', () => {
    const store = createStore({ count: 0, name: 'test' })
    expect(store.get()).toEqual({ count: 0, name: 'test' })
  })

  it('updates state with partial set', () => {
    const store = createStore({ a: 1, b: 'hello' })
    store.set({ a: 42 })
    expect(store.get().a).toBe(42)
    expect(store.get().b).toBe('hello')
  })

  it('notifies subscribers on change', () => {
    const store = createStore({ x: 0 })
    const listener = vi.fn()
    store.subscribe(listener)
    store.set({ x: 5 })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ x: 5 }))
  })

  it('does not notify if values are identical', () => {
    const store = createStore({ x: 10 })
    const listener = vi.fn()
    store.subscribe(listener)
    store.set({ x: 10 })
    expect(listener).not.toHaveBeenCalled()
  })

  it('unsubscribe stops notifications', () => {
    const store = createStore({ v: 'a' })
    const listener = vi.fn()
    const unsub = store.subscribe(listener)
    store.set({ v: 'b' })
    expect(listener).toHaveBeenCalledTimes(1)
    unsub()
    store.set({ v: 'c' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('supports multiple subscribers', () => {
    const store = createStore({ n: 0 })
    const a = vi.fn()
    const b = vi.fn()
    store.subscribe(a)
    store.subscribe(b)
    store.set({ n: 1 })
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })

  it('returns an immutable snapshot from get()', () => {
    const store = createStore({ count: 1 })
    const snapshot = store.get()

    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(() => {
      ;(snapshot as { count: number }).count = 9
    }).toThrow()
    expect(store.get().count).toBe(1)
  })
})
