"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareButtonProps {
  title: string
  url: string
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (err) {
        // Пользователь отменил шаринг
      }
    } else {
      // Fallback: копирование в буфер обмена
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: 'Ссылка скопирована!',
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Button onClick={handleShare} variant="outline">
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Скопировано
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Поделиться
        </>
      )}
    </Button>
  )
}


