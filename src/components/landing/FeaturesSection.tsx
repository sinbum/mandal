import React from 'react';
import { Target, Brain, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Target className="w-12 h-12 text-blue-600" />,
      title: "과학적 목표 분해",
      description: "하나의 큰 목표를 8개의 구체적이고 실행 가능한 단계로 체계적으로 분해합니다.",
      benefits: ["명확한 실행 계획", "압도감 해소", "단계별 성취감"],
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <Brain className="w-12 h-12 text-green-600" />,
      title: "시각적 진행 추적",
      description: "직관적인 3x3 매트릭스로 진행상황을 한눈에 파악하고 동기를 유지할 수 있습니다.",
      benefits: ["실시간 진행률", "시각적 피드백", "동기 유지"],
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: "협업 및 공유",
      description: "팀원들과 목표를 공유하고 함께 달성해 나가며 책임감을 강화할 수 있습니다.",
      benefits: ["팀 협업", "목표 공유", "상호 동기부여"],
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-orange-600" />,
      title: "성과 분석",
      description: "목표 달성률과 패턴을 분석하여 더 나은 계획을 세울 수 있도록 도와줍니다.",
      benefits: ["성과 분석", "패턴 인식", "개선 제안"],
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>검증된 기법</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            왜 만다라트가 효과적일까요?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            오타니 쇼헤이가 사용한 것으로 유명한 만다라트 기법을 디지털로 구현하여
            <br />
            더욱 체계적이고 효율적인 목표 달성 경험을 제공합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group`}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 bg-white p-4 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">평균 30일 내 첫 번째 목표 달성</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              지금 시작하면 다음 달부터 변화를 경험할 수 있습니다
            </h3>
            <p className="text-gray-600 mb-6">
              수많은 사용자들이 만다라트로 목표를 달성하고 있습니다. 당신도 시작해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/signup" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                무료로 시작하기
              </a>
              <a href="#examples" className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                성공 사례 보기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}