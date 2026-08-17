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
        "5A2 4th Floor KP Icon KP Infra",
        "Yendada, Vishakhapatnam - 530045",
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing again
    if (error) setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("https://geniemedia.in/contact.php", {
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
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.85) translateY(10px); }
          60% { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Moves without ever being transparent, so it is an eligible LCP
           candidate from the first painted frame. */
        @keyframes riseInPlace {
          from { transform: translateY(24px); }
          to   { transform: translateY(0); }
        }
        .animate-riseIn { animation: riseInPlace 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-slideInLeft { animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-slideInRight { animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .contact-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .contact-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .form-input:focus {
          outline: none;
          border-color: #9463EE;
          box-shadow: 0 0 0 3px rgba(148, 99, 238, 0.12);
        }
        .form-input {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .submit-btn {
          background: #e1771f;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }
        .submit-btn:hover::before { width: 400px; height: 400px; }
        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(148, 99, 238, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .success-banner {
          animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .icon-float { animation: float 3s ease-in-out infinite; }

        select.form-input option { color: #374151; }
      `}</style>

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
                ? "animate-riseIn"
                : isVisible
                  ? "animate-fadeInUp"
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
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          >
            {contactInfo.map((info, index) => (
              <div key={index} className="contact-card bg-white rounded-2xl p-6 shadow-lg">
                <div className={`icon-float w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
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
              className={`${isVisible ? "animate-slideInLeft" : "opacity-0"}`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
                <SubHeading className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </SubHeading>

                {/* ✅ Success Banner */}
                {isSuccess && (
                  <div className="success-banner flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
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
                        className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200"
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
                        className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200"
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
                        className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200"
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
                        className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 cursor-pointer"
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
                      rows="6"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input w-full px-4 py-3 rounded-xl border-2 border-gray-200 resize-none"
                      placeholder="Tell us about your project..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-btn w-full py-4 text-black font-bold rounded-xl text-lg flex items-center justify-center gap-2 relative z-10"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
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
              className={`${isVisible ? "animate-slideInRight" : "opacity-0"}`}
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full">
                <div className="relative h-64 lg:h-80">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d400.67734146285284!2d83.36646125424554!3d17.780138304199394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a395b9f81ce4773%3A0xdb3f7e114ab5a4f3!2sKP%20ICON%20KP%20INFRA%20LLP!5e0!3m2!1sen!2sin!4v1764246017962!5m2!1sen!2si"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Office Location"
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
                        <p className="text-gray-600 text-sm">5A2 4th Floor KP Icon KP Infra</p>
                        <p className="text-gray-600 text-sm">Yendada, Vishakhapatnam - 530045</p>
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