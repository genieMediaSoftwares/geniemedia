"use client";
import { CONTACT_FORM_URL } from "@/lib/env";

import { Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Send, Clock, Globe, CheckCircle } from "lucide-react";
// import emailjs from "@emailjs/browser";

/**
 * @param {boolean} isPage  True when this component *is* the page (the /contact
 *   route) rather than a section near the bottom of another page.
 *
 *   It matters for performance: the scroll reveal renders everything at
 *   `opacity-0` until an IntersectionObserver fires, and Chrome refuses to
 *   accept a fully transparent element as a Largest Contentful Paint candidate.
 *   As a standalone page that meant /contact reported no LCP at all. When it is
 *   the page, the heading block is therefore shown immediately and animated with
 *   transform only. Embedded in another page it is below the fold and keeps the
 *   original scroll-triggered fade, unchanged.
 */

/* ── Tailwind class sets (formerly this component's <style> block) ────── */

const CONTACT_CARD =
  "transition-all duration-[400ms] ease-in-out hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]";

const FORM_INPUT =
  "transition-[border-color,box-shadow] duration-200 ease-[ease] focus:outline-none focus:border-[#9463EE] focus:shadow-[0_0_0_3px_rgba(148,99,238,0.12)] [&_option]:text-gray-700";

// Orange submit button with an expanding light circle on hover.
const SUBMIT_BTN =
  "relative overflow-hidden bg-[#e1771f] transition-all duration-[400ms] ease-in-out hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(148,99,238,0.4)] disabled:cursor-not-allowed disabled:opacity-[0.65] disabled:translate-y-0 disabled:shadow-none before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:h-0 before:w-0 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-white/20 before:[transition:width_0.6s_ease,height_0.6s_ease] hover:before:h-[400px] hover:before:w-[400px]";

const ContactSec = ({ isPage = false }) => {
  // Keeps the outline sequential in both contexts: as a page the title is an h1
  // and the sub-sections are h2s; embedded, the title is an h2 and they are h3s.
  const SubHeading = isPage ? 'h2' : 'h3';
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 9032845433"],
      color: "from-green-500 to-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["admin@geniemedia.in"],
      color: "from-red-500 to-red-600",
    },
    {
      icon: MapPin,
      title: "Office",
      details: [
        "5A-2, 4th Floor, KP Icon, Yendada, Visakhapatnam,",
        "near MK Gold Coast, Endada, Andhra Pradesh 530045",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Friday: 10AM - 7PM", "Saturday: 10AM - 4PM"],
      color: "from-purple-500 to-purple-600",
    },
  ];

  const services = [
    "Digital Marketing",
    "Web Development",
    "App Development",
    "Production House",
    "Podcast Studio",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing again
    if (error) setError("");
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(CONTACT_FORM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      setIsSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });

      setTimeout(() => setIsSuccess(false), 6000);

    } catch (error) {
      console.error("Contact Form Error:", error);

      setError(
        "Failed to send message. Please try again or contact us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  //   setError("");

  //   // EmailJS send — make sure your template variables match formData keys:
  //   // {{name}}, {{email}}, {{phone}}, {{service}}, {{message}}
  //   emailjs
  //     .send(
  //       import.meta.env.VITE_EMAILJS_SERVICE_ID,
  //       import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  //       {
  //         name: formData.name,
  //         email: formData.email,
  //         phone: formData.phone,
  //         service: formData.service,
  //         message: formData.message,
  //       },
  //       import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  //     )
  //     .then(() => {
  //       setIsSuccess(true);
  //       setFormData({
  //         name: "",
  //         email: "",
  //         phone: "",
  //         service: "",
  //         message: "",
  //       });
  //       setIsSubmitting(false);

  //       // Auto-hide success message after 6 seconds
  //       setTimeout(() => setIsSuccess(false), 6000);
  //     })
  //     .catch((error) => {
  //       console.error("EmailJS Error:", error);
  //       setError("Failed to send message. Please try again or contact us directly.");
  //       setIsSubmitting(false);
  //     });
  // };

  return (
    <>

      <section
        ref={sectionRef}
        className="relative bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 overflow-hidden"
        id="contact"
      >
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">

          {/* Header */}
          <div
            className={`text-center mb-10 ${
              isPage
                ? "animate-rise motion-reduce:animate-none"
                : isVisible
                  ? "animate-fade-in-up-slow motion-reduce:animate-none"
                  : "opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-700 rounded-full mb-4">
              <Globe className="text-orange-500" size={16} />
              <span className="text-sm font-semibold text-black">Get In Touch</span>
            </div>
            {/* On the /contact route this is the page's top-level heading; as a
                section inside another page it must not be a second h1. */}
            {isPage ? (
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                Let's Start a{" "}
                <span className="text-orange-600">Conversation</span>
              </h1>
            ) : (
              <h2 className="text-4xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                Let's Start a{" "}
                <span className="text-orange-600">Conversation</span>
              </h2>
            )}
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible
            </p>
          </div>

          {/* Info Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 ${isVisible ? "animate-fade-in-up-slow motion-reduce:animate-none" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            {contactInfo.map((info, index) => (
              <div key={index} className={`${CONTACT_CARD} bg-white rounded-2xl p-6 shadow-lg`}>
                <div className={`animate-float-sm motion-reduce:animate-none w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <info.icon className="text-white" size={28} />
                </div>
                <SubHeading className="text-lg font-bold text-gray-900 mb-3">{info.title}</SubHeading>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 text-sm mb-1">{detail}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Form + Map */}
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Form */}
            <div
              className={`${isVisible ? "animate-slide-in-left motion-reduce:animate-none" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
                <SubHeading className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </SubHeading>

                {/* ✅ Success Banner */}
                {isSuccess && (
                  <div className="animate-success-pop motion-reduce:animate-none flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-green-600" size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-base mb-0.5">Message Sent Successfully!</p>
                      <p className="text-green-700 text-sm">
                        Thank you for reaching out. Our team will get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* ❌ Error Banner */}
                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>

                  {/* Every control is bound to its <label> with htmlFor/id.
                      The labels were previously visual-only, so screen readers
                      announced the <select> as an unlabelled combobox — the
                      "Select elements do not have associated label elements"
                      finding. Markup and styling are otherwise unchanged. */}

                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`${FORM_INPUT} w-full px-4 py-3 rounded-xl border-2 border-gray-200`}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`${FORM_INPUT} w-full px-4 py-3 rounded-xl border-2 border-gray-200`}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone + Service Dropdown */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${FORM_INPUT} w-full px-4 py-3 rounded-xl border-2 border-gray-200`}
                        placeholder="Enter Mobile Number"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-service" className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Required <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="contact-service"
                        name="service"
                        required
                        value={formData.service}
                        onChange={handleChange}
                        className={`${FORM_INPUT} w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 cursor-pointer`}
                      >
                        <option value="" disabled>Select a Service</option>
                        {services.map((service) => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Message <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className={`${FORM_INPUT} w-full px-4 py-3 rounded-xl border-2 border-gray-200 resize-none`}
                      placeholder="Tell us about your project..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${SUBMIT_BTN} w-full py-4 text-black font-bold rounded-xl text-lg flex items-center justify-center gap-2 z-10`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 text-black" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={20} />
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>

            {/* Map */}
            <div
              className={`${isVisible ? "animate-slide-in-right motion-reduce:animate-none" : "opacity-0"}`}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full">
                <div className="relative h-64 lg:h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.244232054185!2d83.36400847494433!3d17.78021518317547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b852ac6e3ff%3A0x5dc73dbf634423d7!2sGenie%20Media%20and%20Studio!5e0!3m2!1sen!2sin!4v1791199424384!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Genie Media & Studio on Google Maps"
                    referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                </div>

                <div className="p-8">
                  <SubHeading className="text-2xl font-bold text-gray-900 mb-6">Visit Our Office</SubHeading>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-[#9463EE]" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                        <p className="text-gray-600 text-sm">5A-2, 4th Floor, KP Icon, Yendada, Visakhapatnam,</p>
                        <p className="text-gray-600 text-sm">near MK Gold Coast, Endada, Andhra Pradesh 530045</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                        <p className="text-gray-600 text-sm">Monday - Friday: 10:00 AM - 7:00 PM</p>
                        <p className="text-gray-600 text-sm">Saturday: 10:00 AM - 4:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSec;