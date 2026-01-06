import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import styles from './Login.module.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      showSuccess('Redirecting to main page, wait a minute...', 3000)

      // Wait a moment to show the toast before navigating
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      if (!err.response) {
        showError('Error, server busy, try again later...', 3000)
      } else if (err.response?.status === 401) {
        showError('Error, wrong credentials, try again!', 3000)
        // Clear fields when credentials are wrong
        setEmail('')
        setPassword('')
      } else {
        showError('Error, server busy, try again later...', 3000)
      }
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Lado izquierdo - Imagen */}
      <div className={styles.leftSide}>
        <div className={styles.imageOverlay}>
          <h1>LibApartado</h1>
          <p className={styles.subtitleLoginPage}>Reservation System</p>
          <p className={styles.subtitleLoginPageMinorSubtitle}>Library Module #3 FESC</p>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className={styles.rightSide}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h2>Welcome!</h2>
            <p>Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="username@example.com"
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
            <div className={styles.infoPartnerApp}>
              Integrated System
              <img src="/logo-fesc.png" alt="FESC Logo" />
            </div>
      </div>
    </div>
  )
}

export default Login
