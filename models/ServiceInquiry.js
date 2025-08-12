// models/ServiceInquiry.js
import mongoose from 'mongoose';

const ServiceInquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  occupation: {
    type: String,
    required: [true, 'Occupation is required'],
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters']
  },
  serviceCategory: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['income-tax-services', 'gst-business-services', 'certifications-others'],
    trim: true
  },
  selectedServices: [{
    type: String,
    required: true,
    trim: true
  }],
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  leadSource: {
    type: String,
    default: 'website-form'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Add indexes for better performance and querying
ServiceInquirySchema.index({ email: 1, createdAt: -1 });
ServiceInquirySchema.index({ serviceCategory: 1, status: 1 });
ServiceInquirySchema.index({ mobile: 1 });
ServiceInquirySchema.index({ status: 1, priority: -1, createdAt: -1 });

// Add a method to get service category display name
ServiceInquirySchema.methods.getServiceCategoryName = function() {
  const categoryNames = {
    'income-tax-services': 'Income Tax Services',
    'gst-business-services': 'GST & Business Services', 
    'certifications-others': 'Certifications & Others'
  };
  return categoryNames[this.serviceCategory] || this.serviceCategory;
};

// Export the model - this will create it in the 'service-inquiries' collection
export default mongoose.models.ServiceInquiry || mongoose.model('ServiceInquiry', ServiceInquirySchema, 'service-inquiries');