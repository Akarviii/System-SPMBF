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
      setError('Error al cargar espacios')
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
      setError(err.response?.data?.detail || 'Error al guardar espacio')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este espacio? Esta acción no se puede deshacer.')) return

    try {
      await spaceService.delete(id)
      await loadSpaces()
    } catch (err) {
      alert('Error al eliminar espacio')
      console.error(err)
    }
  }

  if (loading) return <div>Cargando espacios...</div>

  return (
    <div className={styles.adminSpacesPage}>
      <div className={styles.header}>
        <div>
          <h1>Gestión de Espacios</h1>
          <p>Administra los espacios disponibles para reserva</p>
        </div>
        <button onClick={() => handleOpenModal()} className={styles.createBtn}>
          + Crear Espacio
        </button>
      </div>

      {spaces.length === 0 ? (
        <p className={styles.emptyState}>No hay espacios creados</p>
      ) : (
        <div className={styles.spacesGrid}>
          {spaces.map(space => (
            <div key={space.id} className={styles.spaceCard}>
              <div className={styles.cardHeader}>
                <h3>{space.name}</h3>
                <span className={space.is_active ? styles.statusActive : styles.statusInactive}>
                  {space.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className={styles.description}>{space.description}</p>
              <p className={styles.location}>
                <strong>Ubicación:</strong> {space.location}
              </p>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleOpenModal(space)}
                  className={styles.editBtn}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(space.id)}
                  className={styles.deleteBtn}
                >
                  Eliminar
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
              <h2>{editingSpace ? 'Editar Espacio' : 'Crear Espacio'}</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>×</button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Módulo 3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descripción *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Descripción del espacio"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Ubicación *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Edificio A, Piso 2"
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
                  Espacio activo
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingSpace ? 'Actualizar' : 'Crear'}
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
