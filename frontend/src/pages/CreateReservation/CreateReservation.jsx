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
      console.error('Error loading spaces...', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateDuration = () => {
    if (!formData.start_at || !formData.end_at) {
      return 'You must specify the start and end dates.'
    }

    const start = new Date(formData.start_at)
    const end = new Date(formData.end_at)
    const durationMinutes = (end - start) / (1000 * 60)

    if (durationMinutes < 30) {
      return 'The minimum duration is 30 minutes.'
    }

    if (durationMinutes > 240) {
      return 'The maximum duration is 4 hours.'
    }

    if (start >= end) {
      return 'The end date must be after the start date.'
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
                       'Error creating reservation'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.createPage}>
      <div className={styles.header}>
        <h1>New Reserve</h1>
        <p>Complete the form to create a new reservation</p>
      </div>

      <div className={styles.formContainer}>
        {success && (
          <div className={styles.success}>
            Reservation successfully created! Redirecting...
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="space">
              Space (optional - will be assigned automatically if omitted)
            </label>
            <select
              id="space"
              name="space"
              value={formData.space}
              onChange={handleChange}
            >
              <option value="">Automatic assignment</option>
              {spaces.map(space => (
                <option key={space.id} value={space.id}>
                  {space.name} - {space.location}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Math Class"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Additional information about the reservation"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="start_at">Start Date and Time *</label>
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
              <label htmlFor="end_at">End Date and Time *</label>
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
            <strong>Restrictions:</strong>
            <ul>
              <li>Minimum duration: 30 minutes</li>
              <li>Maximum duration: 4 hours</li>
              <li>Overlaps with existing reservations are not permitted.</li>
            </ul>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReservation
