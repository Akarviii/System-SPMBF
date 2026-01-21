import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import LanguageToggle from '../LanguageToggle/LanguageToggle'
import styles from './Layout.module.css'

const Layout = ({ children }) => {
  const { t } = useTranslation()
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
            <Link to="/">{t('nav.brand')}</Link>
          </div>

          <div className={styles.navLinks}>
            <Link
              to="/"
              className={isActive('/') ? styles.active : ''}
            >
              {t('nav.home')}
            </Link>

            {isAdmin() && (
              <>
                <div className={styles.divider}></div>
                <Link
                  to="/admin/users"
                  className={isActive('/admin/users') ? styles.active : ''}
                >
                  {t('nav.users')}
                </Link>
                <Link
                  to="/admin/spaces"
                  className={isActive('/admin/spaces') ? styles.active : ''}
                >
                  {t('nav.adminSpaces')}
                </Link>
                <Link
                  to="/admin/reservations"
                  className={isActive('/admin/reservations') ? styles.active : ''}
                >
                  {t('nav.adminReservations')}
                </Link>
              </>
            )}
          </div>

          <div className={styles.navUser}>
            <span className={styles.userName}>
              {user?.first_name} {user?.last_name}
              <span className={isAdmin() ? styles.badgeAdmin : styles.badgeTeacher}>
                {isAdmin() ? t('nav.administrator') : t('nav.teacher')}
              </span>
            </span>
            <LanguageToggle />
            <ThemeToggle />
            <button onClick={handleLogout} className={styles.logoutBtn}>
              {t('nav.logout')}
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
