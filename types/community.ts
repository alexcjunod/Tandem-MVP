export interface Community {
  id: number
  name: string
  description: string
  color: string
  member_count: number
  post_count: number
  created_at: string
}

export interface Post {
  id: number
  content: string
  community_id: number
  user_id: string
  likes: number
  comments: number
  created_at: string
  image_url?: string
  author?: {
    full_name: string
    avatar_url: string
  }
}

export interface Profile {
  id: string
  full_name: string
  avatar_url: string
  updated_at: string
} 