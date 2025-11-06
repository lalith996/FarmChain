'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap-config';

const faqs = [
  {
    question: 'What is FarmChain?',
    answer: 'FarmChain is a blockchain-based platform that brings transparency and efficiency to agricultural supply chains. We help farmers, distributors, and consumers track products from farm to table.',
  },
  {
    question: 'How does blockchain help agriculture?',
    answer: 'Blockchain provides immutable records of every transaction, ensuring complete traceability, reducing fraud, and building trust between all parties in the supply chain.',
  },
  {
    question: 'Is it difficult to use?',
    answer: 'Not at all! We\'ve designed FarmChain to be user-friendly. Most farmers can get started in under 10 minutes with our simple onboarding process.',
  },
  {
    question: 'What are the costs?',
    answer: 'We offer flexible pricing plans starting from free for small farms. Enterprise solutions are available for larger operations. Contact us for detailed pricing.',
  },
  {
    question: 'How secure is my data?',
    answer: 'Your data is secured using enterprise-grade encryption and stored on the blockchain. We comply with all major data protection regulations including GDPR.',
  },
  {
    question: 'Can I integrate with existing systems?',
    answer: 'Yes! FarmChain offers APIs and integrations with popular farm management systems, ERPs, and accounting software.',
  },
];

export function FAQ() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useGSAP(() => {
    const items = gsap.utils.toArray('.faq-item');

    gsap.from(items, {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.6,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
    });
  }, { scope: containerRef });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div ref={containerRef} className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-4 text-gray-800">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-center text-gray-600 mb-16">
          Everything you need to know about FarmChain
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="faq-item bg-green-50 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-green-100 transition-colors"
              >
                <span className="text-xl font-semibold text-gray-800">
                  {faq.question}
                </span>
                <span className="text-3xl text-green-600 transform transition-transform duration-300"
                  style={{ transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIndex === index ? '500px' : '0px',
                }}
              >
                <div className="px-8 pb-6 text-gray-700 text-lg">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
