import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { APP_CONFIG } from '@/constants/app';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing.footer');
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src={APP_CONFIG.logo} 
                alt={APP_CONFIG.name} 
                width={32} 
                height={32} 
                className="rounded"
              />
              <span className="text-xl font-semibold text-gray-900">{APP_CONFIG.name}</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
              {t('brand_description')}
            </p>
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="w-4 h-4" />
              <span className="text-sm">support@mandalart.app</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium mb-4 text-gray-900">{t('nav.service')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/signup" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('nav.start_free')}
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('nav.features')}
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('nav.success_stories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium mb-4 text-gray-900">{t('nav.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('links.guide')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('links.faq')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('links.privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  {t('links.terms')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 text-sm">
              © {currentYear} {t('copyright')}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>Goal Achievement Rate 92%</span>
              <span>1,000+ Users</span>
              <span>Satisfaction 4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}