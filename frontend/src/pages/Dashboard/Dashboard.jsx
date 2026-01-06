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
        <h1>Bienvenido, {user?.first_name}!</h1>
        <p>Sistema de Reservas de Espacios - FESC Módulo 3</p>
      </div>

      <div className={styles.quickActions}>
        <Link to="/create-reservation" className={styles.actionCard}>
          <h3>Nueva Reserva</h3>
          <p>Reserva un espacio disponible</p>
        </Link>
        <Link to="/spaces" className={styles.actionCard}>
          <h3>Ver Espacios</h3>
          <p>Consulta la disponibilidad</p>
        </Link>
        <Link to="/my-reservations" className={styles.actionCard}>
          <h3>Mis Reservas</h3>
          <p>Administra tus reservas</p>
        </Link>
        {isAdmin() && (
          <Link to="/admin/reservations" className={styles.actionCard}>
            <h3>Aprobar Reservas</h3>
            <p>Gestión administrativa</p>
          </Link>
        )}
      </div>

      <div className={styles.section}>
        <h2>Próximas Reservas (7 días)</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : upcomingReservations.length === 0 ? (
          <p className={styles.emptyState}>No tienes reservas próximas</p>
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
                    <strong>Espacio:</strong> {reservation.space?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Inicio:</strong> {formatDateTime(reservation.start_at)}
                  </p>
                  <p>
                    <strong>Fin:</strong> {formatDateTime(reservation.end_at)}
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
