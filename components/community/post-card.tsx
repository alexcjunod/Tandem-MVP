"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase/client"

interface Comment {
  id: number
  content: string
  author_name: string
  created_at: string
}

interface PostCardProps {
  post: {
    id: number
    content: string
    author_name: string
    likes: number
    comments: number
    community_id: number
  }
  community: {
    name: string
    color: string
  }
  isLiked: boolean
  onLike: (postId: number) => void
}

export function PostCard({ post, community, isLiked, onLike }: PostCardProps) {
  const { user } = useUser()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })

    if (data) {
      setComments(data)
    }
  }

  const handleToggleComments = async () => {
    if (!showComments) {
      await fetchComments()
    }
    setShowComments(!showComments)
  }

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: post.id,
          user_id: user.id,
          author_name: user.fullName || 'Anonymous'
        })
        .select()
        .single()

      if (error) throw error

      setComments(prev => [data, ...prev])
      setNewComment("")
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.author_name}</span>
            <Badge className={community.color}>
              {community.name}
            </Badge>
          </div>
          <p className="text-sm">{post.content}</p>
          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onLike(post.id)}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className="mr-1 h-4 w-4" />
              {post.likes}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleToggleComments}
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              {post.comments}
            </Button>
          </div>

          {showComments && (
            <div className="space-y-4 pt-4 border-t">
              {user && (
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={isLoading || !newComment.trim()}
                  >
                    Comment
                  </Button>
                </div>
              )}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-semibold">{comment.author_name}</span>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
