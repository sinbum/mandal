import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('landing.hero');
  const tLanding = useTranslations('landing');
  
  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
                {t('title.part1')}
                <br />
                <span className="text-blue-600">{t('title.part2')}</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-2xl">
                {t('subtitle')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link href="/auth/signup">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium"
                  >
                    {t('cta.start')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
                  >
                    {t('cta.login')}
                  </Button>
                </Link>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>{t('trustSignals.0')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>{t('trustSignals.1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>{t('trustSignals.2')}</span>
                </div>
              </div>
            </div>

            {/* Visual Demo */}
            <div className="mt-16 lg:mt-0 lg:col-span-5">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('demoSection.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('demoSection.subtitle')}
                  </p>
                </div>
              
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { text: t('demoSection.examples.0'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.1'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.2'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.3'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.4'), color: 'bg-blue-600 text-white border-blue-600' },
                    { text: t('demoSection.examples.5'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.6'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.7'), color: 'bg-white border-gray-200' },
                    { text: t('demoSection.examples.8'), color: 'bg-white border-gray-200' }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`
                        aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium
                        ${item.color}
                        transition-all duration-200 hover:shadow-sm
                      `}
                    >
                      <span className="text-center px-2">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    {tLanding('features.subtitle')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}