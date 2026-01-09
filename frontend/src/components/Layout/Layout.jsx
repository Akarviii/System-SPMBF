import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Layout.module.css'

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <Link to="/">LibApartado</Link>
          </div>

          <div className={styles.navLinks}>
            <Link
              to="/"
              className={isActive('/') ? styles.active : ''}
            >
              Home
            </Link>

            {isAdmin() && (
              <>
                <div className={styles.divider}></div>
                <Link
                  to="/admin/users"
                  className={isActive('/admin/users') ? styles.active : ''}
                >
                  Users
                </Link>
                <Link
                  to="/admin/spaces"
                  className={isActive('/admin/spaces') ? styles.active : ''}
                >
                  Admin Spaces
                </Link>
                <Link
                  to="/admin/reservations"
                  className={isActive('/admin/reservations') ? styles.active : ''}
                >
                  Admin Reservations
                </Link>
              </>
            )}
          </div>

          <div className={styles.navUser}>
            <span className={styles.userName}>
              {user?.first_name} {user?.last_name}
              {isAdmin() && <span className={styles.badge}>Administrator</span>}
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.container}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
