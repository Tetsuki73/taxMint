"use client";
import React, { useState } from "react";

const serviceOptions = [
  "ITR Filing for Salaried Employees",
  "Freelancers & Professionals (ITR-3, ITR-4)",
  "Business ITR Filing with Balance Sheet",
  "Capital Gains Tax Advisory",
  "NRI Tax Filing & Compliance",
  "Advance Tax Planning & Refund Assistance",
];

const ITRPage = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [service, setService] = useState(serviceOptions[0]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // You can handle form submission logic here (API call, etc.)
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Income Tax Service Request</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">Email ID</label>
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Phone Number</label>
          <input
            type="tel"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isWhatsapp"
            checked={isWhatsapp}
            onChange={() => setIsWhatsapp(!isWhatsapp)}
          />
          <label htmlFor="isWhatsapp" className="font-medium">
             This is my WhatsApp number?
          </label>
        </div>
        {!isWhatsapp && (
          <div>
            <label className="block mb-2 font-medium">WhatsApp Number</label>
            <input
              type="tel"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="Enter your WhatsApp number"
            />
          </div>
        )}
        <div>
          <label className="block mb-2 font-medium">Type of Service</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={service}
            onChange={e => setService(e.target.value)}
            required
          >
            {serviceOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Submit
        </button>
        {submitted && (
          <p className="text-green-600 mt-4 text-center">
            Thank you! Your request has been submitted.
          </p>
        )}
      </form>
    </div>
  );
};

export default ITRPage;