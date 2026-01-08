import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { museumId: string } }
) {
  try {
    const museum = await prisma.museum.findUnique({
      where: { id: params.museumId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        artifacts: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    if (!museum) {
      return NextResponse.json({ error: 'Museum not found' }, { status: 404 })
    }

    return NextResponse.json({ museum })
  } catch (error) {
    console.error('Error fetching museum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { museumId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const museum = await prisma.museum.findUnique({
      where: { id: params.museumId },
    })

    if (!museum) {
      return NextResponse.json({ error: 'Museum not found' }, { status: 404 })
    }

    if (museum.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, slug, description, coverImageUrl, isPublic, layoutType } = body

    const updated = await prisma.museum.update({
      where: { id: params.museumId },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(isPublic !== undefined && { isPublic }),
        ...(layoutType && { layoutType }),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    return NextResponse.json({ museum: updated })
  } catch (error) {
    console.error('Error updating museum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { museumId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const museum = await prisma.museum.findUnique({
      where: { id: params.museumId },
    })

    if (!museum) {
      return NextResponse.json({ error: 'Museum not found' }, { status: 404 })
    }

    if (museum.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.museum.delete({
      where: { id: params.museumId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting museum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

