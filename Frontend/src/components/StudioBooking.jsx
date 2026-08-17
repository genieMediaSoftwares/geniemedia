import { useState } from 'react';

export default function PodcastStudioBooking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // February 2026
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Time slots data
  const timeSlots = {
    Morning: [
      { id: 1, time: '10:00 am - 11:00 am', slots: 1 },
      { id: 2, time: '11:00 am - 12:00 pm', slots: 1 }
    ],
    afternoon: [
      { id: 3, time: '01:00 pm - 02:00 pm', slots: 1 },
      { id: 4, time: '02:00 pm - 03:00 pm', slots: 1 },
      { id: 5, time: '03:00 pm - 04:00 pm', slots: 1 },
    ],
    evening: [
      { id: 6, time: '04:00 pm - 05:00 pm', slots: 1 },
      { id: 7, time: '05:00 pm - 06:00 pm', slots: 1 },
      { id: 8, time: '06:00 pm - 07:00 pm', slots: 1 }
    ]
  };

  // Category options
  const categories = [
    'ALL',
    'Only Podcast Studio',
    'Studio with Team + 2 Cameras',
    'Studio with Team + 3 Cameras'
    
    
  ];

  // Services data
  const services = [
    
    { id: 1, name: 'Podcast Shoot (Only Studio)', duration: '1 h', price: '₹1,500', category: 'Only Podcast Studio' },
    { id: 2, name: 'Podcast Shoot (Only Studio)', duration: '2 h', price: '₹3,000', category: 'Only Podcast Studio' },
    { id: 3, name: 'Podcast Shoot (Only Studio)', duration: '3 h', price: '₹4,500', category: 'Only Podcast Studio' },
   
  
   
    { id: 4, name: 'Studio with Team + 2 Cameras', duration: '1 h', price: '₹3,999', category: 'Studio with Team + 2 Cameras' },
    { id: 5, name: 'Studio with Team + 2 Cameras', duration: '2 h', price: '₹8,000', category: 'Studio with Team + 2 Cameras' },
    { id: 6, name: 'Studio with Team + 2 Cameras', duration: '3 h', price: '₹10,000', category: 'Studio with Team + 2 Cameras' },
    
    
   
    { id: 8, name: 'Studio with Team + 3 Cameras', duration: '1 h', price: '₹5,000', category: 'Studio with Team + 3 Cameras' },
    { id: 9, name: 'Studio with Team + 3 Cameras', duration: '2 h', price: '₹9,000', category: 'Studio with Team + 3 Cameras' },
    { id: 10, name: 'Studio with Team + 3 Cameras', duration: '3 h', price: '₹11,000', category: 'Studio with Team + 3 Cameras' },
    
    
    
   
    
   
  ];

  // Filter services based on category
  const filteredServices = selectedCategory === 'ALL' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  // Step navigation
  const steps = [
    { id: 1, name: 'Service', icon: '🎙️' },
    { id: 2, name: 'Date & Time', icon: '📅' },
    { id: 3, name: 'Basic Details', icon: '📝' },
    { id: 4, name: 'Summary', icon: '✅' }
  ];

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedService) {
      alert('Please select a service');
      return;
    }
    if (currentStep === 2 && (!selectedDate || !selectedTimeSlot)) {
      alert('Please select both date and time slot');
      return;
    }
    if (currentStep < 4) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsLoading(false);
       
      }, 800);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
    }
  };

  const handleInputChange = (e) => {
    setBookingDetails({
      ...bookingDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
  const phoneNumber = "919032845433"; // 👈 your WhatsApp number (with country code, no + or spaces)

  const message = `
    🎙️ *New Booking Confirmed*

    *Service:* ${selectedService?.name}
    *Duration:* ${selectedService?.duration}
    *Price:* ${selectedService?.price}

    📅 *Date:* ${
        selectedDate
          ? selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Not selected"
      }
    
    🕐 *Time:* ${selectedTimeSlot?.time}
    
    👤 *Name:* ${bookingDetails.name}
    📧 *Email:* ${bookingDetails.email}
    📱 *Phone:* ${bookingDetails.phone}
    
    📝 *Notes:* ${bookingDetails.notes || "None"}
    `;
    
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
    
      window.open(whatsappURL, "_blank");
      alert('Booking confirmed!, Thank you')
    };


  // Generate calendar days
  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Get day of week (0 = Sunday, we want Monday = 0)
    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      const prevMonthDay = new Date(year, monthIndex, -(startDay - i - 1));
      days.push(prevMonthDay);
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, monthIndex, i));
    }
    
    // Add empty cells to complete the grid (42 cells = 6 rows)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(new Date(year, monthIndex + 1, i));
    }
    
    return days;
  };

   const isHoliday = (date) => {
  if (!date) return false;

  const day = date.getDay(); // 0 = Sun, 6 = Sat

  // Disable all Sundays
  if (day === 0) return true;

  // Disable 2nd Saturday
  if (day === 6) {
    const weekNumber = Math.ceil(date.getDate() / 7);
    if (weekNumber === 2) return true;
  }

  return false;
};



  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center pt-12">
          PODCAST STUDIO RENTAL PACKAGES 
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Steps */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 mb-3 rounded-lg cursor-pointer transition-all ${
                    currentStep === step.id
                      ? 'bg-amber-100 text-amber-800 font-semibold'
                      : currentStep > step.id
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                >
                  <span className="text-2xl">{step.icon}</span>
                  <span>{step.name}</span>
                  {currentStep > step.id && <span className="ml-auto text-green-600">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative">
            {/* Loading Overlay - Only for this content area */}
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 rounded-lg">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700 font-semibold">Loading...</p>
                </div>
              </div>
            )}

            {/* Step 1: Service Selection */}
            {currentStep === 1 && (
              <div>
                {/* Category Filter */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Select Category</h2>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedCategory === cat
                            ? 'bg-amber-50 border-amber-600 text-amber-800 font-semibold'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {cat}
                        {selectedCategory === cat && <span className="ml-2">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Cards */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Select Service</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredServices.map((service, index) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedService?.id === service.id
                            ? 'border-amber-600 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        {selectedService?.id === service.id && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white">
                            ✓
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          {/* Studio Icon */}
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                            🎙️
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-2">{service.name}</h3>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Duration: <span className="font-semibold text-gray-800">{service.duration}</span></span>
                              <span className="bg-amber-700 text-white px-3 py-1 rounded-md font-semibold">
                                {service.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Date & Time</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ‹
                      </button>
                      <h3 className="font-semibold text-gray-800">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ›
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Day Headers */}
                      <div className="grid grid-cols-7 bg-gray-50">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600 border-b border-r border-gray-200 last:border-r-0">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Dates */}
                      <div className="grid grid-cols-7">
                       {generateCalendarDays(currentMonth).map((day, idx) => {
  const isSelected = selectedDate?.getTime() === day?.getTime();
  const isCurrentMonth = day && day.getMonth() === currentMonth.getMonth();
  const isToday = day && day.toDateString() === new Date().toDateString();
  const isPast = day && day < new Date(new Date().setHours(0, 0, 0, 0));
  const isDisabled = !day || !isCurrentMonth || isPast || isHoliday(day);


  return (
    <div
      key={idx}
      onClick={() => !isDisabled && setSelectedDate(day)}
      className={`aspect-square p-2 border-b border-r border-gray-200 last:border-r-0 flex items-center justify-center text-sm transition-colors ${
        isDisabled
          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
          : isSelected
          ? 'bg-amber-700 text-white font-bold cursor-pointer'
          : isToday
          ? 'bg-amber-100 text-amber-800 font-semibold cursor-pointer hover:bg-amber-200'
          : 'hover:bg-gray-100 cursor-pointer'
      }`}
    >
      {day?.getDate()}
    </div>
  );
})}

                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Time Slot</h3>
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                      
                      {/* Morning */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Morning</h4>
                        <div className="space-y-2">
                          {timeSlots.Morning.map(slot => (
                            <div
                              key={slot.id}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTimeSlot?.id === slot.id
                                  ? 'border-amber-600 bg-amber-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-semibold text-gray-800">{slot.time}</div>
                              <div className="text-sm text-gray-600">{slot.slots} Slots left</div>
                            </div>
                          ))}
                        </div>
                      </div>
                        
                      {/* Afternoon */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Afternoon</h4>
                        <div className="space-y-2">
                          {timeSlots.afternoon.map(slot => (
                            <div
                              key={slot.id}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTimeSlot?.id === slot.id
                                  ? 'border-amber-600 bg-amber-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-semibold text-gray-800">{slot.time}</div>
                              <div className="text-sm text-gray-600">{slot.slots} Slots left</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evening */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Evening</h4>
                        <div className="space-y-2">
                          {timeSlots.evening.map(slot => (
                            <div
                              key={slot.id}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedTimeSlot?.id === slot.id
                                  ? 'border-amber-600 bg-amber-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-semibold text-gray-800">{slot.time}</div>
                              <div className="text-sm text-gray-600">{slot.slots} Slots left</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Basic Details */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Basic Details</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingDetails.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={bookingDetails.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingDetails.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none"
                      placeholder="+91 1234567890"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={bookingDetails.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-amber-600 focus:outline-none"
                      rows="4"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {currentStep === 4 && (
              <div className="bg-white rounded-lg shadow-sm p-6" style={{ animation: 'fadeIn 0.6s ease-out' }}>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Summary</h2>
                <div className="space-y-6">
                  {/* Service Info */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-900 mb-3">Selected Service</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-white text-xl">
                        🎙️
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedService?.name}</p>
                        <p className="text-sm text-gray-600">Duration: {selectedService?.duration}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-700 mt-2">{selectedService?.price}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Date & Time</h3>
                    <p className="text-gray-600">📅 {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not selected'}</p>
                    <p className="text-gray-600">🕐 {selectedTimeSlot ? selectedTimeSlot.time : 'Not selected'}</p>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                    <p className="text-gray-600">👤 {bookingDetails.name}</p>
                    <p className="text-gray-600">📧 {bookingDetails.email}</p>
                    <p className="text-gray-600">📱 {bookingDetails.phone}</p>
                    {bookingDetails.notes && (
                      <p className="text-gray-600 mt-2">📝 {bookingDetails.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  ← Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="ml-auto px-6 py-3 bg-amber-700 text-white rounded-lg font-semibold hover:bg-amber-800 transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  Confirm Booking ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}