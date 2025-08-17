// lib/emailErrorHandler.js
export const handleEmailError = (error, context = 'email') => {
  const errorMessages = {
    'Invalid login': 'Email authentication failed. Please check your Gmail credentials.',
    'Connection timeout': 'Email service is temporarily unavailable. Please try again later.',
    'Network error': 'Unable to connect to email service. Check your internet connection.',
    'EAUTH': 'Gmail authentication failed. Please verify your app password.',
    'ENOTFOUND': 'Gmail servers are unreachable. Please try again later.',
    'ETIMEDOUT': 'Email service timed out. Please try again.',
    'ECONNREFUSED': 'Email service connection refused. Please try again later.',
  };

  let userMessage = 'Unable to send email notification at this time.';
  let logMessage = `❌ ${context} failed: ${error.message}`;

  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(errorMessages)) {
    if (error.message?.includes(pattern) || error.code === pattern) {
      userMessage = message;
      break;
    }
  }

  // Log detailed error for debugging
  console.error(logMessage, {
    code: error.code,
    response: error.response,
    stack: error.stack
  });

  return {
    userMessage,
    logMessage,
    shouldRetry: !['Invalid login', 'EAUTH'].includes(error.code)
  };
};

// Email configuration validator
export const validateEmailConfig = () => {
  const required = ['EMAIL_USER', 'EMAIL_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required email environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};