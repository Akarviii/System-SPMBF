import { useState, useEffect } from 'react'
import userService from '../../../services/userService'
import styles from './AdminUsers.module.css'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'TEACHER',
    password: '',
    is_active: true,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      setError('Error al cargar usuarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        password: '',
        is_active: user.is_active,
      })
    } else {
      setEditingUser(null)
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'TEACHER',
        password: '',
        is_active: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
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
      const payload = { ...formData }
      if (editingUser && !payload.password) {
        delete payload.password
      }

      if (editingUser) {
        await userService.update(editingUser.id, payload)
      } else {
        await userService.create(payload)
      }

      await loadUsers()
      handleCloseModal()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar usuario')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return

    try {
      await userService.delete(id)
      await loadUsers()
    } catch (err) {
      alert('Error al desactivar usuario')
      console.error(err)
    }
  }

  if (loading) return <div>Loading users...</div>

  return (
    <div className={styles.adminUsersPage}>
      <div className={styles.header}>
        <div>
          <h1>User Management</h1>
          <p>Manage all users in the system</p>
        </div>
        <button onClick={() => handleOpenModal()} className={styles.createBtn}>
          + Create User
        </button>
      </div>

      {users.length === 0 ? (
        <p className={styles.emptyState}>No hay usuarios</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === 'ADMIN' ? styles.roleAdmin : styles.roleTeacher}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={user.is_active ? styles.statusActive : styles.statusInactive}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleOpenModal(user)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>×</button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>E-mail *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Surname *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="TEACHER">Profesor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Password {editingUser && '(dejar en blanco para no cambiar)'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
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
                  Active User
                </label>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
