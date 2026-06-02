import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Palpitão Copa do Mundo 2026',
    short_name: 'Palpitão Copa',
    description: 'Bolão Copa do Mundo 2026',
    start_url: '/',
    display: 'standalone',
    background_color: '#001a0a',
    theme_color: '#001a0a',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
