import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const publicDir = path.resolve('public/assets/img')
// Procura por qualquer imagem de favicon ou logo existente na pasta public
const possibleSourceFiles = fs.readdirSync(publicDir).filter(file => file.includes('favicon') || file.includes('logo'))

if (possibleSourceFiles.length === 0) {
  console.error('❌ Nenhuma imagem de favicon ou logo encontrada na pasta public! Coloque uma imagem lá primeiro.')
  process.exit(1)
}

const sourceImage = path.join(publicDir, possibleSourceFiles[0])
console.log(`🖼️ Usando a imagem base: ${possibleSourceFiles[0]}`)

async function generateIcons() {
  try {
    // Gera o ícone 192x192
    await sharp(sourceImage)
      .resize(192, 192, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .toFile(path.join(publicDir, 'pwa-192x192.png'))

    // Gera o ícone 512x512
    await sharp(sourceImage)
      .resize(512, 512, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .toFile(path.join(publicDir, 'pwa-512x512.png'))

    console.log('✅ Ícones PWA (192x192 e 512x512) gerados com sucesso na pasta public!')
  } catch (error) {
    console.error('❌ Erro ao gerar os ícones:', error)
  }
}

generateIcons()