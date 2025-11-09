import { Routes, Route, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import './App.css'
import Header from './Components/Header/Header'
import NavBar from './Components/NavBar/NavBar'
import Footer from './Components/Footer/Footer'
import Home from './Pages/Home/Home'
import CategoryPage from './Pages/CategoryPage/CategoryPage'
import Noticia from './Pages/Noticia/Noticia'
import PostsDebug from './Pages/Debug/PostsDebug'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import Dashboard from './Pages/Dashboard/Dashboard'
import NewPost from './Pages/Dashboard/NewPost'
import EditPost from './Pages/Dashboard/EditPost'
import ManagePost from './Pages/Dashboard/ManagePost'
import SectionsList from './Pages/Dashboard/SectionsList'
import NewSection from './Pages/Dashboard/NewSection'
import EditSection from './Pages/Dashboard/EditSection'

function App() {
  const location = useLocation()
  const hideNav = ['/login', '/register'].includes(location.pathname)
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header />
      {!hideNav && <NavBar />}
      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/internacional" element={<CategoryPage category="Internacional" />} />
          <Route path="/economia" element={<CategoryPage category="Economía" />} />
          <Route path="/tecnologia" element={<CategoryPage category="Tecnología" />} />
          <Route path="/deportes" element={<CategoryPage category="Deportes" />} />
          <Route path="/entretenimiento" element={<CategoryPage category="Entretenimiento" />} />
          <Route path="/ciencia" element={<CategoryPage category="Ciencia" />} />
          <Route path="/salud" element={<CategoryPage category="Salud" />} />
          <Route path="/section/:slug" element={<CategoryPage />} />
          <Route path="/noticia/:id" element={<Noticia />} />
          <Route path="/debug/posts" element={<PostsDebug />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/new" element={<NewPost />} />
          <Route path="/dashboard/edit/:id" element={<EditPost />} />
          <Route path="/dashboard/manage/:id" element={<ManagePost />} />
          <Route path="/dashboard/sections" element={<SectionsList />} />
          <Route path="/dashboard/sections/new" element={<NewSection />} />
          <Route path="/dashboard/sections/edit/:id" element={<EditSection />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  )
}

export default App
