import type { StatItem } from './stats-section.types';
import { MARKETPLACE_DISCLAIMER } from '@/lib/constants/common';

const stats: StatItem[] = [
  {
    id: 'users',
    value: '500K',
    suffix: ' +',
    label: 'Satisfied Users',
  },
  {
    id: 'disbursal',
    value: '2500 Cr',
    suffix: '+',
    label: 'Total Disbursal',
  },
  {
    id: 'ratings',
    value: '4.2',
    suffix: '',
    label: 'Ratings',
  },
  {
    id: 'support',
    value: '24/7',
    suffix: '',
    label: 'Expert Support',
  },
];

/**
 * Stats section displaying key metrics in a 4-column layout with dividers
 */
const StatsSection = (): React.ReactNode => {
  return (
    <section className="bg-white py-10">
      <div
        className="mx-auto max-w-7xl xl:px-0 px-4"
      >
        <div className="grid grid-cols-3 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`flex flex-col items-center text-center py-4 lg:py-0 ${stat.id === 'support' ? 'hidden md:flex' : ''} ${index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                } ${index >= 2 ? 'md:mt-0 mt-0 border-gray-200 md:border-t-0' : ''} ${index > 0 ? 'md:border-l md:border-gray-200' : ''
                }`}
            >
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl font-semibold text-wc-blue-600 wc-stat-number">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-xl sm:text-2xl font-semibold text-wc-blue-600">
                    {stat.suffix}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 mt-1 leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6">
          <p className="mx-auto max-w-4xl text-center text-xs sm:text-sm leading-relaxed text-gray-500">
            {MARKETPLACE_DISCLAIMER}
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
