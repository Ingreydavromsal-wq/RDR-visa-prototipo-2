// ── App.jsx — RDR VISA ID Scanner ──
import { useState, useEffect } from 'react'
import Logo from './components/Logo.jsx'
import LoginPage  from './pages/LoginPage.jsx'
import ScannerPage from './pages/ScannerPage.jsx'
import AdminPage   from './pages/AdminPage.jsx'
import UserPage    from './pages/UserPage.jsx'
import { getSession, logout } from './auth.js'

const NAV_ALL = [
  { id: 'scanner', label: 'ESCÁNER',    icon: '🔍', desc: 'Captura de documentos' },
  { id: 'admin',   label: 'ADMIN',      icon: '🛡️',  desc: 'Panel de control', adminOnly: true },
  { id: 'usuario', label: 'USUARIO',    icon: '👤', desc: 'Consentimiento' },
]

const titles = {
  scanner: 'ESCANEO DE DOCUMENTOS',
  admin:   'PANEL DE ADMINISTRADOR',
  usuario: 'PORTAL DE USUARIO',
}

export default function App() {
  const [session, setSession] = useState(() => getSession())
  const [page, setPage] = useState('scanner')
  const [savedCount, setSavedCount] = useState(0)

  // If a non-admin somehow lands on the admin page, redirect away
  useEffect(() => {
    if (page === 'admin' && session?.role !== 'admin') {
      setPage('scanner')
    }
  }, [page, session])

  // ── Not logged in: show welcome / login screen ──
  if (!session) {
    return <LoginPage onLogin={(s) => { setSession(s); setPage('scanner') }} />
  }

  const isAdmin = session.role === 'admin'
  const NAV = NAV_ALL.filter(n => !n.adminOnly || isAdmin)

  function handleLogout() {
    logout()
    setSession(null)
    setPage('scanner')
    setSavedCount(0)
  }

  return (
    <div style={styles.app}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <Logo size={44} showText={true} variant="compact"/>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {NAV.map(n => (
            <button
              key={n.id}
              style={{...styles.navItem, ...(page === n.id ? styles.navActive : {})}}
              onClick={() => setPage(n.id)}
            >
              <span style={styles.navIcon}>{n.icon}</span>
              <div style={styles.navText}>
                <span style={styles.navLabel}>{n.label}</span>
                <span style={styles.navDesc}>{n.desc}</span>
              </div>
              {n.id === 'admin' && savedCount > 0 && (
                <span style={styles.badge}>{savedCount}</span>
              )}
              {page === n.id && <span style={styles.navIndicator}/>}
            </button>
          ))}
        </nav>

        {/* User session + footer */}
        <div style={styles.sideFooter}>
          <div style={styles.sessionBox}>
            <div style={styles.sessionAvatar}>{isAdmin ? '🛡️' : '👤'}</div>
            <div style={{flex:1, minWidth:0}}>
              <div style={styles.sessionName}>{session.name}</div>
              <div style={styles.sessionRole}>{isAdmin ? 'Administrador' : 'Usuario'}</div>
            </div>
            <button style={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">⏻</button>
          </div>
          <div style={styles.footerSub}>v1.0.0 · RDR VISA</div>
          <div style={styles.footerLegal}>LFPDPPP · RGPD Compliant</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={styles.main}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <span style={styles.topbarTitle}>{titles[page]}</span>
          </div>
          <div style={styles.topbarRight}>
            <span style={styles.statusDot}/>
            <span style={styles.statusText}>Sistema activo</span>
            <div style={styles.adminPill}>
              <span>{isAdmin ? '🛡️' : '👤'}</span>
              <span>{session.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={styles.content} key={page}>
          {page === 'scanner' && (
            <ScannerPage onSaved={() => setSavedCount(c => c+1)}/>
          )}
          {page === 'admin' && isAdmin && <AdminPage/>}
          {page === 'usuario' && <UserPage/>}
        </main>
      </div>
    </div>
  )
}

const styles = {
  app:         { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar:     { width: 230, background: '#fff', borderRight: '1px solid #E8ECF3', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logoWrap:    { padding: '20px 16px 16px', borderBottom: '1px solid #E8ECF3' },
  nav:         { flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:     { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', borderRadius: 10, background: 'transparent', cursor: 'pointer', textAlign: 'left', position: 'relative', transition: 'background 0.15s', width: '100%' },
  navActive:   { background: '#F0F7FF' },
  navIcon:     { fontSize: 18, flexShrink: 0, width: 22, textAlign: 'center' },
  navText:     { display: 'flex', flexDirection: 'column', flex: 1 },
  navLabel:    { fontFamily: 'Barlow Condensed, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '1px', color: '#0D2350' },
  navDesc:     { fontSize: 10, color: '#9BA8BE', marginTop: 1, letterSpacing: '0.3px' },
  navIndicator:{ position: 'absolute', left: 0, top: '25%', height: '50%', width: 3, background: '#1B9E9C', borderRadius: '0 2px 2px 0' },
  badge:       { background: '#E24B4A', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 600 },
  sideFooter:  { padding: '14px 16px', borderTop: '1px solid #E8ECF3' },
  sessionBox:  { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#F4F6FA', borderRadius: 10, marginBottom: 10 },
  sessionAvatar:{ fontSize: 18, flexShrink: 0 },
  sessionName: { fontSize: 11, fontWeight: 600, color: '#0D2350', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sessionRole: { fontSize: 9, color: '#9BA8BE', letterSpacing: '0.5px' },
  logoutBtn:   { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: '#E24B4A', flexShrink: 0, padding: '2px 4px' },
  footerSub:   { fontSize: 11, fontWeight: 600, color: '#0D2350', marginTop: 1 },
  footerLegal: { fontSize: 9, color: '#9BA8BE', marginTop: 4, letterSpacing: '0.5px' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar:      { padding: '13px 24px', background: '#fff', borderBottom: '1px solid #E8ECF3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  topbarTitle: { fontFamily: 'Barlow Condensed, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '2px', color: '#0D2350' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  statusDot:   { width: 7, height: 7, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite', display: 'inline-block' },
  statusText:  { fontSize: 11, color: '#9BA8BE', letterSpacing: '0.3px' },
  adminPill:   { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: '#F4F6FA', border: '1px solid #E8ECF3', borderRadius: 20, fontSize: 11, color: '#2D3A52' },
  content:     { flex: 1, overflowY: 'auto' },
}
