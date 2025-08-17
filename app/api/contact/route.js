// app/api/contact/route.js
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendContactNotification, sendAutoReply, testEmailConfiguration } from '@/lib/emailService';

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, phone, message } = await request.json();

    // Get client info for analytics (optional)
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(/, /)[0] : request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    // Create new contact (Mongoose will handle validation)
    const newContact = new Contact({
      name,
      email,
      phone,
      message,
      ipAddress,
      userAgent
    });

    const savedContact = await newContact.save();
    console.log('✅ Contact saved successfully:', savedContact._id);

    // Test email configuration first
    console.log('🧪 Testing email configuration...');
    const emailTest = await testEmailConfiguration();
    if (!emailTest.success) {
      console.error('❌ Email configuration test failed:', emailTest.message);
    }

    // Send email notification (don't block the response if email fails)
    const emailPromises = [];
    
    // Send notification to admin (YOU)
    console.log('📧 Sending notification email...');
    emailPromises.push(
      sendContactNotification({
        name,
        email,
        phone,
        message,
        createdAt: savedContact.createdAt
      }).then(result => {
        if (result.success) {
          // Update database to mark email as sent
          savedContact.markEmailSent().catch(err => 
            console.error('Failed to update email sent status:', err)
          );
        }
        return result;
      }).catch(error => {
        console.error('Failed to send notification email:', error);
        return { success: false, error: error.message };
      })
    );

    // Optional: Send auto-reply to user
    console.log('📧 Sending auto-reply email...');
    emailPromises.push(
      sendAutoReply(email, name).then(result => {
        if (result.success) {
          // Update database to mark auto-reply as sent
          savedContact.markAutoReplySent().catch(err => 
            console.error('Failed to update auto-reply sent status:', err)
          );
        }
        return result;
      }).catch(error => {
        console.error('Failed to send auto-reply:', error);
        return { success: false, error: error.message };
      })
    );

    // Execute email sending in background (don't await)
    Promise.allSettled(emailPromises).then(results => {
      const [notificationResult, autoReplyResult] = results;
      
      if (notificationResult.status === 'fulfilled' && notificationResult.value.success) {
        console.log('📧 Notification email sent successfully to:', process.env.EMAIL_TO);
      } else {
        console.error('❌ Notification email failed:', notificationResult.reason || notificationResult.value?.error);
      }
      
      if (autoReplyResult.status === 'fulfilled' && autoReplyResult.value.success) {
        console.log('📧 Auto-reply sent successfully to:', email);
      } else {
        console.error('❌ Auto-reply failed:', autoReplyResult.reason || autoReplyResult.value?.error);
      }
    });

    return Response.json({
      ok: true,
      message: 'Message sent successfully! We will get back to you soon.',
      id: savedContact._id
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Database error:', error);

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