import React, { useState, useEffect } from 'react'
import { Container, Paper, Typography, TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../Firebase/Firebase'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore'
import { getStatusMeta, historyEntry } from '../../utils/statusHelper'
import { useNavigate } from 'react-router-dom'
import ImageUpload from '../../Components/ImageUpload'
import { uploadNewsImage } from '../../utils/imageUpload'

const statuses = ['Edición','Terminado','Publicado','Desactivado']

const NewPost = () => {
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [sections, setSections] = useState([])
  const [sectionId, setSectionId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('Edición')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'sections'), orderBy('name'))
        const snap = await getDocs(q)
        const secs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSections(secs)
        if (secs.length) setSectionId(secs[0].id)
      } catch (err) {
        console.error('Error loading sections', err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser])

  const handleImageUpload = (result) => {
    console.log('Image uploaded result:', result)
    setImageUrl(result.url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const statusMeta = getStatusMeta(status || 'Edición', currentUser)
      const selectedSection = sections.find(s => s.id === sectionId)

      const post = {
        title,
        subtitle,
        content,
        category: selectedSection ? selectedSection.name : null,
        sectionId: sectionId || null,
        sectionName: selectedSection ? selectedSection.name : null,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || null,
        authorEmail: currentUser.email || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: status || 'Edición',
        imageUrl: imageUrl || null,
        // editorial workflow fields
        ...statusMeta
      }

      const docRef = await addDoc(collection(db, 'posts'), post)

      // add history entry
      await addDoc(collection(db, 'posts', docRef.id, 'history'), historyEntry({
        action: 'create',
        fromStatus: null,
        toStatus: post.status,
        actor: { ...currentUser, role: userRole },
        note: post.statusDescription
      }))

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error creando la noticia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Crear noticia</Typography>
        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Subtítulo / Bajante" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          <TextField label="Contenido" value={content} onChange={(e) => setContent(e.target.value)} multiline rows={8} required />

          <FormControl fullWidth>
            <InputLabel id="section-label">Sección</InputLabel>
            <Select labelId="section-label" value={sectionId} label="Sección" onChange={(e) => setSectionId(e.target.value)}>
              {sections.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" gutterBottom>Imagen de la noticia</Typography>
            <ImageUpload onImageUploaded={handleImageUpload} />
            {imageUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Imagen subida correctamente</Typography>
              </Box>
            )}
          </Box>

          <FormControl fullWidth>
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Estado"
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s} disabled={s === 'Publicado' && userRole === 'Reportero'}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Crear noticia'}</Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default NewPost
