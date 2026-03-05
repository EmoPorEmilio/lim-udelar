import { createSignal, createEffect, onCleanup, type Accessor } from 'solid-js'

export function useDebounce<T>(source: Accessor<T>, delayMs: number): Accessor<T> {
  const [debounced, setDebounced] = createSignal<T>(source())

  createEffect(() => {
    const value = source()
    const timer = setTimeout(() => setDebounced(() => value), delayMs)
    onCleanup(() => clearTimeout(timer))
  })

  return debounced
}
