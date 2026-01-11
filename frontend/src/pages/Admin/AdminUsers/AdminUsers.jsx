import { useState, useEffect } from 'react'
import userService from '../../../services/userService'
import FormField from '../../../components/FormField'
import FormAlert from '../../../components/FormAlert'
import styles from './AdminUsers.module.css'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
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
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAll()
      setUsers(data)
    } catch (err) {
      setLoadError('Error loading users')
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
    setErrors({})
    setFormError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
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
      case 'email':
        if (!value.trim()) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email'
        return ''
      case 'first_name':
        if (!value.trim()) return 'Name is required'
        return ''
      case 'last_name':
        if (!value.trim()) return 'Surname is required'
        return ''
      case 'password':
        if (!editingUser && !value) return 'Password is required'
        if (value && value.length < 6) return 'Password must be at least 6 characters'
        return ''
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError

    const nameError = validateField('first_name', formData.first_name)
    if (nameError) newErrors.first_name = nameError

    const surnameError = validateField('last_name', formData.last_name)
    if (surnameError) newErrors.last_name = surnameError

    const passwordError = validateField('password', formData.password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validateForm()) return

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
      setFormError(err.response?.data?.detail || 'Error saving user')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return

    try {
      await userService.delete(id)
      await loadUsers()
    } catch (err) {
      alert('Error deactivating user')
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

      {loadError && <FormAlert type="error" message={loadError} />}

      {users.length === 0 ? (
        <p className={styles.emptyState}>No users found</p>
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

            <FormAlert
              type="error"
              message={formError}
              onClose={() => setFormError('')}
            />

            <form onSubmit={handleSubmit} className={styles.form}>
              <FormField
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                required
              />

              <div className={styles.formRow}>
                <FormField
                  label="Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.first_name}
                  required
                />
                <FormField
                  label="Surname"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.last_name}
                  required
                />
              </div>

              <FormField
                label="Role"
                name="role"
                as="select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Administrator</option>
              </FormField>

              <FormField
                label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                required={!editingUser}
              />

              <FormField
                type="checkbox"
                name="is_active"
                label="Active User"
                checked={formData.is_active}
                onChange={handleChange}
              />

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
