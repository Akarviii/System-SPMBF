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
              Inicio
            </Link>
            <Link
              to="/spaces"
              className={isActive('/spaces') ? styles.active : ''}
            >
              Espacios
            </Link>
            <Link
              to="/my-reservations"
              className={isActive('/my-reservations') ? styles.active : ''}
            >
              Mis Reservas
            </Link>
            <Link
              to="/create-reservation"
              className={isActive('/create-reservation') ? styles.active : ''}
            >
              Nueva Reserva
            </Link>

            {isAdmin() && (
              <>
                <div className={styles.divider}></div>
                <Link
                  to="/admin/users"
                  className={isActive('/admin/users') ? styles.active : ''}
                >
                  Usuarios
                </Link>
                <Link
                  to="/admin/spaces"
                  className={isActive('/admin/spaces') ? styles.active : ''}
                >
                  Admin Espacios
                </Link>
                <Link
                  to="/admin/reservations"
                  className={isActive('/admin/reservations') ? styles.active : ''}
                >
                  Admin Reservas
                </Link>
              </>
            )}
          </div>

          <div className={styles.navUser}>
            <span className={styles.userName}>
              {user?.first_name} {user?.last_name}
              {isAdmin() && <span className={styles.badge}>Admin</span>}
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Cerrar Sesión
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
