import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import spaceService from '../../services/spaceService'
import styles from './Spaces.module.css'

const Spaces = () => {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) return <div>Loading Available Spaces...</div>
  if (error) return <div className={styles.error}>{error}</div>

  return (
    <div className={styles.spacesPage}>
      <div className={styles.header}>
        <h1>Available Spaces</h1>
        <p>Select a space to view its availability</p>
      </div>

      {spaces.length === 0 ? (
        <p className={styles.emptyState}>No spaces available</p>
      ) : (
        <div className={styles.spacesGrid}>
          {spaces.map((space) => (
            <div key={space.id} className={styles.spaceCard}>
              <div className={styles.spaceHeader}>
                <h2>{space.name}</h2>
                {space.is_active && (
                  <span className={styles.activeBadge}>Active</span>
                )}
              </div>
              <p className={styles.description}>{space.description}</p>
              <p className={styles.location}>
                <strong>Location:</strong> {space.location}
              </p>
              <Link to="/create-reservation" className={styles.reserveBtn}>
                Book
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Spaces
