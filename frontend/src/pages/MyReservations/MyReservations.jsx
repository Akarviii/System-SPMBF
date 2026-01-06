import { useState, useEffect } from 'react'
import reservationService from '../../services/reservationService'
import { formatDateTime } from '../../utils/dateUtils'
import styles from './MyReservations.module.css'

const MyReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await reservationService.getMine()
      setReservations(data)
    } catch (err) {
      setError('Error al cargar reservas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) {
      return
    }

    try {
      await reservationService.cancel(id)
      await loadReservations()
    } catch (err) {
      alert('Error al cancelar la reserva')
      console.error(err)
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

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true
    return r.status === filter
  })

  if (loading) return <div>Cargando reservas...</div>
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.myReservationsPage}>
      <div className={styles.header}>
        <h1>Mis Reservas</h1>
        <p>Gestiona todas tus reservas</p>
      </div>

      <div className={styles.filters}>
        <button
          className={filter === 'all' ? styles.filterActive : ''}
          onClick={() => setFilter('all')}
        >
          Todas ({reservations.length})
        </button>
        <button
          className={filter === 'PENDING' ? styles.filterActive : ''}
          onClick={() => setFilter('PENDING')}
        >
          Pendientes ({reservations.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          className={filter === 'APPROVED' ? styles.filterActive : ''}
          onClick={() => setFilter('APPROVED')}
        >
          Aprobadas ({reservations.filter(r => r.status === 'APPROVED').length})
        </button>
        <button
          className={filter === 'REJECTED' ? styles.filterActive : ''}
          onClick={() => setFilter('REJECTED')}
        >
          Rechazadas ({reservations.filter(r => r.status === 'REJECTED').length})
        </button>
        <button
          className={filter === 'CANCELLED' ? styles.filterActive : ''}
          onClick={() => setFilter('CANCELLED')}
        >
          Canceladas ({reservations.filter(r => r.status === 'CANCELLED').length})
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <p className={styles.emptyState}>No se encontraron reservas</p>
      ) : (
        <div className={styles.reservationsList}>
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className={styles.reservationCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{reservation.title}</h3>
                  <p className={styles.spaceInfo}>
                    {reservation.space?.name || 'Sin espacio asignado'}
                  </p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              <div className={styles.cardBody}>
                {reservation.description && (
                  <p className={styles.description}>{reservation.description}</p>
                )}

                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <strong>Inicio:</strong>
                    <span>{formatDateTime(reservation.start_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Fin:</strong>
                    <span>{formatDateTime(reservation.end_at)}</span>
                  </div>
                </div>

                {reservation.decision_note && (
                  <div className={styles.decisionNote}>
                    <strong>Nota de decisión:</strong>
                    <p>{reservation.decision_note}</p>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                {(reservation.status === 'PENDING' || reservation.status === 'APPROVED') && (
                  <button
                    onClick={() => handleCancel(reservation.id)}
                    className={styles.cancelBtn}
                  >
                    Cancelar Reserva
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReservations
