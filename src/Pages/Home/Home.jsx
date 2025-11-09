import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Card, CardContent, CardMedia, CardActionArea, Box } from '@mui/material';
import { db } from '../../Firebase/Firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { Link } from 'react-router-dom'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [imageErrors, setImageErrors] = useState({})

  const handleImageError = (postId) => {
    setImageErrors(prev => ({ ...prev, [postId]: true }))
  }

  useEffect(() => {
    const load = async () => {
      try {
        console.log('Home: Starting to load posts')
        const q = query(collection(db, 'posts'), where('status', '==', 'Publicado'), orderBy('createdAt', 'desc'), limit(20))
        console.log('Home: Query created')
        let snap = await getDocs(q)
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        console.log('Home: Posts loaded by createdAt:', list.length)
        console.log('Home: First post data:', list[0])

        // Fallback: if none found (maybe documents missing createdAt), try ordering by updatedAt
        if (list.length === 0) {
          console.log('Home: No posts found by createdAt, trying updatedAt fallback')
          try {
            const q2 = query(collection(db, 'posts'), where('status', '==', 'Publicado'), orderBy('updatedAt', 'desc'), limit(20))
            snap = await getDocs(q2)
            list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            console.log('Home: Posts loaded by updatedAt fallback:', list.length)
            console.log('Home: First fallback post data:', list[0])
            if (list.length > 0) console.warn('Home: used updatedAt fallback to load posts')
          } catch (err) {
            console.error('Home fallback by updatedAt failed', err)
          }
        }

        console.log('Home: Final posts list:', list.length)
        setPosts(list)
      } catch (err) {
        console.error('Error loading home posts', err)
      }
    }
    load()
  }, [])

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Noticias Destacadas
      </Typography>
      <Grid container spacing={4}>
        {posts.map(p => {
          console.log('Post data:', p.id, 'imageUrl:', p.imageUrl)
          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={p.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 3,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    '& .card-image': {
                      transform: 'scale(1.08)',
                    }
                  }
                }}
              >
                <CardActionArea component={Link} to={`/noticia/${p.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  {p.imageUrl && !imageErrors[p.id] && (
                    <CardMedia
                      component="img"
                      height="280"
                      image={p.imageUrl}
                      alt={p.title}
                      className="card-image"
                      onError={() => handleImageError(p.id)}
                      sx={{
                        transition: 'transform 0.3s ease-in-out',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  {(!p.imageUrl || imageErrors[p.id]) && (
                    <Box
                      sx={{
                        height: 280,
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.500',
                        fontSize: '4rem'
                      }}
                    >
                      📰
                    </Box>
                  )}
                </CardActionArea>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 'bold',
                      mb: 2,
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {p.title}
                  </Typography>
                  {p.subtitle && (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5
                      }}
                    >
                      {p.subtitle}
                    </Typography>
                  )}
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {p.sectionName || p.category}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Container>
  )
}

export default Home;