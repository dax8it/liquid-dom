import { forwardRef } from 'react'
import htmlStyles from '../GlassStageHtml.module.css'

const MUSIC_CATEGORY_TILES = [
  { title: '2010s', color: '#e0ba39' },
  { title: '2000s', color: '#e9c23e' },
  { title: "'90s", color: '#dfbf39' },
  { title: "'80s", color: '#e1bc40' },
  { title: "'70s", color: '#dcb43a' },
  { title: "'60s", color: '#dbb83d' },
  { title: 'Pop', color: '#db638e' },
  { title: 'First Nations', color: '#ecb645' },
  { title: 'K-Pop', color: '#dc648f' },
  { title: 'Alternative', color: '#c5c73a' },
  { title: 'Dance', color: '#57bf83' },
  { title: 'R&B', color: '#8f77d7' },
  { title: 'Metal', color: '#df5853' },
  { title: 'Classic Rock', color: '#df7048' },
  { title: 'Family', color: '#5fbe56' },
  { title: 'Rock', color: '#dd6947' },
  { title: 'Acoustic', color: '#b6c538' },
  { title: 'Jazz', color: '#57a8d0' },
  { title: 'Classical', color: '#a267d0' },
  { title: 'Up Next', color: '#f34057' },
  { title: 'Apple Music Live', color: '#1c1c1e' },
  { title: 'Punjabi', color: '#8e57b2' },
  { title: 'Indie', color: '#59bca6' },
  { title: 'Reggae', color: '#81bb37' },
  { title: 'Punk', color: '#de6239' },
  { title: 'Hip-Hop', color: '#d95a4f' },
  { title: 'Country', color: '#c6a63a' },
  { title: 'Soul', color: '#8f6fd7' },
  { title: 'Blues', color: '#4d9fd1' },
  { title: 'Latin', color: '#e35b77' },
  { title: 'Afrobeats', color: '#69be59' },
  { title: 'Electronic', color: '#4db7aa' },
  { title: 'Chill', color: '#7e9fe0' },
  { title: 'Workout', color: '#f0574d' },
  { title: 'Focus', color: '#6cb088' },
  { title: 'Sleep', color: '#5878c8' },
  { title: 'Mood', color: '#bb6bcb' },
  { title: 'Soundtracks', color: '#de8748' },
  { title: 'Gaming', color: '#72bf45' },
  { title: 'Party', color: '#f04d7b' },
  { title: 'Hits', color: '#e26a3d' },
  { title: 'New Music', color: '#ef4f56' },
  { title: 'Singer-Songwriter', color: '#b9c342' },
  { title: 'World', color: '#58b5c8' },
  { title: 'Ambient', color: '#6b87d3' },
  { title: 'Lo-Fi', color: '#9b69c9' },
  { title: 'Brazilian', color: '#58bd7b' },
  { title: 'J-Pop', color: '#ed6e98' },
  { title: 'C-Pop', color: '#d75ca9' },
  { title: 'News', color: '#3f3f45' },
] as const

export const HtmlBackground = forwardRef<HTMLDivElement>(function HtmlBackground(_, ref) {
  return (
    <div ref={ref} className={htmlStyles.background}>
      <div className={htmlStyles.backgroundGlow} />
      <div className={htmlStyles.grid}>
        {MUSIC_CATEGORY_TILES.map((tile) => (
          <article key={tile.title} className={htmlStyles.tile} style={{ backgroundColor: tile.color }}>
            <div className={htmlStyles.tileOverlay} />
            <h2 className={htmlStyles.tileTitle}>{tile.title}</h2>
          </article>
        ))}
      </div>
    </div>
  )
})
