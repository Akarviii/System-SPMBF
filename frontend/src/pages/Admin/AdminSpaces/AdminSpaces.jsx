import { useState, useEffect } from 'react'
import spaceService from '../../../services/spaceService'
import FormField from '../../../components/FormField'
import FormAlert from '../../../components/FormAlert'
import styles from './AdminSpaces.module.css'

const AdminSpaces = () => {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    is_active: true,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    try {
      setLoading(true)
      const data = await spaceService.getAll()
      setSpaces(data)
    } catch (err) {
      setLoadError('Error loading available spaces')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (space = null) => {
    if (space) {
      setEditingSpace(space)
      setFormData({
        name: space.name,
        description: space.description,
        location: space.location,
        is_active: space.is_active,
      })
    } else {
      setEditingSpace(null)
      setFormData({
        name: '',
        description: '',
        location: '',
        is_active: true,
      })
    }
    setErrors({})
    setFormError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSpace(null)
    setErrors({})
    setFormError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'description':
        if (!value.trim()) return 'Description is required'
        return ''
      case 'location':
        if (!value.trim()) return 'Location is required'
        return ''
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const nameError = validateField('name', formData.name)
    if (nameError) newErrors.name = nameError

    const descError = validateField('description', formData.description)
    if (descError) newErrors.description = descError

    const locError = validateField('location', formData.location)
    if (locError) newErrors.location = locError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) return

    try {
      if (editingSpace) {
        await spaceService.update(editingSpace.id, formData)
      } else {
        await spaceService.create(formData)
      }

      await loadSpaces()
      handleCloseModal()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error saving that space')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this space? You cannot undo this action.')) return

    try {
      await spaceService.delete(id)
      await loadSpaces()
    } catch (err) {
      alert('Error deleting that space')
      console.error(err)
    }
  }

  if (loading) return <div>Loading available spaces...</div>

  return (
    <div className={styles.adminSpacesPage}>
      <div className={styles.header}>
        <div>
          <h1>Spaces Management</h1>
          <p>Manage the spaces available for reservation</p>
        </div>
        <button onClick={() => handleOpenModal()} className={styles.createBtn}>
          + Create Space
        </button>
      </div>

      {loadError && <FormAlert type="error" message={loadError} />}

      {spaces.length === 0 ? (
        <p className={styles.emptyState}>No new spaces</p>
      ) : (
        <div className={styles.spacesGrid}>
          {spaces.map(space => (
            <div key={space.id} className={styles.spaceCard}>
              <div className={styles.cardHeader}>
                <h3>{space.name}</h3>
                <span className={space.is_active ? styles.statusActive : styles.statusInactive}>
                  {space.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className={styles.description}>{space.description}</p>
              <p className={styles.location}>
                <strong>Location:</strong> {space.location}
              </p>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleOpenModal(space)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(space.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingSpace ? 'Edit Space' : 'Create Space'}</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>×</button>
            </div>

            <FormAlert
              type="error"
              message={formError}
              onClose={() => setFormError('')}
            />

            <form onSubmit={handleSubmit} className={styles.form}>
              <FormField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                required
                placeholder="3° Module"
              />

              <FormField
                label="Description"
                name="description"
                as="textarea"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.description}
                required
                rows={3}
                placeholder="Space Description"
              />

              <FormField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.location}
                required
                placeholder="App #2, Street 8-3"
              />

              <FormField
                type="checkbox"
                name="is_active"
                label="Active Space"
                checked={formData.is_active}
                onChange={handleChange}
              />

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingSpace ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSpaces
