import { uploadImage, deleteImage, getImageUrl } from '../Firebase/Supabase'

// Función para subir una imagen de noticia
export const uploadNewsImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo')
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP')
    }

    // Validar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB permitido')
    }

    // Subir la imagen
    const result = await uploadImage(file, 'images')

    return result
  } catch (error) {
    console.error('Error al subir imagen de noticia:', error)
    throw error
  }
}

// Función para eliminar una imagen de noticia
export const deleteNewsImage = async (imagePath) => {
  try {
    if (!imagePath) {
      console.warn('No se proporcionó path de imagen para eliminar')
      return
    }

    // Extraer el path relativo del URL completa si es necesario
    let path = imagePath
    if (imagePath.includes('supabase')) {
      // Extraer el path del URL de Supabase
      const urlParts = imagePath.split('/storage/v1/object/public/images/')
      if (urlParts.length > 1) {
        path = urlParts[1]
      }
    }

    await deleteImage(path, 'images')
    return true
  } catch (error) {
    console.error('Error al eliminar imagen de noticia:', error)
    throw error
  }
}

// Función para validar imagen antes de subir
export const validateImage = (file) => {
  const errors = []

  if (!file) {
    errors.push('No se seleccionó ningún archivo')
    return errors
  }

  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    errors.push('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP')
  }

  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errors.push('El archivo es demasiado grande. Máximo 5MB permitido')
  }

  // Validar tamaño mínimo (1KB)
  const minSize = 1024
  if (file.size < minSize) {
    errors.push('El archivo es demasiado pequeño. Mínimo 1KB requerido')
  }

  return errors
}

// Función para comprimir imagen si es necesario
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Dibujar y comprimir
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Crear nuevo archivo con el blob comprimido
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Error al comprimir la imagen'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Error al cargar la imagen para compresión'))
    img.src = URL.createObjectURL(file)
  })
}

export { uploadImage, deleteImage, getImageUrl }
