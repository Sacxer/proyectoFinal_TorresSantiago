import React, { useEffect, useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material'
import { db } from '../../Firebase/Firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
// Small internal slugify helper to avoid adding a new dependency
const slugifyStr = (text = '') =>
  text
    .toString()
    .normalize('NFKD') // split accented letters
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
import { useAuth } from '../../contexts/AuthContext'

const EditSection = () => {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { userRole } = useAuth()

  useEffect(() => {
    if (!id) return
    const load = async () => {
      const ref = doc(db, 'sections', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) return
      setName(snap.data().name || '')
    }
    load()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (userRole !== 'Editor') return setError('Solo Editores pueden editar secciones')
    try {
      const ref = doc(db, 'sections', id)
  await updateDoc(ref, { name, slug: slugifyStr(name || '') })
      navigate('/dashboard/sections')
    } catch (err) {
      setError(err.message || 'Error actualizando sección')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Editar sección</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 2 }}>
          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" variant="contained">Guardar</Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default EditSection
