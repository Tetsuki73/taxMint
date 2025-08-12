'use client'

// app/services/[slug]/page.jsx
import { assets, serviceData } from '@/assets/assets'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { motion } from "motion/react"

const serviceOptions = {
  'income-tax-services': [
    'ITR Filing for Salaried Employees',
    'Freelancers & Professionals (ITR-3, ITR-4)',
    'Business ITR Filing with Balance Sheet',
    'Capital Gains Tax Advisory',
    'NRI Tax Filing & Compliance',
    'Advance Tax Planning & Refund Assistance'
  ],
  'gst-business-services': [
    'GST Registration',
    'Monthly/Quarterly GST Return Filing (GSTR-1, 3B)',
    'GST Compliance & ITC Reconciliation',
    'TDS Return Filing (24Q, 26Q, 27Q)',
    'Company / LLP Incorporation',
    'UDYAM (MSME) Registration'
  ],
  'certifications-others': [
    'Digital Signature Certificate (DSC)',
    'PAN / TAN Application',
    'Net Worth / Turnover Certificate',
    'Replies to Notices (Sec 139(9), 143(1), etc.)'
  ]
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = serviceData.find(item => item.slug === slug)
  const [result, setResult] = useState("")
  const [selectedServices, setSelectedServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!service) return <div className="p-10">Service not found</div>

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending...");

    const formData = new FormData(event.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      mobile: formData.get('mobile'),
      occupation: formData.get('occupation'),
      serviceCategory: slug,
      selectedServices: selectedServices,
      message: formData.get('message')
    };

    try {
      const response = await fetch("/api/service-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.ok) {
        setResult(`Service inquiry submitted successfully! Your inquiry number is ${responseData.inquiryNumber}. We will contact you soon.`);
        event.target.reset();
        setSelectedServices([]); // Clear selected services
        
        // Clear success message after 8 seconds
        setTimeout(() => setResult(""), 8000);
      } else {
        // Handle validation errors
        if (responseData.errors) {
          setResult(`Validation Error: ${responseData.errors[0]}`);
        } else {
          setResult(responseData.message || "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setResult("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className='w-full px-[12%] py-10 scroll-mt-20'
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className='text-center mb-2 text-4xl font-Ovo font-bold'
      >
        {service.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className='text-center max-w-2xl mx-auto mt-5 mb-12 font-Ovo'
      >
        {service.description}
      </motion.p>

      <motion.form
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        onSubmit={onSubmit}
        className='max-w-2xl mx-auto'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 mb-8'>
          <motion.input
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            type="text"
            placeholder='Enter your name'
            required
            disabled={isSubmitting}
            className='p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
            name='name'
          />
          <motion.input
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            type="email"
            placeholder='Enter your email'
            required
            disabled={isSubmitting}
            className='p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
            name='email'
          />
          <motion.input
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            type="tel"
            placeholder='Enter your mobile number'
            required
            disabled={isSubmitting}
            className='p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
            name='mobile'
          />
          <motion.input
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            type="text"
            placeholder='Enter your occupation'
            required
            disabled={isSubmitting}
            className='p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
            name='occupation'
          />
        </div>

        {/* Service selection checkboxes */}
        <div className='mb-6'>
          <label className='block mb-2 font-semibold'>Select Service Type(s): *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {serviceOptions[slug]?.map((option, idx) => (
              <label key={idx} className='flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-darkHover/30'>
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedServices.includes(option)}
                  disabled={isSubmitting}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedServices([...selectedServices, option]);
                    } else {
                      setSelectedServices(selectedServices.filter(item => item !== option));
                    }
                  }}
                  className="accent-green-600 disabled:opacity-50"
                />
                <span className="w-5 flex justify-center items-center">
                  {selectedServices.includes(option) ? (
                    <span className="text-green-600 font-bold text-lg">✔</span>
                  ) : (
                    <span className="inline-block w-4"></span>
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </label>
            ))}
          </div>
          {selectedServices.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">Please select at least one service type.</p>
          )}
        </div>

        <motion.textarea
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          rows='6'
          placeholder='Enter your message or specific requirements'
          required
          disabled={isSubmitting}
          className='w-full p-4 outline-none border-[0.5px] border-gray-400 rounded-md bg-white mb-6 dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
          name='message'
        />
        
        <motion.button
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          transition={{ duration: 0.3 }}
          type='submit'
          disabled={isSubmitting || selectedServices.length === 0}
          className='py-3 px-8 w-max flex items-center justify-between gap-2 bg-black/80 text-white rounded-full mx-auto hover:bg-black duration-500 dark:bg-transparent dark:border-[0.5px] dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          <Image src={assets.right_arrow_white} alt='' className='w-4' />
        </motion.button>

        {result && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-center font-medium ${
              result.includes('successfully') ? 'text-green-600' : 
              result.includes('Error') || result.includes('error') || result.includes('wrong') ? 'text-red-600' : 
              'text-blue-600'
            }`}
          >
            {result}
          </motion.p>
        )}
      </motion.form>
    </motion.div>
  )
}