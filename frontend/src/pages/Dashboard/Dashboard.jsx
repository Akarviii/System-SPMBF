import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import reservationService from '../../services/reservationService'
import { formatDateTime } from '../../utils/dateUtils'
import styles from './Dashboard.module.css'

const Dashboard = () => {
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
      setError('Error al cargar reservas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Pendiente', className: styles.statusPending },
      APPROVED: { label: 'Aprobada', className: styles.statusApproved },
      REJECTED: { label: 'Rechazada', className: styles.statusRejected },
      CANCELLED: { label: 'Cancelada', className: styles.statusCancelled },
    }
    const statusInfo = statusMap[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Welcome, {user?.first_name}!</h1>
        <p>Space Reservation System - FESC Module #3</p>
      </div>

      <div className={styles.quickActions}>
        <Link to="/spaces" className={styles.actionCard}>
          <h3>See Available Spaces</h3>
          <p>Check availability</p>
        </Link>
        <Link to="/my-reservations" className={styles.actionCard}>
          <h3>My Reservations</h3>
          <p>Manage your reservations</p>
        </Link>
        <Link to="/create-reservation" className={styles.actionCard}>
          <h3>New Reservation</h3>
          <p>Reserve an available space</p>
        </Link>
        {isAdmin() && (
          <Link to="/admin/reservations" className={styles.actionCard}>
            <h3>Approve Reservations</h3>
            <p>Administrative management</p>
          </Link>
        )}
      </div>

      <div className={styles.section}>
        <h2>Upcoming Reservations (7 days)</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : upcomingReservations.length === 0 ? (
          <p className={styles.emptyState}>You don't have reservations at this moment!</p>
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
                    <strong>Space:</strong> {reservation.space?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Starting:</strong> {formatDateTime(reservation.start_at)}
                  </p>
                  <p>
                    <strong>Ending:</strong> {formatDateTime(reservation.end_at)}
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
