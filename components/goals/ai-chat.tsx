"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AIChatProps {
  customGoalStep: number
  setCustomGoalStep: (step: number) => void
  onGoalCreated?: (goal: any) => void
}

// Input validation
function validateInput(input: string, step: number): { isValid: boolean; message?: string } {
  switch(step) {
    case 1: // Goal
      if (input.length < 10) {
        return { 
          isValid: false, 
          message: "Could you elaborate a bit more on your goal? This will help me understand better."
        }
      }
      break
    case 2: // Vision
      if (!input.includes(' because ') && !input.includes(' so that ') && input.length < 30) {
        return { 
          isValid: false, 
          message: "Could you share more about why this goal matters to you? What motivates you to achieve it?"
        }
      }
      break
    case 3: // Metrics
      if (!input.includes('\n') && !input.includes('•') && !input.includes('-')) {
        return { 
          isValid: false, 
          message: "Could you break down your metrics into multiple points? This will help track progress better."
        }
      }
      break
    case 4: // Timeline
      if (!input.toLowerCase().match(/\d+\s*(day|week|month|year)/)) {
        return { 
          isValid: false, 
          message: "Could you specify a timeframe (e.g., 3 months, 1 year)? This helps make the goal more concrete."
        }
      }
      break
  }
  return { isValid: true }
}

export default function AIChat({ customGoalStep, setCustomGoalStep, onGoalCreated }: AIChatProps) {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: `Hi there! 👋 

I'm here to help you create meaningful and achievable goals. At Tandem, we believe it's important to take the time to set the right goals—ones that truly matter to you and that you can actually achieve.

Let's start with something simple: What's one goal you'd like to work towards? For example:
• "I want to learn to play the guitar"
• "I want to run a marathon"
• "I want to start my own business"

What goal would you like to work on?` 
    }
  ])
  
  const [userResponses, setUserResponses] = useState({
    goal: '',
    vision: '',
    metrics: '',
    timeline: ''
  })
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages])

  function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const mockResponses = {
    1: (userInput: string) => {
      const goal = capitalizeFirstLetter(userInput.trim())
      return `"${goal}" is a fantastic goal! 🌟 

I'd love to understand more about what success looks like for you. When you imagine achieving this goal:
• What would be different in your life?
• How would you feel?
• What would you be able to do that you can't do now?

For example, if your goal is learning guitar, you might say:
"I want to be able to play my favorite songs confidently, perform at local open mics, and share music with friends. This matters to me because music has always been a big part of my life."

Share your vision with me, and we'll work together to make it happen.`
    },

    2: (userInput: string, previousInputs: any) => `Thank you for sharing that vision! I can see why this goal matters to you.

To help you track your progress towards ${previousInputs.goal}, let's break this down into measurable milestones. 

Here are some example metrics based on your goal:
${generateExampleMetrics(previousInputs.goal)}

What specific metrics would be most meaningful for tracking your progress?
Please list 2-3 concrete ways we can measure your advancement.`,

    3: (userInput: string, previousInputs: any) => `Those are excellent metrics! They'll help you stay motivated and see your progress clearly.

Now, let's make this goal time-bound. Looking at what you want to achieve:
• ${previousInputs.goal}
• ${previousInputs.vision}
• Tracking: ${previousInputs.metrics}

What feels like a realistic timeline for achieving this? Consider:
• Short-term (3-6 months)
• Medium-term (6-12 months)
• Long-term (1-2 years)

Remember, it's okay to be ambitious while still being realistic. When would you like to achieve this goal by?`,

    4: (userInput: string, previousInputs: any) => `Perfect! Let me summarize your SMART goal:

🎯 Goal: ${previousInputs.goal}

✨ Vision of Success:
${previousInputs.vision}

📊 Progress Metrics:
${formatMetrics(previousInputs.metrics)}

⏱️ Timeline: ${userInput}

I've broken this down into milestones:
${generateMilestones(previousInputs, userInput)}

This is a well-structured goal that follows the SMART framework:
• Specific: You've clearly defined what you want to achieve
• Measurable: We have concrete ways to track progress
• Achievable: The goal is challenging but realistic
• Relevant: It aligns with your personal vision
• Time-bound: You've set a clear timeline

Would you like to adjust anything to make this goal even more meaningful or achievable for you?`
  }

  // Helper function to generate example metrics based on the goal
  function generateExampleMetrics(goal: string): string {
    const goalLower = goal.toLowerCase()
    if (goalLower.includes('learn') || goalLower.includes('study')) {
      return `• Hours spent practicing per week
• Number of lessons/modules completed
• Skills mastered or concepts understood
• Practice sessions completed`
    }
    if (goalLower.includes('fitness') || goalLower.includes('run') || goalLower.includes('exercise')) {
      return `• Workouts completed per week
• Distance covered or weights lifted
• Time spent exercising
• Physical measurements or progress photos`
    }
    if (goalLower.includes('business') || goalLower.includes('startup')) {
      return `• Revenue milestones
• Number of customers/clients
• Products/services launched
• Marketing goals achieved`
    }
    return `• Weekly progress measurements
• Specific achievements or milestones
• Time invested towards the goal
• Tangible outcomes produced`
  }

  // Helper function to format metrics nicely
  function formatMetrics(metrics: string): string {
    return metrics
      .split(/[\n,]/)
      .map(metric => metric.trim())
      .filter(Boolean)
      .map(metric => `• ${metric}`)
      .join('\n')
  }

  // Helper function to generate milestones
  function generateMilestones(responses: typeof userResponses, timeline: string): string {
    const metrics = responses.metrics.split(/[\n,]/).filter(Boolean)
    const timelineMatch = timeline.match(/(\d+)\s*(day|week|month|year)s?/)
    
    if (!timelineMatch) return ''

    const [_, number, unit] = timelineMatch
    const totalDays = {
      day: 1,
      week: 7,
      month: 30,
      year: 365
    }[unit] * Number(number)

    const milestones = metrics.map((metric, index) => {
      const progress = Math.round(((index + 1) / metrics.length) * 100)
      const days = Math.round((totalDays * (index + 1)) / metrics.length)
      return `• ${metric.trim()} (${progress}% - ${days} days)`
    })

    return milestones.join('\n')
  }

  async function sendMessage(content: string) {
    try {
      // Validate input
      const validation = validateInput(content, customGoalStep)
      if (!validation.isValid) {
        setMessages(prev => [...prev, 
          { role: "user", content },
          { role: "assistant", content: validation.message! }
        ])
        setInput("")
        return
      }

      setIsLoading(true)
      setMessages(prev => [...prev, { role: "user", content }])
      setInput("")

      // Update userResponses based on the current step
      const updatedResponses = { ...userResponses }
      switch (customGoalStep) {
        case 1:
          updatedResponses.goal = content
          break
        case 2:
          updatedResponses.vision = content
          break
        case 3:
          updatedResponses.metrics = content
          break
        case 4:
          updatedResponses.timeline = content
          break
      }
      setUserResponses(updatedResponses)

      // Get contextual response using the object lookup
      const responseFunction = mockResponses[customGoalStep as keyof typeof mockResponses]
      const mockResponse = responseFunction(content, updatedResponses)
      
      // Simulate typing delay
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "assistant", content: mockResponse }])
        if (validation.isValid) {
          setCustomGoalStep(customGoalStep + 1)
        }
        
        if (customGoalStep === 4 && validation.isValid) {
          const milestones = generateMilestones(updatedResponses, content)
            .split('\n')
            .map(milestone => {
              const [title, timing] = milestone.split('(')
              return {
                title: title.replace('•', '').trim(),
                deadline: timing?.replace(')', '').trim() || '',
                tasks: ["To be defined"]
              }
            })

          onGoalCreated?.({
            goal: updatedResponses.goal,
            vision: updatedResponses.vision,
            metrics: updatedResponses.metrics.split(/[\n,]/).filter(Boolean),
            timeline: updatedResponses.timeline,
            milestones
          })
        }
      }, 1500)

    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble processing that. Could you try rephrasing it?" 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1" ref={scrollViewportRef}>
        <div className="space-y-4 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.role === "assistant" ? "" : "bg-primary text-primary-foreground"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%]">
                <CardContent className="p-3">
                  <p className="text-sm">typing...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (input.trim()) sendMessage(input.trim())
              }
            }}
            className="min-h-[44px] flex-1 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={() => input.trim() && sendMessage(input.trim())}
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 