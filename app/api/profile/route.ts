import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ profile: null }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      // Создаем профиль, если его нет
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: user.email?.split('@')[0] || null,
          fullName: user.name || null,
          avatarUrl: user.image || null,
        },
      })
      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, fullName, avatarUrl } = body

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        username,
        fullName,
        avatarUrl,
      },
      create: {
        userId: user.id,
        username,
        fullName,
        avatarUrl,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

