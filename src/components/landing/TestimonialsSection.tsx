import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "김민수",
      role: "스타트업 CEO",
      avatar: "👨‍💼",
      rating: 5,
      text: "만다라트로 사업 계획을 세우니 정말 체계적으로 접근할 수 있었어요. 6개월 만에 목표 매출을 달성했습니다!",
      achievement: "매출 목표 150% 달성",
      timeframe: "6개월"
    },
    {
      name: "박지영",
      role: "프리랜서 디자이너",
      avatar: "👩‍🎨",
      rating: 5,
      text: "포트폴리오 완성이라는 막연한 목표를 8개의 구체적인 단계로 나누니 훨씬 실행하기 쉬웠어요. 지금은 안정적으로 프로젝트를 진행하고 있습니다.",
      achievement: "포트폴리오 완성 후 수주 증가",
      timeframe: "3개월"
    },
    {
      name: "이준호",
      role: "대학생",
      avatar: "👨‍🎓",
      rating: 5,
      text: "토익 900점이라는 목표를 만다라트로 세분화해서 공부하니 체계적으로 접근할 수 있었어요. 드디어 목표 점수를 달성했습니다!",
      achievement: "토익 900점 달성",
      timeframe: "4개월"
    },
    {
      name: "최수민",
      role: "마케터",
      avatar: "👩‍💻",
      rating: 5,
      text: "팀원들과 프로젝트 목표를 공유하니 협업 효율이 크게 향상되었어요. 모두가 같은 방향을 보고 일할 수 있게 되었습니다.",
      achievement: "팀 협업 효율 200% 향상",
      timeframe: "2개월"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>실제 성공 사례</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            1,000+ 사용자의 목표 달성 스토리
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            다양한 분야의 사용자들이 만다라트로 실제로 목표를 달성한 경험을 공유합니다.
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">성과</span>
                </div>
                <p className="text-green-700 font-semibold">{testimonial.achievement}</p>
                <p className="text-sm text-green-600 mt-1">달성 기간: {testimonial.timeframe}</p>
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
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">만다라트 효과 통계</h3>
            <p className="text-blue-100">사용자 연구 결과 (2024년 상반기)</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">87%</div>
              <div className="text-sm text-blue-100">목표 달성률</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">3배</div>
              <div className="text-sm text-blue-100">실행력 향상</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">30일</div>
              <div className="text-sm text-blue-100">평균 첫 성과</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-sm text-blue-100">사용자 만족도</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}