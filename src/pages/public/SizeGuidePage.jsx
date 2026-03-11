import { useState } from 'react';
import { Ruler, Shirt, FootprintsIcon, Baby, User, ChevronDown, ChevronUp, Download, HelpCircle } from 'lucide-react';

const SizeGuidePage = () => {
  const [activeCategory, setActiveCategory] = useState('clothing');
  const [expandedTips, setExpandedTips] = useState(new Set(['tip1']));

  const categories = [
    { id: 'clothing', name: 'Clothing', icon: Shirt },
    { id: 'shoes', name: 'Shoes', icon: FootprintsIcon },
    { id: 'accessories', name: 'Accessories', icon: User },
  ];

  const sizeCharts = {
    clothing: {
      mens: {
        name: "Men's Clothing",
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        measurements: {
          chest: [34-36, 38-40, 42-44, 46-48, 50-52, 54-56, 58-60],
          waist: [28-30, 32-34, 36-38, 40-42, 44-46, 48-50, 52-54],
          hips: [35-37, 39-41, 43-45, 47-49, 51-53, 55-57, 59-61],
        }
      },
      womens: {
        name: "Women's Clothing",
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        measurements: {
          bust: [32-33, 34-35, 36-37, 38-39, 40-41, 42-43, 44-45],
          waist: [24-25, 26-27, 28-29, 30-31, 32-33, 34-35, 36-37],
          hips: [34-35, 36-37, 38-39, 40-41, 42-43, 44-45, 46-47],
        }
      },
      kids: {
        name: "Kids' Clothing",
        sizes: ['2T', '3T', '4T', 'XS (4-5)', 'S (6-7)', 'M (8-10)', 'L (12-14)', 'XL (16-18)'],
        measurements: {
          height: [33-36, 36-39, 39-42, 41-44, 45-48, 49-54, 55-60, 61-66],
          weight: [25-30, 30-35, 35-40, 38-44, 45-55, 56-73, 74-95, 96-125],
          chest: [20-21, 21-22, 22-23, 23-25, 25-27, 27-30, 30-33, 33-36],
        }
      }
    },
    shoes: {
      mens: {
        name: "Men's Shoes",
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13', '14'],
        measurements: {
          us: [6, 7, 8, 9, 10, 11, 12, 13, 14],
          uk: [5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
          eu: [39, 40, 41, 42, 43, 44, 45, 46, 47],
          cm: [24.1, 24.8, 25.4, 26.0, 26.7, 27.3, 27.9, 28.6, 29.2],
        }
      },
      womens: {
        name: "Women's Shoes",
        sizes: ['5', '6', '7', '8', '9', '10', '11', '12'],
        measurements: {
          us: [5, 6, 7, 8, 9, 10, 11, 12],
          uk: [3, 4, 5, 6, 7, 8, 9, 10],
          eu: [36, 37, 38, 39, 40, 41, 42, 43],
          cm: [22.2, 22.8, 23.5, 24.1, 24.8, 25.4, 26.0, 26.7],
        }
      },
      kids: {
        name: "Kids' Shoes",
        sizes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
        measurements: {
          us: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          uk: [13, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          eu: [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
          cm: [20.3, 20.7, 21.6, 22.2, 22.8, 23.5, 24.1, 24.8, 25.4, 26.0, 26.7, 27.3, 27.9],
        }
      }
    },
    accessories: {
      hats: {
        name: "Hats & Headwear",
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        measurements: {
          circumference: [20-21, 21-22, 22-23, 23-24, 24-25, 25-26],
        }
      },
      gloves: {
        name: "Gloves",
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        measurements: {
          palm: [6-6.5, 6.5-7, 7-7.5, 7.5-8, 8-8.5],
          length: [6.5-7, 7-7.5, 7.5-8, 8-8.5, 8.5-9],
        }
      },
      belts: {
        name: "Belts",
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        measurements: {
          waist: [28-32, 32-36, 36-40, 40-44, 44-48],
        }
      }
    }
  };

  const tips = [
    {
      id: 'tip1',
      title: 'How to Measure Yourself',
      content: 'Use a flexible measuring tape and measure over bare skin or thin clothing. Keep the tape level but not tight - you should be able to fit one finger between the tape and your body. Take measurements at the widest points for chest and hips.'
    },
    {
      id: 'tip2',
      title: 'Finding Your Perfect Fit',
      content: 'If you\'re between sizes, consider your personal preference - size up for a looser fit, size down for a more fitted look. Check product-specific sizing notes as some items run larger or smaller than standard sizing.'
    },
    {
      id: 'tip3',
      title: 'International Sizing',
      content: 'Sizing varies by country and brand. Always check the specific measurements rather than relying on size labels alone. When in doubt, contact our customer service with your measurements for personalized recommendations.'
    },
    {
      id: 'tip4',
      title: 'Care & Fit Maintenance',
      content: 'Follow care instructions to maintain proper fit. Some materials shrink when washed in hot water, while others stretch over time. Consider fabric type when choosing your size - natural fibers like cotton may shrink more than synthetic blends.'
    }
  ];

  const toggleTip = (tipId) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(tipId)) {
      newExpanded.delete(tipId);
    } else {
      newExpanded.add(tipId);
    }
    setExpandedTips(newExpanded);
  };

  const renderSizeChart = (chart) => {
    const measurements = Object.keys(chart.measurements);
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pr-4">Size</th>
              {measurements.map((measurement) => (
                <th key={measurement} className="pb-3 pr-4 capitalize">
                  {measurement === 'cm' ? 'CM' : measurement === 'us' ? 'US' : measurement === 'uk' ? 'UK' : measurement === 'eu' ? 'EU' : measurement}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chart.sizes.map((size, i) => (
              <tr key={i} className="text-sm">
                <td className="py-3 pr-4 font-medium text-slate-900">{size}</td>
                {measurements.map((measurement) => (
                  <td key={measurement} className="py-3 pr-4 text-slate-600">
                    {Array.isArray(chart.measurements[measurement][i]) 
                      ? `${chart.measurements[measurement][i][0]}-${chart.measurements[measurement][i][1]}`
                      : chart.measurements[measurement][i]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Ruler className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Size Guide
            </h1>
            <p className="text-lg text-slate-600">
              Find your perfect fit with our comprehensive size charts and measuring tips
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeCategory === category.id
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Size Charts */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="space-y-8">
          {Object.entries(sizeCharts[activeCategory]).map(([key, chart]) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">{chart.name}</h2>
              </div>
              <div className="p-6">
                {renderSizeChart(chart)}
              </div>
            </div>
          ))}
        </div>

        {/* Measuring Tips */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Measuring Tips</h2>
            <p className="text-slate-600">Expert advice to help you find your perfect size</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {tips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => toggleTip(tip.id)}
                  className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                      <h3 className="font-medium text-slate-900">{tip.title}</h3>
                    </div>
                    {expandedTips.has(tip.id) ? (
                      <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  {expandedTips.has(tip.id) && (
                    <p className="mt-3 text-slate-600 leading-relaxed ml-8">{tip.content}</p>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Download & Help */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-6">
            <Download className="h-8 w-8 text-violet-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Download Size Guide</h3>
            <p className="text-slate-600 mb-4">
              Get a printable PDF version of our complete size guide for easy reference
            </p>
            <button className="px-4 py-2 bg-white text-violet-600 font-medium rounded-lg border border-violet-200 hover:bg-violet-50 transition-all">
              Download PDF
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
            <HelpCircle className="h-8 w-8 text-emerald-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need Help?</h3>
            <p className="text-slate-600 mb-4">
              Our sizing experts are available to help you find the perfect fit
            </p>
            <button className="px-4 py-2 bg-white text-emerald-600 font-medium rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;
