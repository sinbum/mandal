import React from 'react';
import { Target, Brain, Users, TrendingUp } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Target className="w-6 h-6 text-gray-700" />,
      title: "목표 분해",
      description: "큰 목표를 작고 실행 가능한 단계로 나누어 체계적으로 접근할 수 있습니다."
    },
    {
      icon: <Brain className="w-6 h-6 text-gray-700" />,
      title: "진행 추적",
      description: "직관적인 인터페이스로 현재 진행상황을 한눈에 파악하고 관리할 수 있습니다."
    },
    {
      icon: <Users className="w-6 h-6 text-gray-700" />,
      title: "협업 기능",
      description: "팀원들과 목표를 공유하고 함께 달성해 나가며 동기를 유지할 수 있습니다."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-gray-700" />,
      title: "성과 분석",
      description: "목표 달성 패턴을 분석하여 더 효과적인 계획을 세울 수 있도록 도와줍니다."
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            체계적인 목표 달성
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            만다라트 기법을 통해 목표를 구체화하고
            꾸준히 실행할 수 있는 환경을 제공합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              지금 시작해보세요
            </h3>
            <p className="text-gray-600 mb-8">
              체계적인 목표 관리로 꿈을 현실로 만들어보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signup" 
                className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                무료로 시작하기
              </a>
              <a 
                href="#testimonials" 
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                성공 사례 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}