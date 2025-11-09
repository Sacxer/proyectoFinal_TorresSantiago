import React, { useEffect, useState } from 'react'
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { db } from '../../Firebase/Firebase'
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'

const SectionsList = () => {
  const [sections, setSections] = useState([])
  const { userRole } = useAuth()

  useEffect(() => {
    const q = query(collection(db, 'sections'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setSections(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  const handleDelete = async (id) => {
    if (userRole !== 'Editor') return alert('Solo Editores pueden eliminar secciones')
    if (!confirm('¿Eliminar sección? Esto no eliminará las noticias asociadas (si deseas eliminarlas, hazlo manualmente).')) return
    await deleteDoc(doc(db, 'sections', id))
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Secciones</Typography>
          <Button component={Link} to="/dashboard/sections/new" variant="contained">Nueva sección</Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Slug / ID</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sections.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.slug || s.id}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/dashboard/sections/edit/${s.id}`} size="small">Editar</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(s.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  )
}

export default SectionsList
