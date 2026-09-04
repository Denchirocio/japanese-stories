export interface ResizedImage {
  blob: Blob
  base64: string
  mediaType: 'image/jpeg'
}

// Las fotos de cámara pueden pesar varios MB; las reducimos antes de
// guardarlas o mandarlas a la API (más rápido y ocupan menos espacio).
export function resizeImageFile(file: File, maxDim = 1600, quality = 0.82): Promise<ResizedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo generar la imagen'))
              return
            }
            resolve({ blob, base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' })
          },
          'image/jpeg',
          quality,
        )
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
