import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useState } from 'react'
import { motion } from "motion/react"

const Contact = () => {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending...");

    const formData = new FormData(event.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.ok) {
        setResult("Message sent successfully! Thank you for contacting us.");
        event.target.reset();
        
        // Clear success message after 5 seconds
        setTimeout(() => setResult(""), 5000);
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
      id='contact' 
      className='w-full px-[12%] py-10 scroll-mt-20 bg-[url("/footer-bg-color.png")] bg-no-repeat bg-center bg-[length:90%_auto] dark:bg-none'
    >
      <motion.h4 
        initial={{ y: -20, opacity: 0 }} 
        whileInView={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.3, duration: 0.5 }}
        className='text-center mb-2 text-lg font-Ovo'
      >
        Connect with us
      </motion.h4>

      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className='text-center text-5xl font-Ovo'
      >
        Get in touch
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className='text-center max-w-2xl mx-auto mt-5 mb-12 font-Ovo'
      >
        We would love to hear from you! If you have any questions, comments, or feedback, please use the form below.
      </motion.p>

      <motion.form
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        onSubmit={onSubmit} 
        className='max-w-2xl mx-auto'
      >
        <div className='grid grid-cols-auto gap-6 mt-10 mb-8'>
          <motion.input
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            type="text" 
            placeholder='Enter your name' 
            required
            disabled={isSubmitting}
            className='flex-1 p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed' 
            name='name'
          />

          <motion.input
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            type="email" 
            placeholder='Enter your email' 
            required
            disabled={isSubmitting}
            className='flex-1 p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed' 
            name='email'
          />
        </div>

        <motion.textarea 
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          rows='6' 
          placeholder='Enter your message' 
          required
          disabled={isSubmitting}
          className='w-full p-4 outline-none border-[0.5px] border-gray-400 rounded-md bg-white mb-6 dark:bg-darkHover/30 dark:border-white/90 disabled:opacity-50 disabled:cursor-not-allowed' 
          name='message'
        />

        <motion.button
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }} 
          transition={{ duration: 0.3 }}
          type='submit'
          disabled={isSubmitting}
          className='py-3 px-8 w-max flex items-center justify-between gap-2 bg-black/80 text-white rounded-full mx-auto hover:bg-black duration-500 dark:bg-transparent dark:border-[0.5px] dark:hover:bg-darkHover disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Sending...' : 'Submit now'} 
          <Image src={assets.right_arrow_white} alt='' className='w-4'/>
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

export default Contact