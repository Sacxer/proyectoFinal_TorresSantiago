import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Grid } from '@mui/material'
import { db } from '../../Firebase/Firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'

const ReporterDashboard = () => {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'posts'),
      where('authorId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setPosts(items)
    })
    return () => unsub()
  }, [currentUser])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Mis noticias</Typography>
        <Button component={Link} to="/dashboard/new" variant="contained">Nueva noticia</Button>
      </Box>

      <Grid container spacing={2}>
        {posts.map((p) => (
          <Grid item xs={12} md={6} key={p.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Estado: {p.status || 'borrador'}</Typography>
                  {p.statusDescription && (
                    <Typography variant="body2" color="text.secondary">{p.statusDescription}</Typography>
                  )}
                  {p.responsibleName && (
                    <Typography variant="caption" color="text.secondary">Responsable: {p.responsibleName} {p.responsibleRole ? `(${p.responsibleRole})` : ''}</Typography>
                  )}
                <Box sx={{ mt: 2 }}>
                  <Button component={Link} to={`/dashboard/edit/${p.id}`} size="small">Editar</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {posts.length === 0 && (
          <Typography variant="body2" sx={{ ml: 1 }}>No has creado noticias aún.</Typography>
        )}
      </Grid>
    </Box>
  )
}

export default ReporterDashboard
