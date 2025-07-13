import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('로그아웃 오류:', error);
      return NextResponse.json(
        { message: '로그아웃 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }
    
    return redirect('/');
    
  } catch (error) {
    console.error('Logout error:', error);
    return redirect('/');
  }
}