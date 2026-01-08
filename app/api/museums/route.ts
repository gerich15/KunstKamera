import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (userId && userId !== user?.id) {
      // Публичные музеи другого пользователя
      const museums = await prisma.museum.findMany({
        where: {
          userId,
          isPublic: true,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json({ museums })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Музеи текущего пользователя
    const museums = await prisma.museum.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        _count: {
          select: {
            artifacts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ museums })
  } catch (error) {
    console.error('Error fetching museums:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, description, coverImageUrl, isPublic, layoutType } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Проверяем уникальность slug
    const existing = await prisma.museum.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Museum with this slug already exists' },
        { status: 400 }
      )
    }

    const museum = await prisma.museum.create({
      data: {
        userId: user.id,
        title,
        slug,
        description,
        coverImageUrl,
        isPublic: isPublic !== undefined ? isPublic : true,
        layoutType: layoutType || 'grid',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    return NextResponse.json({ museum })
  } catch (error) {
    console.error('Error creating museum:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

