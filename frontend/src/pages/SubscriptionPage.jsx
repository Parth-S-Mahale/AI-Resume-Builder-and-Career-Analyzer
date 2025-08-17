import React from 'react';
import { Link } from 'react-router-dom';

// Checkmark Icon for features
const CheckIcon = () => (
  <svg className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

// Cross Icon for unavailable features
const CrossIcon = () => (
    <svg className="w-6 h-6 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);


// Main Subscription Page Component
const SubscriptionPage = () => {
  const plans = [
    {
      name: 'Spark Plan',
      price: '399',
      features: [
        { text: 'Unlimited AI Resume Analysis', included: true },
        { text: 'No Advertisements', included: true },
        { text: '50 Automated Cold Mails / month', included: true },
        { text: '1 FAANG+ Mentorship Session', included: true },
        { text: 'Direct Live Call with Expert', included: false },
        { text: 'Advanced Career Analytics', included: false },
      ],
      buttonText: 'Get Started',
      bgColor: 'bg-gray-800/40',
      buttonClass: 'btn-secondary',
      borderColor: 'border-gray-700'
    },
    {
      name: 'Velocity Plan',
      price: '699',
      popular: true,
      features: [
        { text: 'Unlimited AI Resume Analysis', included: true },
        { text: 'No Advertisements', included: true },
        { text: '200 Automated Cold Mails / month', included: true },
        { text: '2 FAANG+ Mentorship Sessions', included: true },
        { text: '3 Direct Live Call with Expert', included: true },
        { text: 'Advanced Career Analytics', included: true },
      ],
      buttonText: 'Choose Plan',
      bgColor: 'bg-indigo-900/30',
      buttonClass: 'btn-primary',
      borderColor: 'border-indigo-500'
    },
    {
      name: 'Apex Plan',
      price: '999',
      features: [
        { text: 'Unlimited AI Resume Analysis', included: true },
        { text: 'No Advertisements', included: true },
        { text: 'Unlimited Automated Cold Mails', included: true },
        { text: '5 FAANG+ Mentorship Sessions', included: true },
        { text: '4 Direct Live Calls with Experts', included: true },
        { text: 'Priority Support', included: true },
      ],
      buttonText: 'Go Apex',
      bgColor: 'bg-gray-800/40',
      buttonClass: 'btn-secondary',
      borderColor: 'border-gray-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900/50 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight section-title">
            Choose Your Premium Model
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Unlock powerful features to accelerate your career. Go beyond limits and land your dream job faster.
          </p>
        </div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl p-8 border-2 ${plan.borderColor} ${plan.bgColor} glass-card transition-all duration-300 hover:border-indigo-400 hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-white text-center">{plan.name}</h2>
                <div className="text-center my-6">
                  <span className="text-5xl font-extrabold">₹{plan.price}</span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      {feature.included ? <CheckIcon /> : <CrossIcon />}
                      <span className="text-gray-300">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <Link
                  to="/payment" // This should link to your payment processing page
                  className={`block w-full text-center py-3 px-6 rounded-lg font-bold text-lg ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16 text-gray-500">
            <p>All plans are billed monthly. You can cancel anytime.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
