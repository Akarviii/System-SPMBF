import { useState, useEffect } from 'react'
import reservationService from '../../../services/reservationService'
import { formatDateTime } from '../../../utils/dateUtils'
import styles from './AdminReservations.module.css'

const AdminReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('PENDING')
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [decisionNote, setDecisionNote] = useState('')
  const [decisionType, setDecisionType] = useState('')

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await reservationService.getAll()
      setReservations(data)
    } catch (err) {
      setError('Error al cargar reservas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDecisionModal = (reservation, type) => {
    setSelectedReservation(reservation)
    setDecisionType(type)
    setDecisionNote('')
    setShowDecisionModal(true)
  }

  const handleCloseDecisionModal = () => {
    setShowDecisionModal(false)
    setSelectedReservation(null)
    setDecisionNote('')
    setDecisionType('')
  }

  const handleDecision = async () => {
    try {
      if (decisionType === 'approve') {
        await reservationService.approve(selectedReservation.id, decisionNote)
      } else {
        await reservationService.reject(selectedReservation.id, decisionNote)
      }

      await loadReservations()
      handleCloseDecisionModal()
    } catch (err) {
      alert('Error al procesar la decisión')
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
    <div className={styles.adminReservationsPage}>
      <div className={styles.header}>
        <div>
          <h1>Gestión de Reservas</h1>
          <p>Aprueba, rechaza o gestiona todas las reservas</p>
        </div>
      </div>

      <div className={styles.filters}>
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
        <button
          className={filter === 'all' ? styles.filterActive : ''}
          onClick={() => setFilter('all')}
        >
          Todas ({reservations.length})
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <p className={styles.emptyState}>No hay reservas</p>
      ) : (
        <div className={styles.reservationsList}>
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className={styles.reservationCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{reservation.title}</h3>
                  <p className={styles.createdBy}>
                    Creada por: {reservation.created_by?.first_name} {reservation.created_by?.last_name}
                  </p>
                </div>
                {getStatusBadge(reservation.status)}
              </div>

              <div className={styles.cardBody}>
                <p className={styles.spaceInfo}>
                  <strong>Espacio:</strong> {reservation.space?.name || 'Sin asignar'}
                </p>

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
                    {reservation.approved_by && (
                      <p className={styles.approver}>
                        Por: {reservation.approved_by.first_name} {reservation.approved_by.last_name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {reservation.status === 'PENDING' && (
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleOpenDecisionModal(reservation, 'approve')}
                    className={styles.approveBtn}
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleOpenDecisionModal(reservation, 'reject')}
                    className={styles.rejectBtn}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDecisionModal && (
        <div className={styles.modalOverlay} onClick={handleCloseDecisionModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {decisionType === 'approve' ? 'Aprobar Reserva' : 'Rechazar Reserva'}
              </h2>
              <button onClick={handleCloseDecisionModal} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.modalBody}>
              <p><strong>Reserva:</strong> {selectedReservation?.title}</p>
              <p><strong>Espacio:</strong> {selectedReservation?.space?.name}</p>
              <p><strong>Fecha:</strong> {formatDateTime(selectedReservation?.start_at)}</p>

              <div className={styles.formGroup}>
                <label>Nota (opcional)</label>
                <textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  rows="3"
                  placeholder="Agrega una nota explicativa para el usuario..."
                />
              </div>

              <div className={styles.modalActions}>
                <button onClick={handleCloseDecisionModal} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button
                  onClick={handleDecision}
                  className={decisionType === 'approve' ? styles.confirmApproveBtn : styles.confirmRejectBtn}
                >
                  {decisionType === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReservations
