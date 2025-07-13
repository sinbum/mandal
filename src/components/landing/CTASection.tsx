import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function CTASection() {
  const t = useTranslations('landing.cta');
  
  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 text-lg font-medium"
              >
                {t('buttons.start')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-4 text-lg font-medium"
              >
                {t('buttons.login')}
              </Button>
            </Link>
          </div>

          {/* Value Proposition */}
          <div className="bg-gray-800 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6">
              {t('features.0')}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">{t('features.1')}</h4>
                <p className="text-sm text-gray-400">{t('features.creditCard')}</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">{t('features.2')}</h4>
                <p className="text-sm text-gray-400">{t('features.fullFeatures')}</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium text-white mb-2">{t('features.3')}</h4>
                <p className="text-sm text-gray-400">{t('features.cancelAnytime')}</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">{t('social_proof')}</p>
            <div className="flex justify-center items-center gap-6 text-gray-300">
              <div className="text-sm">
                <span className="font-medium">{t('stats.goalAchievementRate.label')}</span>
                <br />
                <span className="text-gray-400">{t('stats.goalAchievementRate.value')}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('stats.activeUsers.label')}</span>
                <br />
                <span className="text-gray-400">{t('stats.activeUsers.value')}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('satisfaction')}</span>
                <br />
                <span className="text-gray-400">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}