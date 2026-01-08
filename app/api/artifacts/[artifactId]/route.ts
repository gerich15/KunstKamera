import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { artifactId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artifact = await prisma.artifact.findUnique({
      where: { id: params.artifactId },
      include: {
        museum: true,
      },
    })

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    if (artifact.museum.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, artifactType, contentUrl, fileMetadata, orderIndex } = body

    const updated = await prisma.artifact.update({
      where: { id: params.artifactId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(artifactType && { artifactType }),
        ...(contentUrl !== undefined && { contentUrl }),
        ...(fileMetadata !== undefined && { fileMetadata }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    })

    return NextResponse.json({ artifact: updated })
  } catch (error) {
    console.error('Error updating artifact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { artifactId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const artifact = await prisma.artifact.findUnique({
      where: { id: params.artifactId },
      include: {
        museum: true,
      },
    })

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 })
    }

    if (artifact.museum.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.artifact.delete({
      where: { id: params.artifactId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting artifact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

