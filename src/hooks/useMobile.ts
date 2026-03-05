import { createSignal, onCleanup, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'

const [isMobile, setIsMobile] = createSignal(false)
let listenerAttached = false

export function useMobile() {
  onMount(() => {
    if (isServer || listenerAttached) return
    listenerAttached = true

    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    onCleanup(() => {
      window.removeEventListener('resize', check)
      listenerAttached = false
    })
  })

  return isMobile
}
