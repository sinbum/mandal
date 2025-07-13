import React from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');
  
  const testimonials = t.raw('items') || [
    {
      name: "김민수",
      role: "스타트업 CEO",
      rating: 5,
      text: "창업 2년차, 매출이 정체되어 있었는데 만다라트로 사업 전략을 다시 세웠어요. 목표를 8개 영역으로 나누니 놓친 부분들이 보였고, 실행도 훨씬 쉬워졌습니다.",
      achievement: "월 매출 300만원 → 1,200만원"
    },
    {
      name: "박지영",
      role: "직장인",
      rating: 5,
      text: "정보처리기사 자격증, 토익 900점, 승진... 목표는 많은데 어디서부터 시작해야 할지 막막했어요. 만다라트로 우선순위를 정하고 단계별로 접근하니 하나씩 이뤄지더라고요.",
      achievement: "정보처리기사 합격 + 토익 920점"
    },
    {
      name: "이준호",
      role: "대학생",
      rating: 5,
      text: "취업 준비할 때 너무 막막했는데, 만다라트로 스펙 관리부터 면접 준비까지 체계적으로 정리했어요. 덕분에 원하던 대기업에 합격할 수 있었습니다!",
      achievement: "대기업 정규직 취업 성공"
    },
    {
      name: "최수민",
      role: "프리랜서",
      rating: 5,
      text: "프리랜서 수입이 불안정했는데, 만다라트로 수입 다각화 전략을 세웠어요. 블로그, 강의, 컨설팅 등 여러 수입원을 체계적으로 만들 수 있었습니다.",
      achievement: "월 수입 150만원 → 500만원"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8">
              {/* Testimonial Text */}
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              {/* Achievement */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <p className="text-gray-900 font-medium">{testimonial.achievement}</p>
              </div>

              {/* User Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
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
        <div className="bg-gray-900 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-semibold mb-8">{t('stats.title')}</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">{t('stats.achievement_rate.value')}</div>
              <div className="text-gray-300">{t('stats.achievement_rate.label')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{t('stats.time_to_result.value')}</div>
              <div className="text-gray-300">{t('stats.time_to_result.label')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{t('stats.active_users.value')}</div>
              <div className="text-gray-300">{t('stats.active_users.label')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}