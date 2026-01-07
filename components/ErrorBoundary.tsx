'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ошибку для мониторинга
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="container py-10">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold">Что-то пошло не так</h2>
            <p className="text-muted-foreground">
              Произошла ошибка при загрузке этого раздела.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

