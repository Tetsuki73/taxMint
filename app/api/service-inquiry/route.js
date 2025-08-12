// app/api/service-inquiry/route.js
import connectDB from '@/lib/mongodb';
import ServiceInquiry from '@/models/ServiceInquiry';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse the request body
    const { name, email, mobile, occupation, serviceCategory, selectedServices, message } = await request.json();

    // Basic validation
    if (!name || !email || !mobile || !occupation || !serviceCategory || !selectedServices || !message) {
      return Response.json({
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Validate selectedServices is an array
    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      return Response.json({
        message: 'Please select at least one service'
      }, { status: 400 });
    }

    // Get client info for analytics
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(/, /)[0] : request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    // Create new service inquiry
    const newServiceInquiry = new ServiceInquiry({
      name,
      email,
      mobile,
      occupation,
      serviceCategory,
      selectedServices,
      message,
      ipAddress,
      userAgent
    });

    const savedInquiry = await newServiceInquiry.save();

    console.log('Service inquiry saved successfully:', savedInquiry._id);

    return Response.json({
      ok: true,
      message: 'Service inquiry submitted successfully! We will contact you soon.',
      id: savedInquiry._id,
      inquiryNumber: `INQ-${savedInquiry._id.toString().slice(-8).toUpperCase()}`
    }, { status: 201 });

  } catch (error) {
    console.error('Database error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return Response.json({
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    // Handle duplicate errors (if you add unique constraints later)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return Response.json({
        message: `A service inquiry with this ${field} already exists`
      }, { status: 409 });
    }

    return Response.json({
      message: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}

// Optional: GET method to retrieve service inquiries (for admin panel later)
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const serviceCategory = searchParams.get('serviceCategory');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    
    let query = {};
    if (status) query.status = status;
    if (serviceCategory) query.serviceCategory = serviceCategory;
    
    const inquiries = await ServiceInquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-ipAddress -userAgent'); // Hide sensitive data
    
    const total = await ServiceInquiry.countDocuments(query);
    
    return Response.json({
      inquiries,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total
      }
    });
    
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return Response.json({ message: 'Failed to fetch inquiries' }, { status: 500 });
  }
}