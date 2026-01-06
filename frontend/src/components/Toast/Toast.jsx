import { useEffect } from 'react'
import styles from './Toast.module.css'

const Toast = ({ id, message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose, id])

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          {type === 'error' && '✕'}
          {type === 'success' && '✓'}
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      <button onClick={() => onClose(id)} className={styles.closeBtn}>
        ✕
      </button>
    </div>
  )
}

export default Toast
