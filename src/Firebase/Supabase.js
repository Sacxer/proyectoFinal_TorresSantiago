import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY_AQUI'

// Cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para subir imágenes al storage
export const uploadImage = async (file, bucket = 'images', path = null) => {
  try {
    // Generar nombre único para el archivo si no se proporciona path
    const fileName = path || `${Date.now()}-${file.name}`
    const filePath = `news/${fileName}`

    // Subir el archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error al subir imagen:', error)
      throw error
    }

    // Obtener la URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
      bucket: bucket
    }
  } catch (error) {
    console.error('Error en uploadImage:', error)
    throw error
  }
}

// Función para eliminar imágenes del storage
export const deleteImage = async (path, bucket = 'images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error al eliminar imagen:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error en deleteImage:', error)
    throw error
  }
}

// Función para obtener la URL pública de una imagen
export const getImageUrl = (path, bucket = 'images') => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

export default supabase
