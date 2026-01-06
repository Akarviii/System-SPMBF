import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import spaceService from '../../services/spaceService'
import reservationService from '../../services/reservationService'
import styles from './CreateReservation.module.css'

const CreateReservation = () => {
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [formData, setFormData] = useState({
    space: '',
    title: '',
    description: '',
    start_at: '',
    end_at: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    try {
      const data = await spaceService.getAll()
      setSpaces(data.filter(s => s.is_active))
    } catch (err) {
      console.error('Error loading spaces:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateDuration = () => {
    if (!formData.start_at || !formData.end_at) {
      return 'Debes especificar fecha de inicio y fin'
    }

    const start = new Date(formData.start_at)
    const end = new Date(formData.end_at)
    const durationMinutes = (end - start) / (1000 * 60)

    if (durationMinutes < 30) {
      return 'La duración mínima es de 30 minutos'
    }

    if (durationMinutes > 240) {
      return 'La duración máxima es de 4 horas'
    }

    if (start >= end) {
      return 'La fecha de fin debe ser posterior a la de inicio'
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const durationError = validateDuration()
    if (durationError) {
      setError(durationError)
      return
    }

    try {
      setLoading(true)

      const payload = {
        title: formData.title,
        description: formData.description,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
      }

      if (formData.space) {
        payload.space = parseInt(formData.space)
      }

      await reservationService.create(payload)
      setSuccess(true)

      setTimeout(() => {
        navigate('/my-reservations')
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail ||
                       err.response?.data?.error ||
                       'Error al crear la reserva'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.createPage}>
      <div className={styles.header}>
        <h1>Nueva Reserva</h1>
        <p>Completa el formulario para crear una nueva reserva</p>
      </div>

      <div className={styles.formContainer}>
        {success && (
          <div className={styles.success}>
            Reserva creada exitosamente! Redirigiendo...
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="space">
              Espacio (opcional - se asignará automáticamente si se omite)
            </label>
            <select
              id="space"
              name="space"
              value={formData.space}
              onChange={handleChange}
            >
              <option value="">Asignación automática</option>
              {spaces.map(space => (
                <option key={space.id} value={space.id}>
                  {space.name} - {space.location}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Título *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ej: Clase de Matemáticas"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Información adicional sobre la reserva"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_at">Fecha y Hora de Inicio *</label>
              <input
                type="datetime-local"
                id="start_at"
                name="start_at"
                value={formData.start_at}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="end_at">Fecha y Hora de Fin *</label>
              <input
                type="datetime-local"
                id="end_at"
                name="end_at"
                value={formData.end_at}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.info}>
            <strong>Restricciones:</strong>
            <ul>
              <li>Duración mínima: 30 minutos</li>
              <li>Duración máxima: 4 horas</li>
              <li>No se permiten solapamientos con reservas existentes</li>
            </ul>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReservation
