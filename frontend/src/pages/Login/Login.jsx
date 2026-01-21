import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import styles from './Login.module.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'please, type your email...'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please, type a valid e-mail...'
    }
    return ''
  }

  const validatePassword = (value) => {
    if (!value.trim()) {
      return 'please, type your password...'
    }
    return ''
  }

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }
  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }

  const handleEmailBlur = () => {
    const error = validateEmail(email)
    setErrors(prev => ({ ...prev, email: error }))
  }

  const handlePasswordBlur = () => {
    const error = validatePassword(password)
    setErrors(prev => ({ ...prev, password: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setErrors({
      email: emailError,
      password: passwordError
    })

    // Error = no submit
    if (emailError || passwordError) {
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      showSuccess('Redirecting to main page, wait a minute...', 3000)

      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      if (!err.response) {
        showError('Error, server busy, try again later...', 3000)
      } else if (err.response?.status === 401) {
        showError('Error, wrong credentials, try again...', 3000)
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
      <div className={styles.leftSide}>
        <div className={styles.imageOverlay}>
          <h1>LibApartado</h1>
          <p className={styles.subtitleLoginPage}>Reservation System</p>
          <p className={styles.subtitleLoginPageMinorSubtitle}>Library Module #3 FESC</p>
        </div>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.themeToggleWrapper}>
          <ThemeToggle />
        </div>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <h2>Welcome!</h2>
            <p>Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email">E-mail</label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="username@example.com"
                  autoComplete="email"
                  className={errors.email ? styles.inputError : ''}
                />
                {errors.email && (
                  <div className={styles.errorPopup}>
                    {errors.email}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className={errors.password ? styles.inputError : ''}
                />
                {errors.password && (
                  <div className={styles.errorPopup}>
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <a href="https://wa.me/573028530092" target='_blank'>Forgot your Password?</a>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
            <div className={styles.infoPartnerApp}>
              Integrated System &copy;
              <img src="/logo-fesc.png" alt="FESC Logo" />
            </div>
      </div>
    </div>
  )
}

export default Login