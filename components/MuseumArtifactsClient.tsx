"use client"

import { ArtifactCard } from '@/components/ArtifactCard'
import Masonry from 'react-masonry-css'
import type { Artifact } from '@/types'

type LayoutType = 'list' | 'grid' | 'masonry'

interface MuseumArtifactsClientProps {
  artifacts: Artifact[]
  layoutType: LayoutType
}

export function MuseumArtifactsClient({
  artifacts,
  layoutType,
}: MuseumArtifactsClientProps) {
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  }

  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          В этом музее пока нет экспонатов
        </p>
      </div>
    )
  }

  if (layoutType === 'masonry') {
    return (
      <>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="mb-6">
              <ArtifactCard artifact={artifact} layout={layoutType} />
            </div>
          ))}
        </Masonry>
        <style jsx global>{`
          .masonry-grid {
            display: flex;
            margin-left: -24px;
            width: auto;
          }
          .masonry-grid_column {
            padding-left: 24px;
            background-clip: padding-box;
          }
          .masonry-grid_column > div {
            margin-bottom: 24px;
          }
        `}</style>
      </>
    )
  }

  return (
    <div
      className={`grid gap-6 ${
        layoutType === 'list'
          ? 'grid-cols-1'
          : 'md:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {artifacts.map((artifact) => (
        <ArtifactCard
          key={artifact.id}
          artifact={artifact}
          layout={layoutType}
        />
      ))}
    </div>
  )
}


