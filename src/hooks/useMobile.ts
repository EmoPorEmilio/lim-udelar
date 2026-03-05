import { createSignal, onCleanup, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'

const [isMobile, setIsMobile] = createSignal(false)
let listenerCount = 0

const check = () => setIsMobile(window.innerWidth < 768)

export function useMobile() {
  onMount(() => {
    if (isServer) return

    check()
    listenerCount++
    if (listenerCount === 1) {
      window.addEventListener('resize', check)
    }

    onCleanup(() => {
      listenerCount--
      if (listenerCount === 0) {
        window.removeEventListener('resize', check)
      }
    })
  })

  return isMobile
}
