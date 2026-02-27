import { Link, useLocation } from '@tanstack/solid-router'
import { AuthButton } from './AuthButton'

export function AppHeader() {
  const location = useLocation()

  const linkClass = (path: string, accent?: boolean) => {
    const base = 'vui-header__link'
    const classes = [base]
    if (accent) classes.push('vui-header__link--accent')
    if (location().pathname === path) classes.push('vui-header__link--active')
    return classes.join(' ')
  }

  return (
    <header class="vui-header">
      <div class="vui-header__container">
        {/* Left: Logo + Title */}
        <Link to="/" style={{ 'text-decoration': 'none', display: 'flex', 'align-items': 'center', gap: '12px' }}>
          <div class="vui-header__logo-box">L</div>
          <span class="vui-header__title">LIM</span>
        </Link>

        {/* Right: Nav */}
        <nav class="vui-header__nav">
          <Link to="/faq" class={linkClass('/faq')}>
            FAQ
          </Link>
          <Link to="/curriculum" class={linkClass('/curriculum')}>
            PLAN
          </Link>
          <Link to="/materiales" class={linkClass('/materiales', true)}>
            MATERIALES
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  )
}
