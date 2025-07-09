import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "김민수",
      role: "스타트업 CEO, 서울",
      avatar: "👨‍💼",
      rating: 5,
      text: "창업 2년차, 매출이 정체되어 있었는데 만다라트로 사업 전략을 다시 세웠어요. 목표를 8개 영역으로 나누니 놓친 부분들이 보였고, 실행도 훨씬 쉬워졌습니다.",
      achievement: "월 매출 300만원 → 1,200만원",
      timeframe: "5개월",
      beforeAfter: "작년 대비 매출 400% 증가"
    },
    {
      name: "박지영",
      role: "직장인, 부산",
      avatar: "👩‍🎨",
      rating: 5,
      text: "정보처리기사 자격증, 토익 900점, 승진... 목표는 많은데 어디서부터 시작해야 할지 막막했어요. 만다라트로 우선순위를 정하고 단계별로 접근하니 하나씩 이뤄지더라고요.",
      achievement: "정보처리기사 합격 + 토익 920점",
      timeframe: "8개월",
      beforeAfter: "3년간 미루던 목표들을 모두 달성"
    },
    {
      name: "이준호",
      role: "대학생, 대구",
      avatar: "👨‍🎓",
      rating: 5,
      text: "취업 준비할 때 너무 막막했는데, 만다라트로 스펙 관리부터 면접 준비까지 체계적으로 정리했어요. 덕분에 원하던 대기업에 합격할 수 있었습니다!",
      achievement: "대기업 정규직 취업 성공",
      timeframe: "10개월",
      beforeAfter: "취업 준비 스트레스 90% 감소"
    },
    {
      name: "최수민",
      role: "프리랜서, 인천",
      avatar: "👩‍💻",
      rating: 5,
      text: "프리랜서 수입이 불안정했는데, 만다라트로 수입 다각화 전략을 세웠어요. 블로그, 강의, 컨설팅 등 여러 수입원을 체계적으로 만들 수 있었습니다.",
      achievement: "월 수입 150만원 → 500만원",
      timeframe: "6개월",
      beforeAfter: "수입 안정성 확보 및 자유시간 증가"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <span>🔥</span>
            <span>실제 사용자 성과 - 거짓말 아님</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            "정말 효과가 있을까?" <br/>
            <span className="text-blue-600">직접 경험한 사람들의 이야기</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            작심삼일 반복하던 평범한 사람들이 어떻게 목표를 달성했는지 <br/>
            <strong className="text-gray-900">실제 경험담</strong>을 확인해보세요.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group">
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-blue-600 opacity-60" />
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                "{testimonial.text}"
              </blockquote>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-bold text-green-800">실제 성과</span>
                </div>
                <p className="text-green-700 font-bold text-lg">{testimonial.achievement}</p>
                <p className="text-sm text-green-600 mt-1">📅 달성 기간: {testimonial.timeframe}</p>
                <p className="text-sm text-blue-600 mt-1 font-medium">✨ {testimonial.beforeAfter}</p>
              </div>

              {/* User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">⚡ 충격적인 통계 데이터</h3>
            <p className="text-pink-100">기존 목표 설정 vs 만다라트 사용 비교</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-sm text-pink-100">목표 달성률</div>
              <div className="text-xs text-pink-200 mt-1">일반적인 17% vs</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-4xl font-bold mb-2">5배</div>
              <div className="text-sm text-pink-100">실행 속도</div>
              <div className="text-xs text-pink-200 mt-1">계획 → 실행 시간 단축</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-4xl font-bold mb-2">21일</div>
              <div className="text-sm text-pink-100">첫 성과까지</div>
              <div className="text-xs text-pink-200 mt-1">평균 성과 발생 시점</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-sm text-pink-100">재사용률</div>
              <div className="text-xs text-pink-200 mt-1">한 번 써보면 계속 사용</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}