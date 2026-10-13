import { Clock, MapPin, MessageCircle, Phone, Mail, Mic } from "lucide-react";

import { STUDIO, STUDIO_PACKAGES, formatInr } from "@/content/podcastStudio";

const SECTION = "py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8";
const H2 = "text-3xl sm:text-4xl font-bold text-gray-900 mb-4";

export function StudioPackagesTable() {
  return (
    <section aria-labelledby="studio-packages" className={`bg-gray-50 ${SECTION}`}>
      <div className="max-w-5xl mx-auto">
        <h2 id="studio-packages" className={`${H2} text-center`}>Studio Packages and Hourly Rates</h2>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-8">
          Every package includes the studio, a set, two boom-arm microphones, the PodTrak P8 recorder and lighting. Editing is charged separately.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">Podcast studio packages and prices in Indian rupees</caption>
            <thead className="bg-slate-900 text-white">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Package</th>
                <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">1 hour</th>
                <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">2 hours</th>
                <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">3 hours</th>
                <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Crew</th>
                <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Cameras</th>
              </tr>
            </thead>
            <tbody>
              {STUDIO_PACKAGES.map((pkg) => (
                <tr key={pkg.id} className="border-t border-gray-100">
                  <th scope="row" className="px-5 py-4 font-semibold text-gray-900">
                    {pkg.name}
                    <span className="block text-sm font-normal text-gray-500">{pkg.summary}</span>
                  </th>
                  {pkg.rates.map((r, i) => (
                    <td key={i} className="px-5 py-4 font-semibold text-gray-900">{formatInr(r)}</td>
                  ))}
                  <td className="px-5 py-4 text-gray-700">{pkg.crew ? "Included" : "Not included"}</td>
                  <td className="px-5 py-4 text-gray-700">{pkg.cameras ? `${pkg.cameras}, operated by our team` : "Ask us"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Prices in Indian rupees. Editing, captions and short-form clips are quoted separately. Booking, payment and rescheduling terms are confirmed with you on WhatsApp.
        </p>
      </div>
    </section>
  );
}

export function StudioEquipment() {
  return (
    <section aria-labelledby="studio-equipment" className={`bg-white ${SECTION}`}>
      <div className="max-w-4xl mx-auto">
        <h2 id="studio-equipment" className={`${H2} text-center`}>Studio Equipment and Sets</h2>
        <ul className="grid gap-4 sm:grid-cols-2 mt-8">
          {STUDIO.equipment.map((item) => (
            <li key={item} className="flex gap-3 rounded-xl border border-gray-200 p-4 text-gray-700">
              <Mic className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function StudioInfo() {
  return (
    <section aria-labelledby="studio-info" className={`bg-white ${SECTION}`}>
      <div className="max-w-6xl mx-auto">
        <h2 id="studio-info" className={`${H2} text-center mb-10`}>Studio Location, Hours and Contact</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-6">
            <MapPin className="w-6 h-6 text-orange-500 mb-3" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600 leading-relaxed">{STUDIO.address}</p>
            <p className="text-gray-600 leading-relaxed mt-2">The studio is in Yendada, close to Rushikonda and Madhurawada.</p>
            <a href={STUDIO.mapsUrl} target="_blank" rel="noopener" data-track="studio_directions_click" className="mt-3 inline-block font-semibold text-orange-600 hover:text-orange-800">
              Get directions
            </a>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <Clock className="w-6 h-6 text-orange-500 mb-3" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Studio hours</h3>
            <p className="text-gray-600 leading-relaxed">{STUDIO.hours}.</p>
            <p className="text-gray-600 leading-relaxed mt-2">Closed on {STUDIO.closed}.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <MessageCircle className="w-6 h-6 text-orange-500 mb-3" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
            <ul className="space-y-2 text-gray-700">
              <li><a href={STUDIO.whatsappHref()} data-track="whatsapp_click" className="inline-flex items-center gap-2 hover:text-orange-600"><MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp {STUDIO.phone}</a></li>
              <li><a href={STUDIO.phoneHref} data-track="phone_click" className="inline-flex items-center gap-2 hover:text-orange-600"><Phone className="w-4 h-4" aria-hidden="true" /> Call {STUDIO.phone}</a></li>
              <li><a href={`mailto:${STUDIO.email}`} data-track="email_click" className="inline-flex items-center gap-2 hover:text-orange-600"><Mail className="w-4 h-4" aria-hidden="true" /> {STUDIO.email}</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
