import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export default function ServiceFaq({ title, intro, faqs }: { title: string; intro: string; faqs: FaqItem[] }) {
  return (
    <section className="bg-gray-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600">{intro}</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <summary className="w-full flex items-center justify-between p-6 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset">
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.q}</h3>
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
