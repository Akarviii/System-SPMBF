import { useState, useEffect } from 'react'
import spaceService from '../../../services/spaceService'
import styles from './AdminSpaces.module.css'

const AdminSpaces = () => {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    is_active: true,
  })

  useEffect(() => {
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    try {
      setLoading(true)
      const data = await spaceService.getAll()
      setSpaces(data)
    } catch (err) {
      setError('Error loading available spaces')
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
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSpace(null)
    setError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      if (editingSpace) {
        await spaceService.update(editingSpace.id, formData)
      } else {
        await spaceService.create(formData)
      }

      await loadSpaces()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving that space')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Delete this space? You cant undo this action.')) return

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

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="3° Module"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Space Description"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="App #2, Street 8-3"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Active Space
                </label>
              </div>

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
