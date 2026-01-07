export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  updated_at: string
}

export type Museum = {
  id: string
  user_id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  is_public: boolean
  layout_type: 'grid' | 'masonry' | 'list'
  created_at: string
  updated_at: string
  profiles?: Profile
  artifacts?: Artifact[]
  likes_count?: number
}

export type Artifact = {
  id: string
  museum_id: string
  title: string
  description: string | null
  artifact_type: 'image' | 'text' | 'link' | 'video'
  content_url: string | null
  file_metadata: Record<string, any> | null
  order_index: number
  created_at: string
  updated_at: string
}

export type Like = {
  id: string
  user_id: string
  museum_id: string
  created_at: string
}


