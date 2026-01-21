import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import reservationService from '../../services/reservationService'
import { formatDateTime } from '../../utils/dateUtils'
import styles from './Dashboard.module.css'

const Dashboard = () => {
  const { t } = useTranslation()
  const { user, isAdmin } = useAuth()
  const [upcomingReservations, setUpcomingReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUpcomingReservations()
  }, [])

  const loadUpcomingReservations = async () => {
    try {
      setLoading(true)
      const now = new Date().toISOString()
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const data = await reservationService.getMine({
        start: now,
        end: end,
      })

      setUpcomingReservations(data.slice(0, 5))
    } catch (err) {
      setError('Error loading reservations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: t('status.pending'), className: styles.statusPending },
      APPROVED: { label: t('status.approved'), className: styles.statusApproved },
      REJECTED: { label: t('status.rejected'), className: styles.statusRejected },
      CANCELLED: { label: t('status.cancelled'), className: styles.statusCancelled },
    }
    const statusInfo = statusMap[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>{t('dashboard.welcome', { name: user?.first_name })}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      <div className={styles.quickActions}>
        <Link to="/spaces" className={styles.actionCard}>
          <h3>{t('dashboard.availableSpaces')}</h3>
          <p>{t('dashboard.availableSpacesDesc')}</p>
        </Link>
        <Link to="/my-reservations" className={styles.actionCard}>
          <h3>{t('dashboard.myReservations')}</h3>
          <p>{t('dashboard.myReservationsDesc')}</p>
        </Link>
        <Link to="/create-reservation" className={styles.actionCard}>
          <h3>{t('dashboard.newReservation')}</h3>
          <p>{t('dashboard.newReservationDesc')}</p>
        </Link>
        {isAdmin() && (
          <Link to="/admin/reservations" className={styles.actionCard}>
            <h3>{t('dashboard.approveReservations')}</h3>
            <p>{t('dashboard.approveReservationsDesc')}</p>
          </Link>
        )}
      </div>

      <div className={styles.section}>
        <h2>{t('dashboard.upcomingReservations')}</h2>
        {loading ? (
          <p>{t('common.loading')}</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : upcomingReservations.length === 0 ? (
          <p className={styles.emptyState}>{t('dashboard.noReservations')}</p>
        ) : (
          <div className={styles.reservationsList}>
            {upcomingReservations.map((reservation) => (
              <div key={reservation.id} className={styles.reservationCard}>
                <div className={styles.reservationHeader}>
                  <h3>{reservation.title}</h3>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className={styles.reservationDetails}>
                  <p>
                    <strong>{t('dashboard.space')}:</strong> {reservation.space?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>{t('dashboard.starting')}:</strong> {formatDateTime(reservation.start_at)}
                  </p>
                  <p>
                    <strong>{t('dashboard.ending')}:</strong> {formatDateTime(reservation.end_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
