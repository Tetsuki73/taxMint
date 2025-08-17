// models/Contact.js
import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Allow various phone number formats:
        // +1234567890, +91 9876543210, (123) 456-7890, 123-456-7890, etc.
        return /^[\+]?[1-9][\d\s\-\(\)\.]{7,18}$/.test(v.replace(/\s+/g, ''));
      },
      message: 'Please enter a valid phone number (e.g., +1234567890 or 123-456-7890)'
    },
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['unread', 'read', 'replied', 'archived'],
      message: 'Status must be either unread, read, replied, or archived'
    },
    default: 'unread'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be low, medium, high, or urgent'
    },
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'landing_page', 'other'],
    default: 'website'
  },
  ipAddress: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        // Basic IP validation (both IPv4 and IPv6)
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v);
      },
      message: 'Invalid IP address format'
    }
  },
  userAgent: {
    type: String,
    default: null,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  autoReplySent: {
    type: Boolean,
    default: false
  },
  autoReplySentAt: {
    type: Date,
    default: null
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: null
  },
  assignedTo: {
    type: String,
    trim: true,
    maxlength: [100, 'Assigned to field cannot exceed 100 characters'],
    default: null
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'contact-form' // Explicitly set collection name
});

// Indexes for better query performance
ContactSchema.index({ email: 1, createdAt: -1 });
ContactSchema.index({ phone: 1 });
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ priority: 1, status: 1 });
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ followUpRequired: 1, followUpDate: 1 });
ContactSchema.index({ assignedTo: 1, status: 1 });

// Virtual for full name formatting (if needed)
ContactSchema.virtual('formattedName').get(function() {
  return this.name.replace(/\b\w/g, l => l.toUpperCase());
});

// Virtual for contact age (how long since submitted)
ContactSchema.virtual('contactAge').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Less than an hour ago';
  }
});

// Instance method to mark as read
ContactSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Instance method to mark email as sent
ContactSchema.methods.markEmailSent = function() {
  this.emailSent = true;
  this.emailSentAt = new Date();
  return this.save();
};

// Instance method to mark auto-reply as sent
ContactSchema.methods.markAutoReplySent = function() {
  this.autoReplySent = true;
  this.autoReplySentAt = new Date();
  return this.save();
};

// Static method to get contacts by status
ContactSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get recent contacts
ContactSchema.statics.findRecent = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({ createdAt: { $gte: startDate } }).sort({ createdAt: -1 });
};

// Static method to get priority contacts
ContactSchema.statics.findByPriority = function(priority) {
  return this.find({ priority }).sort({ createdAt: -1 });
};

// Pre-save middleware to clean phone number
ContactSchema.pre('save', function(next) {
  if (this.isModified('phone')) {
    // Remove extra spaces and standardize format
    this.phone = this.phone.replace(/\s+/g, ' ').trim();
  }
  next();
});

// Pre-save middleware to set priority based on keywords
ContactSchema.pre('save', function(next) {
  if (this.isModified('message') && this.isNew) {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical'];
    const highKeywords = ['important', 'priority', 'soon', 'quickly'];
    
    const messageText = this.message.toLowerCase();
    
    if (urgentKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => messageText.includes(keyword))) {
      this.priority = 'high';
    }
  }
  next();
});

// Pre-save middleware to set follow-up date for urgent contacts
ContactSchema.pre('save', function(next) {
  if (this.isModified('priority') && this.priority === 'urgent' && !this.followUpDate) {
    this.followUpRequired = true;
    this.followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  }
  next();
});

// Ensure virtuals are included when converting to JSON
ContactSchema.set('toJSON', { virtuals: true });
ContactSchema.set('toObject', { virtuals: true });

// Export model
export default mongoose.models.Contact || mongoose.model('Contact', ContactSchema);