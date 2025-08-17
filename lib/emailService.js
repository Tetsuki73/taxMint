// lib/emailService.js
import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password from Gmail
      },
      // Additional options for better compatibility
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    console.error('❌ Failed to create transporter:', error);
    throw error;
  }
};

// Test transporter connection
const testConnection = async (transporter) => {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    return false;
  }
};

// Send contact form notification email TO YOU (website owner)
export const sendContactNotification = async (contactData) => {
  try {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing email configuration. Please check EMAIL_USER and EMAIL_PASS in .env.local');
    }

    const transporter = createTransporter();
    
    // Test connection before sending
    const connectionTest = await testConnection(transporter);
    if (!connectionTest) {
      throw new Error('SMTP connection test failed');
    }

    const { name, email, phone, message, createdAt } = contactData;
    
    // Note: 'email' here is the USER'S email who submitted the form
    // EMAIL_TO is YOUR email where you want to receive notifications

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
          .field { margin-bottom: 15px; }
          .field-label { font-weight: bold; color: #495057; margin-bottom: 5px; }
          .field-value { background-color: #f8f9fa; padding: 10px; border-radius: 3px; word-wrap: break-word; }
          .footer { margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d; }
          .timestamp { color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0; color: #212529;">📧 New Contact Form Submission</h2>
            <p class="timestamp" style="margin: 10px 0 0 0;">
              Received: ${new Date(createdAt).toLocaleString('en-US', { 
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })} IST
            </p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="field-label">👤 Name:</div>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">📧 Email:</div>
              <div class="field-value">
                <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">
                  ${email}
                </a>
              </div>
            </div>
            
            <div class="field">
              <div class="field-label">📱 Phone:</div>
              <div class="field-value">
                <a href="tel:${phone}" style="color: #007bff; text-decoration: none;">
                  ${phone}
                </a>
              </div>
            </div>
            
            <div class="field">
              <div class="field-label">💬 Message:</div>
              <div class="field-value" style="white-space: pre-wrap;">${message}</div>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">This email was automatically generated from your TAXMANTRAA website's contact form.</p>
            <p style="margin: 5px 0 0 0;">
              <strong>Quick Actions:</strong> 
              <a href="mailto:${email}?subject=Re: Your Contact Form Submission" style="color: #007bff;">Reply to ${name}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
      NEW CONTACT FORM SUBMISSION - TAXMANTRAA
      ========================================
      
      Received: ${new Date(createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
      
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      
      Message:
      ${message}
      
      ---
      Reply directly to: ${email}
    `;

    // Email options - NOTIFICATION TO YOU
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TAXMANTRAA Contact Form',
        address: process.env.EMAIL_USER  // Your Gmail address (sender)
      },
      to: process.env.EMAIL_TO || process.env.EMAIL_USER, // YOUR email (recipient)
      subject: `🔔 New Contact: ${name} - ${new Date().toLocaleDateString()}`,
      text: textContent,
      html: htmlContent,
      replyTo: email, // User's email - so when you hit reply, it goes to the user
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Notification email sent successfully:', info.messageId);
    console.log('📧 Email sent from:', process.env.EMAIL_USER);
    console.log('📧 Email sent to:', process.env.EMAIL_TO || process.env.EMAIL_USER);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return { success: false, error: error.message };
  }
};

// Optional: Send auto-reply to USER (acknowledgment email)
export const sendAutoReply = async (userEmail, userName) => {
  try {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing email configuration. Please check EMAIL_USER and EMAIL_PASS in .env.local');
    }

    const transporter = createTransporter();
    
    // Note: userEmail is the email address of the person who submitted the form
    // This function sends a "thank you" email TO THEM

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting TAXMANTRAA</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
          .footer { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; text-align: center; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">✅ Thank You for Your Message!</h2>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for reaching out to <strong>TAXMANTRAA</strong>! We have successfully received your message and will get back to you within 24-48 hours.</p>
            <p>We appreciate your interest in our tax and financial services and look forward to connecting with you soon.</p>
            <p>Best regards,<br>
            <strong>TAXMANTRAA Team</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; font-size: 12px;">This is an automated response. Please do not reply to this email.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">For immediate assistance, please call us or visit our website.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'TAXMANTRAA',
        address: process.env.EMAIL_USER  // Your Gmail (sender)
      },
      to: userEmail,  // User's email (recipient of the thank you message)
      subject: `Thank you for contacting TAXMANTRAA, ${userName}!`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply sent successfully:', info.messageId);
    console.log('📧 Auto-reply sent to:', userEmail);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Auto-reply failed:', error);
    return { success: false, error: error.message };
  }
};

// Export a test function
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    const isValid = await testConnection(transporter);
    return {
      success: isValid,
      message: isValid ? 'Email configuration is valid' : 'Email configuration failed'
    };
  } catch (error) {
    return {
      success: false,
      message: `Email test failed: ${error.message}`
    };
  }
};