import React, { useEffect, useState } from 'react'
import { Container, Paper, Typography, Box, Button, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../Firebase/Firebase'
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore'
import { getStatusMeta, historyEntry } from '../../utils/statusHelper'
import { useNavigate, useParams } from 'react-router-dom'

const ManagePost = () => {
  const { id } = useParams()
  const { currentUser, userRole } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const ref = doc(db, 'posts', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        setError('Noticia no encontrada')
        return
      }
      setPost({ id: snap.id, ...snap.data() })
    }
    load()
  }, [id])

  if (!currentUser) {
    navigate('/login')
    return null
  }

  const changeStatus = async (newStatus) => {
    if (userRole !== 'Editor') {
      setError('Solo los Editores pueden cambiar el estado de la noticia.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const ref = doc(db, 'posts', id)
      // set status meta depending on newStatus and current editor
      const meta = {}
      if (newStatus === 'Publicado') {
        meta.statusDescription = 'Publicado en el sitio'
        meta.responsibleId = currentUser.uid
        meta.responsibleName = currentUser.displayName || currentUser.email || null
        meta.responsibleRole = 'Editor'
      } else if (newStatus === 'Terminado') {
        meta.statusDescription = 'Listo para revisión por un editor'
        meta.responsibleId = null
        meta.responsibleName = 'Equipo de editores'
        meta.responsibleRole = 'Editor'
      } else if (newStatus === 'Desactivado') {
        meta.statusDescription = 'Desactivado por el editor'
        meta.responsibleId = currentUser.uid
        meta.responsibleName = currentUser.displayName || currentUser.email || null
        meta.responsibleRole = 'Editor'
      } else if (newStatus === 'Edición') {
        meta.statusDescription = 'En edición por el autor'
        meta.responsibleId = post.authorId || null
        meta.responsibleName = post.authorName || post.authorEmail || null
        meta.responsibleRole = 'Reportero'
      }

      // Ensure sectionId exists when publishing: try to resolve from sectionName if missing
      const updates = { status: newStatus, updatedAt: serverTimestamp(), ...meta }
      if (newStatus === 'Publicado') {
        // if post already has sectionId, good. Otherwise try to find section by sectionName
        const snap = await getDoc(ref)
        const current = snap.exists() ? snap.data() : null
        if (current) {
          if (!current.sectionId && current.sectionName) {
            // try to find section by exact name or slug
            try {
              const { collection, query, where, getDocs } = await import('firebase/firestore')
              const q1 = query(collection(db, 'sections'), where('name', '==', current.sectionName))
              const r1 = await getDocs(q1)
              if (!r1.empty) {
                updates.sectionId = r1.docs[0].id
              } else {
                // try by slug
                const q2 = query(collection(db, 'sections'), where('slug', '==', (current.sectionName || '').toString().toLowerCase()))
                const r2 = await getDocs(q2)
                if (!r2.empty) updates.sectionId = r2.docs[0].id
              }
            } catch (err) {
              console.error('Error resolving section for publish', err)
            }
          }
          // if after attempts there is still no sectionId, prevent publish and ask editor to assign
          if (!current.sectionId && !updates.sectionId) {
            setError('No se pudo determinar la sección de la noticia. Asigna una sección en editar noticia antes de publicar.')
            setLoading(false)
            return
          }
        }
      }

      await updateDoc(ref, updates)
      // reload post
      const snap = await getDoc(ref)
      setPost({ id: snap.id, ...snap.data() })
      // add history entry
      await addDoc(collection(db, 'posts', id, 'history'), historyEntry({
        action: 'changeStatus',
        fromStatus: post?.status || null,
        toStatus: newStatus,
        actor: { ...currentUser, role: userRole },
        note: meta.statusDescription || ''
      }))
    } catch (err) {
      setError(err.message || 'Error al actualizar estado')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestChange = (newStatus) => {
    // confirm for publish and deactivate
    if (newStatus === 'Publicado' || newStatus === 'Desactivado') {
      setConfirmAction(newStatus)
      setConfirmOpen(true)
      return
    }
    changeStatus(newStatus)
  }

  const handleConfirm = async () => {
    setConfirmOpen(false)
    if (confirmAction) await changeStatus(confirmAction)
    setConfirmAction(null)
  }

  const handleCancelConfirm = () => {
    setConfirmOpen(false)
    setConfirmAction(null)
  }

  const handleGoBack = () => navigate('/dashboard')

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Gestionar noticia</Typography>
          <Button onClick={handleGoBack}>Volver</Button>
        </Box>

        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {!post ? (
          <Typography sx={{ mt: 2 }}>Cargando...</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">{post.title}</Typography>
            <Typography variant="subtitle2" color="text.secondary">Autor: {post.authorName || post.authorEmail}</Typography>
            <Typography variant="body2" sx={{ my: 2 }}>{post.subtitle}</Typography>

            <Box sx={{ my: 2 }}>
              <Typography variant="body2">Estado actual: {post.status || 'borrador'}</Typography>
            </Box>

            {userRole === 'Editor' ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" color="primary" disabled={loading} onClick={() => handleRequestChange('Publicado')}>Publicar</Button>
                <Button variant="outlined" color="warning" disabled={loading} onClick={() => handleRequestChange('Terminado')}>Marcar como Terminado</Button>
                <Button variant="contained" color="error" disabled={loading} onClick={() => handleRequestChange('Desactivado')}>Desactivar</Button>
              </Box>
            ) : (
              <Typography color="text.secondary">No tienes permiso para cambiar el estado.</Typography>
            )}
          </Box>
        )}
      </Paper>
      <Dialog open={confirmOpen} onClose={handleCancelConfirm}>
        <DialogTitle>Confirmar acción</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction === 'Publicado' && '¿Estás seguro que deseas publicar esta noticia? Esto hará que sea visible públicamente.'}
            {confirmAction === 'Desactivado' && '¿Estás seguro que deseas desactivar esta noticia? Esto la ocultará del sitio.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirm}>Cancelar</Button>
          <Button onClick={handleConfirm} variant="contained" color={confirmAction === 'Desactivado' ? 'error' : 'primary'}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ManagePost
