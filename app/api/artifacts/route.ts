import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { museumId, title, description, artifactType, contentUrl, fileMetadata, orderIndex } = body

    if (!museumId || !title || !artifactType) {
      return NextResponse.json(
        { error: 'Museum ID, title, and artifact type are required' },
        { status: 400 }
      )
    }

    // Проверяем, что музей принадлежит пользователю
    const museum = await prisma.museum.findUnique({
      where: { id: museumId },
    })

    if (!museum) {
      return NextResponse.json({ error: 'Museum not found' }, { status: 404 })
    }

    if (museum.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const artifact = await prisma.artifact.create({
      data: {
        museumId,
        title,
        description,
        artifactType,
        contentUrl,
        fileMetadata: fileMetadata || {},
        orderIndex: orderIndex || 0,
      },
    })

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Error creating artifact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

