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
      setError('Error loading all reservations...')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return
    }

    try {
      await reservationService.cancel(id)
      await loadReservations()
    } catch (err) {
      alert('Error canceling that reservation...')
      console.error(err)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Pending', className: styles.statusPending },
      APPROVED: { label: 'Approved', className: styles.statusApproved },
      REJECTED: { label: 'Rejected', className: styles.statusRejected },
      CANCELLED: { label: 'Canceled', className: styles.statusCancelled },
    }
    const statusInfo = statusMap[status] || { label: status, className: '' }
    return <span className={`${styles.badge} ${statusInfo.className}`}>{statusInfo.label}</span>
  }

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true
    return r.status === filter
  })

  if (loading) return <div>Loading reservations...</div>
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.myReservationsPage}>
      <div className={styles.header}>
        <h1>My Reservations</h1>
        <p>Manage all your reservations</p>
      </div>

      <div className={styles.filters}>
        <button
          className={filter === 'all' ? styles.filterActive : ''}
          onClick={() => setFilter('all')}
        >
          All ({reservations.length})
        </button>
        <button
          className={filter === 'PENDING' ? styles.filterActive : ''}
          onClick={() => setFilter('PENDING')}
        >
          Pending ({reservations.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          className={filter === 'APPROVED' ? styles.filterActive : ''}
          onClick={() => setFilter('APPROVED')}
        >
          Approved ({reservations.filter(r => r.status === 'APPROVED').length})
        </button>
        <button
          className={filter === 'REJECTED' ? styles.filterActive : ''}
          onClick={() => setFilter('REJECTED')}
        >
          Rejected ({reservations.filter(r => r.status === 'REJECTED').length})
        </button>
        <button
          className={filter === 'CANCELLED' ? styles.filterActive : ''}
          onClick={() => setFilter('CANCELLED')}
        >
          Canceled ({reservations.filter(r => r.status === 'CANCELLED').length})
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <p className={styles.emptyState}>There are no reservations to show</p>
      ) : (
        <div className={styles.reservationsList}>
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className={styles.reservationCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{reservation.title}</h3>
                  <p className={styles.spaceInfo}>
                    <b>Space</b>: {reservation.space?.name || 'No space assigned'}
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
                    <strong>Start:</strong>
                    <span>{formatDateTime(reservation.start_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>End:</strong>
                    <span>{formatDateTime(reservation.end_at)}</span>
                  </div>
                </div>

                {reservation.decision_note && (
                  <div className={styles.decisionNote}>
                    <strong>Decision note:</strong>
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
                    Cancel Reservation
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
