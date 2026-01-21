import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import spaceService from '../../services/spaceService'
import reservationService from '../../services/reservationService'
import FormField from '../../components/FormField'
import FormAlert from '../../components/FormAlert'
import styles from './CreateReservation.module.css'

const CreateReservation = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [formData, setFormData] = useState({
    space: '',
    title: '',
    description: '',
    start_at: '',
    end_at: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return t('createReservation.errorTitle')
        return ''
      case 'start_at':
        if (!value) return t('createReservation.errorStartDate')
        return ''
      case 'end_at':
        if (!value) return t('createReservation.errorEndDate')
        if (formData.start_at && new Date(value) <= new Date(formData.start_at)) {
          return t('createReservation.errorDateOrder')
        }
        return ''
      default:
        return ''
    }
  }

  const validateDuration = () => {
    if (!formData.start_at || !formData.end_at) {
      return t('createReservation.errorStartDate')
    }

    const start = new Date(formData.start_at)
    const end = new Date(formData.end_at)
    const durationMinutes = (end - start) / (1000 * 60)

    if (durationMinutes < 30) {
      return t('createReservation.errorMinDuration')
    }

    if (durationMinutes > 240) {
      return t('createReservation.errorMaxDuration')
    }

    if (start >= end) {
      return t('createReservation.errorDateOrder')
    }

    return null
  }

  const validateForm = () => {
    const newErrors = {}

    const titleError = validateField('title', formData.title)
    if (titleError) newErrors.title = titleError

    const startError = validateField('start_at', formData.start_at)
    if (startError) newErrors.start_at = startError

    const endError = validateField('end_at', formData.end_at)
    if (endError) newErrors.end_at = endError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccess(false)

    if (!validateForm()) return

    const durationError = validateDuration()
    if (durationError) {
      setFormError(durationError)
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
                       t('createReservation.errorMessage')
      setFormError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.createPage}>
      <div className={styles.header}>
        <h1>{t('createReservation.title')}</h1>
        <p>{t('createReservation.subtitle')}</p>
      </div>

      <div className={styles.formContainer}>
        <FormAlert
          type="success"
          message={success ? t('createReservation.successMessage') : ''}
        />

        <FormAlert
          type="error"
          message={formError}
          onClose={() => setFormError('')}
        />

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField
            label={t('createReservation.selectSpace')}
            name="space"
            as="select"
            value={formData.space}
            onChange={handleChange}
          >
            <option value="">{t('createReservation.autoAssign')}</option>
            {spaces.map(space => (
              <option key={space.id} value={space.id}>
                {space.name} - {space.location}
              </option>
            ))}
          </FormField>

          <FormField
            label={t('createReservation.formTitle')}
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.title}
            required
            placeholder={t('createReservation.titlePlaceholder')}
          />

          <FormField
            label={t('createReservation.description')}
            name="description"
            as="textarea"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder={t('createReservation.descriptionPlaceholder')}
          />

          <div className={styles.formRow}>
            <FormField
              label={t('createReservation.startDate')}
              name="start_at"
              type="datetime-local"
              value={formData.start_at}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.start_at}
              required
            />

            <FormField
              label={t('createReservation.endDate')}
              name="end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.end_at}
              required
            />
          </div>

          <div className={styles.info}>
            <strong>{t('createReservation.errorMinDuration')}</strong>
            <br />
            <strong>{t('createReservation.errorMaxDuration')}</strong>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelBtn}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? t('createReservation.submitting') : t('createReservation.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReservation
