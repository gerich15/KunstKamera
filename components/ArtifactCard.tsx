"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Artifact } from '@/types'
import { ExternalLink, FileText, ImageIcon, Link as LinkIcon, Video } from 'lucide-react'

interface ArtifactCardProps {
  artifact: Artifact
  layout?: 'grid' | 'masonry' | 'list'
}

export function ArtifactCard({ artifact, layout = 'grid' }: ArtifactCardProps) {
  const getIcon = () => {
    switch (artifact.artifact_type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'link':
        return <LinkIcon className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
    }
  }

  const renderContent = () => {
    if (artifact.artifact_type === 'image' && artifact.content_url) {
      return (
        <div className="relative w-full h-64 rounded-md overflow-hidden">
          <Image
            src={artifact.content_url}
            alt={artifact.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )
    }

    if (artifact.artifact_type === 'link' && artifact.content_url) {
      return (
        <div className="flex items-center space-x-2 text-primary">
          <ExternalLink className="h-4 w-4" />
          <Link
            href={artifact.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline truncate"
          >
            {artifact.content_url}
          </Link>
        </div>
      )
    }

    if (artifact.artifact_type === 'text' && artifact.description) {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm whitespace-pre-wrap">{artifact.description}</p>
        </div>
      )
    }

    return null
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <CardTitle className="text-lg">{artifact.title}</CardTitle>
          </div>
        </div>
        {artifact.description && artifact.artifact_type !== 'text' && (
          <CardDescription className="line-clamp-3">
            {artifact.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {renderContent()}
      </CardContent>
    </Card>
  )
}


