/**
 * Minimal pub/sub reactive store.
 * No framework dependency — just a state object, getters, partial setters, and listeners.
 */

export type Listener<T> = (state: Readonly<T>) => void

export interface Store<T> {
  get(): Readonly<T>
  set(partial: Partial<T>): void
  subscribe(listener: Listener<T>): () => void
}

export function createStore<T extends object>(
  initial: T,
): Store<T> {
  let state: T = { ...initial }
  const listeners = new Set<Listener<T>>()

  function notify(): void {
    const frozen = Object.freeze({ ...state })
    for (const fn of listeners) {
      fn(frozen)
    }
  }

  return {
    get(): Readonly<T> {
      return state
    },

    set(partial: Partial<T>): void {
      let changed = false
      for (const key of Object.keys(partial) as Array<keyof T>) {
        if (!Object.is(state[key], partial[key])) {
          changed = true
          break
        }
      }
      if (!changed) return
      state = { ...state, ...partial }
      notify()
    },

    subscribe(listener: Listener<T>): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
