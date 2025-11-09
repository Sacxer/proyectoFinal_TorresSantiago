import React, { useEffect, useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { db, storage } from '../../Firebase/Firebase'
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getStatusMeta, historyEntry } from '../../utils/statusHelper'
import { useNavigate, useParams } from 'react-router-dom'

const statuses = ['Edición','Terminado','Publicado','Desactivado']

const EditPost = () => {
  const { id } = useParams()
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [sections, setSections] = useState([])
  const [sectionId, setSectionId] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [status, setStatus] = useState('Edición')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const ref = doc(db, 'posts', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        setError('Noticia no encontrada')
        return
      }
      const data = snap.data()
      setPost({ id: snap.id, ...data })
      setTitle(data.title || '')
      setSubtitle(data.subtitle || '')
      setContent(data.content || '')
      setSectionId(data.sectionId || '')
      setImageUrl(data.imageUrl || null)
      setStatus(data.status || 'Edición')
    }
    load()
  }, [id])

  useEffect(() => {
    const loadSections = async () => {
      try {
        const q = query(collection(db, 'sections'), orderBy('name'))
        const snap = await getDocs(q)
        const secs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSections(secs)
        // if no section selected yet, keep existing
      } catch (err) {
        console.error('Error loading sections', err)
      }
    }
    loadSections()
  }, [])

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ref = doc(db, 'posts', id)
      

      // fetch previous snapshot to log history
      const prevSnap = await getDoc(ref)
      const prevData = prevSnap.exists() ? prevSnap.data() : null

      const selectedSection = sections.find(s => s.id === sectionId)
      const updates = {
        title,
        subtitle,
        content,
        category: selectedSection ? selectedSection.name : (post?.category || null),
        sectionId: sectionId || null,
        sectionName: selectedSection ? selectedSection.name : (post?.sectionName || null),
        updatedAt: serverTimestamp(),
        ...getStatusMeta(status, currentUser, post)
      }

      // image replacement
      if (imageFile) {
        const path = `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`
        const sRef = storageRef(storage, path)
        await uploadBytes(sRef, imageFile)
        const url = await getDownloadURL(sRef)
        updates.imageUrl = url
      }

      // Prevent Reportero from publishing directly
      if (userRole === 'Reportero' && status === 'Publicado') {
        // force to Terminado instead
        updates.status = 'Terminado'
        // update meta accordingly
        updates.statusDescription = 'Listo para revisión por un editor'
        updates.responsibleId = null
        updates.responsibleName = 'Equipo de editores'
        updates.responsibleRole = 'Editor'
      } else {
        updates.status = status
      }

      await updateDoc(ref, updates)

      // add history entry for status change / edit
      await addDoc(collection(db, 'posts', id, 'history'), historyEntry({
        action: 'update',
        fromStatus: prevData?.status || null,
        toStatus: updates.status || status || prevData?.status || null,
        actor: { ...currentUser, role: userRole },
        note: updates.statusDescription || prevData?.statusDescription || ''
      }))

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error actualizando la noticia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Editar noticia</Typography>
        {error && <Alert severity="error">{error}</Alert>}

        {post ? (
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
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imageUrl && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Imagen actual:</Typography>
                  <img src={imageUrl} alt="post" style={{ maxWidth: '100%', height: 'auto' }} />
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

            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
          </Box>
        ) : (
          <Typography>Cargando...</Typography>
        )}

      </Paper>
    </Container>
  )
}

export default EditPost
