import { NextResponse } from 'next/server';
import {prisma} from "@/app/lib/prisma"

export async function GET() {
  try {
    
    const players = await prisma.user.findMany({
      orderBy: {
        score: 'desc',
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        score: true,
      },
    });


    const topThree = players.slice(0, 3); 
    const others = players.slice(3);     

    return NextResponse.json({
      topThree: {
        gold: topThree[0] || null,
        silver: topThree[1] || null,
        bronze: topThree[2] || null,
      },
      others,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}

// import { NextResponse, NextRequest } from 'next/server';
// import { prisma } from '@/app/lib/prisma';

// export async function GET(request: NextRequest) {
//   try {
//     // URL-аас page параметрийг авах (өгөгдөөгүй бол default нь 1)
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = 10; // Нэг хуудсанд харуулах тоо
//     const skip = (page - 1) * limit;

//     // 1. Хэрэв эхний хуудас бол Top 3-ыг тусад нь авна
//     let topThree = null;
//     if (page === 1) {
//       topThree = await prisma.user.findMany({
//         orderBy: { score: 'desc' },
//         take: 3,
//       });
//     }

//     // 2. Бусад тоглогчдыг хуудаслалтаар авах (эхний 3-ыг алгасаад)
//     // Offset-ийг тооцохдоо: Эхний хуудсанд бол 3-аас эхэлнэ, дараагийнхад бол +10 г.м
//     const others = await prisma.user.findMany({
//       orderBy: { score: 'desc' },
//       skip: page === 1 ? 3 : 3 + (page - 1) * limit,
//       take: limit,
//     });

//     // Нийт хэрэглэгчийн тоо (Pagination товчлуур хийхэд хэрэгтэй)
//     const totalUsers = await prisma.user.count();
//     const totalPages = Math.ceil((totalUsers - 3) / limit);

//     return NextResponse.json({
//       topThree: page === 1 ? {
//         gold: topThree?.[0] || null,
//         silver: topThree?.[1] || null,
//         bronze: topThree?.[2] || null,
//       } : null,
//       others,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         hasNextPage: page < totalPages,
//       }
//     });
//   } catch (error) {
//     return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
//   }
// }