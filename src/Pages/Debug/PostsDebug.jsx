import React, { useEffect, useState } from 'react'
import { Container, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material'
import { db } from '../../Firebase/Firebase'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

const PostsDebug = () => {
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(200))
        const snap = await getDocs(q)
        setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
        setPosts([])
      }
    }
    load()
  }, [])

  if (posts === null) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Debug: posts (latest 200)</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>createdAt</TableCell>
              <TableCell>sectionId</TableCell>
              <TableCell>sectionName</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.createdAt && p.createdAt.toDate ? p.createdAt.toDate().toLocaleString() : String(p.createdAt)}</TableCell>
                <TableCell>{p.sectionId}</TableCell>
                <TableCell>{p.sectionName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  )
}

export default PostsDebug
