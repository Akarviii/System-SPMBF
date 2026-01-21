import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import reservationService from '../../services/reservationService'
import { formatDateTime } from '../../utils/dateUtils'
import styles from './MyReservations.module.css'

const MyReservations = () => {
  const { t } = useTranslation()
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
      setError(t('myReservations.errorLoading'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm(t('myReservations.confirmCancel'))) {
      return
    }

    try {
      await reservationService.cancel(id)
      await loadReservations()
    } catch (err) {
      alert(t('myReservations.errorCanceling'))
      console.error(err)
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

  const filteredReservations = reservations.filter(r => {
    if (filter === 'all') return true
    return r.status === filter
  })

  if (loading) return <div>{t('common.loading')}</div>
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.myReservationsPage}>
      <div className={styles.header}>
        <h1>{t('myReservations.title')}</h1>
        <p>{t('myReservations.subtitle')}</p>
      </div>

      <div className={styles.filters}>
        <button
          className={filter === 'all' ? styles.filterActive : ''}
          onClick={() => setFilter('all')}
        >
          {t('myReservations.all')} ({reservations.length})
        </button>
        <button
          className={filter === 'PENDING' ? styles.filterActive : ''}
          onClick={() => setFilter('PENDING')}
        >
          {t('myReservations.pending')} ({reservations.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          className={filter === 'APPROVED' ? styles.filterActive : ''}
          onClick={() => setFilter('APPROVED')}
        >
          {t('myReservations.approved')} ({reservations.filter(r => r.status === 'APPROVED').length})
        </button>
        <button
          className={filter === 'REJECTED' ? styles.filterActive : ''}
          onClick={() => setFilter('REJECTED')}
        >
          {t('myReservations.rejected')} ({reservations.filter(r => r.status === 'REJECTED').length})
        </button>
        <button
          className={filter === 'CANCELLED' ? styles.filterActive : ''}
          onClick={() => setFilter('CANCELLED')}
        >
          {t('myReservations.cancelled')} ({reservations.filter(r => r.status === 'CANCELLED').length})
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <p className={styles.emptyState}>{t('myReservations.noReservations')}</p>
      ) : (
        <div className={styles.reservationsList}>
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className={styles.reservationCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{reservation.title}</h3>
                  <p className={styles.spaceInfo}>
                    {reservation.space?.name || t('myReservations.noSpaceAssigned')}
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
                    <strong>{t('myReservations.start')}:</strong>
                    <span>{formatDateTime(reservation.start_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>{t('myReservations.end')}:</strong>
                    <span>{formatDateTime(reservation.end_at)}</span>
                  </div>
                </div>

                {reservation.decision_note && (
                  <div className={styles.decisionNote}>
                    <strong>{t('myReservations.decisionNote')}:</strong>
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
                    {t('myReservations.cancelReservation')}
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
