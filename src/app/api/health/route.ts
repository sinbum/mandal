import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 기본적인 헬스체크 - 애플리케이션이 응답할 수 있는지 확인
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'mandalart-planner',
        version: process.env.npm_package_version || '0.1.0'
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}