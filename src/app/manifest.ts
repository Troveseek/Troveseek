import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TroveSeek - Enterprise Digital Commerce Ecosystem',
    short_name: 'TroveSeek',
    description: 'Scalable digital ecosystem offering high-performance web products, SaaS subscriptions, and custom engineering services.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
