"use client"

import { ShareButton } from './ShareButton'

interface ShareButtonClientProps {
  title: string
  username: string
  slug: string
}

export function ShareButtonClient({ title, username, slug }: ShareButtonClientProps) {
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/public/${username}/${slug}`
    : ''

  return <ShareButton title={title} url={url} />
}


