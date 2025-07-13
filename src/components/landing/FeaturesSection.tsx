import React from 'react';
import Link from 'next/link';
import { Target, Brain, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
  const t = useTranslations('landing.features');
  
  const features = [
    {
      icon: <Target className="w-6 h-6 text-gray-700" />,
      title: t('items.goal_breakdown.title'),
      description: t('items.goal_breakdown.description')
    },
    {
      icon: <Brain className="w-6 h-6 text-gray-700" />,
      title: t('items.progress_tracking.title'),
      description: t('items.progress_tracking.description')
    },
    {
      icon: <Users className="w-6 h-6 text-gray-700" />,
      title: t('items.collaboration.title'),
      description: t('items.collaboration.description')
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-gray-700" />,
      title: t('items.analytics.title'),
      description: t('items.analytics.description')
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
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
              {t('cta.start')}
            </h3>
            <p className="text-gray-600 mb-8">
              {t('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t('cta.free')}
              </Link>
              <Link 
                href="#testimonials" 
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t('cta.cases')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}