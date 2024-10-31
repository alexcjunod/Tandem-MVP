"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Heart } from "lucide-react"
import { PostCard } from "@/components/community/post-card"

interface Post {
  id: number
  content: string
  community_id: number
  author_name: string
  likes: number
  comments: number
  created_at: string
}

interface Community {
  id: number
  name: string
  description: string
  color: string
  member_count: number
  post_count: number
}

export default function CommunityPage() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newPost, setNewPost] = useState({ content: "", communityId: null as number | null })
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  // Fetch communities and posts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch communities
        const { data: communitiesData } = await supabase
          .from('communities')
          .select('*')
          .order('created_at', { ascending: false })

        if (communitiesData) {
          setCommunities(communitiesData)
        }

        // Fetch posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (postsData) {
          setPosts(postsData)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch joined communities when user is loaded
  useEffect(() => {
    async function fetchJoinedCommunities() {
      if (!user) return

      const { data } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id)

      if (data) {
        setJoinedCommunities(data.map(item => item.community_id))
      }
    }

    if (isUserLoaded) {
      fetchJoinedCommunities()
    }
  }, [user, isUserLoaded])

  // Add real-time subscription
  useEffect(() => {
    // Subscribe to new posts
    const postsChannel = supabase
      .channel('public:posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        setPosts(current => [payload.new as Post, ...current])
      })
      .subscribe()

    // Subscribe to likes updates
    const likesChannel = supabase
      .channel('public:post_likes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        if (payload.new) {
          setPosts(current =>
            current.map(post =>
              post.id === (payload.new as Post).id ? { ...post, ...payload.new } : post
            )
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(postsChannel)
      supabase.removeChannel(likesChannel)
    }
  }, [])

  // Fetch liked posts when user is loaded
  useEffect(() => {
    async function fetchLikedPosts() {
      if (!user) return

      const { data } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)

      if (data) {
        setLikedPosts(data.map(like => like.post_id))
      }
    }

    if (isUserLoaded) {
      fetchLikedPosts()
    }
  }, [user, isUserLoaded])

  const handleJoinCommunity = async (communityId: number) => {
    if (!user) return

    try {
      if (joinedCommunities.includes(communityId)) {
        // Leave community
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('user_id', user.id)

        setJoinedCommunities(prev => prev.filter(id => id !== communityId))
      } else {
        // Join community
        await supabase
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: user.id
          })

        setJoinedCommunities(prev => [...prev, communityId])
      }

      // Refresh communities to get updated member count
      const { data } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setCommunities(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!user || !newPost.content.trim() || !newPost.communityId) return

    try {
      // Create the post
      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          content: newPost.content,
          community_id: newPost.communityId,
          author_name: user.fullName || 'Anonymous User'
        })
        .select()
        .single()

      if (error) throw error

      // Update posts list
      setPosts(current => [post, ...current])
      
      // Clear form
      setNewPost({ content: "", communityId: null })

    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const handleLike = async (postId: number) => {
    if (!user) return

    try {
      if (likedPosts.includes(postId)) {
        // Unlike post
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        setLikedPosts(prev => prev.filter(id => id !== postId))
      } else {
        // Like post
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          })

        setLikedPosts(prev => [...prev, postId])
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground">Connect with others on similar journeys</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Feed */}
        <div className="md:col-span-2">
          {/* Add Post Creation Card */}
          {joinedCommunities.length > 0 && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="mb-4"
                />
                <div className="flex justify-between items-center">
                  <select
                    className="border rounded p-2"
                    value={newPost.communityId || ""}
                    onChange={(e) => setNewPost(prev => ({ 
                      ...prev, 
                      communityId: e.target.value ? Number(e.target.value) : null 
                    }))}
                  >
                    <option value="">Select Community</option>
                    {communities
                      .filter(c => joinedCommunities.includes(c.id))
                      .map(community => (
                        <option key={community.id} value={community.id}>
                          {community.name}
                        </option>
                      ))}
                  </select>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() || !newPost.communityId}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Posts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Community Feed</CardTitle>
              <CardDescription>Recent updates from all communities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {posts.map((post) => {
                    const community = communities.find(c => c.id === post.community_id)
                    if (!community) return null

                    return (
                      <PostCard
                        key={post.id}
                        post={post}
                        community={{
                          name: community.name,
                          color: community.color
                        }}
                        isLiked={likedPosts.includes(post.id)}
                        onLike={handleLike}
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communities</CardTitle>
              <CardDescription>Join groups that match your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communities.map((community) => (
                  <div key={community.id} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{community.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {community.member_count} members
                      </p>
                    </div>
                    <Button
                      variant={joinedCommunities.includes(community.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleJoinCommunity(community.id)}
                    >
                      {joinedCommunities.includes(community.id) ? "Joined" : "Join"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 