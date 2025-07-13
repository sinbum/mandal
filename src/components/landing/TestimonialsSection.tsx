import React from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');
  
  const testimonials = t.raw('items');

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