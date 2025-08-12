// app/api/contact/route.js
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, message } = await request.json();

    // Get client info for analytics (optional)
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(/, /)[0] : request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    // Create new contact (Mongoose will handle validation)
    const newContact = new Contact({
      name,
      email,
      message,
      ipAddress,
      userAgent
    });

    const savedContact = await newContact.save();

    console.log('Contact saved successfully:', savedContact._id);

    return Response.json({
      ok: true,
      message: 'Message sent successfully!',
      id: savedContact._id
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

    return Response.json({
      message: 'Internal server error. Please try again later.'
    }, { status: 500 });
  }
}