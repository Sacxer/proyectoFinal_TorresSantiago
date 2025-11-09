import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material'
import { db } from '../../Firebase/Firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { Link } from 'react-router-dom'

const EditorDashboard = () => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setPosts(items)
    })
    return () => unsub()
  }, [])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button component={Link} to="/dashboard/sections" variant="outlined" size="small">Gestionar secciones</Button>
      </Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Todas las noticias</Typography>

      <Grid container spacing={2}>
        {posts.map((p) => (
          <Grid item xs={12} md={6} key={p.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.title}</Typography>
                <Typography variant="body2" color="text.secondary">Autor: {p.authorName || p.authorEmail}</Typography>
                <Typography variant="body2" color="text.secondary">Estado: {p.status || 'borrador'}</Typography>
                {p.statusDescription && (
                  <Typography variant="body2" color="text.secondary">{p.statusDescription}</Typography>
                )}
                {p.responsibleName && (
                  <Typography variant="caption" color="text.secondary">Responsable: {p.responsibleName} {p.responsibleRole ? `(${p.responsibleRole})` : ''}</Typography>
                )}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button component={Link} to={`/dashboard/edit/${p.id}`} size="small">Editar</Button>
                  <Button component={Link} to={`/dashboard/manage/${p.id}`} size="small" variant="contained">Gestionar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {posts.length === 0 && (
          <Typography variant="body2" sx={{ ml: 1 }}>No hay noticias publicadas aún.</Typography>
        )}
      </Grid>
    </Box>
  )
}

export default EditorDashboard
