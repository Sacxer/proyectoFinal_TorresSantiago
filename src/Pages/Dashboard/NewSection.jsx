import React, { useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material'
import { db } from '../../Firebase/Firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
// internal slugify helper to avoid adding dependency
const slugifyStr = (text = '') =>
  text
    .toString()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
import { useAuth } from '../../contexts/AuthContext'

const NewSection = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { userRole } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (userRole !== 'Editor') return setError('Solo Editores pueden crear secciones')
    try {
      const slug = slugifyStr(name || '')
      await addDoc(collection(db, 'sections'), { name, slug, createdAt: serverTimestamp() })
      navigate('/dashboard/sections')
    } catch (err) {
      setError(err.message || 'Error creando sección')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Nueva sección</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 2 }}>
          <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" variant="contained">Crear</Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default NewSection
