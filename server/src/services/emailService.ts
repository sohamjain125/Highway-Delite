import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"Highway Delite" <${process.env.EMAIL_USER}>`,
        ...options
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOTP(email: string, otp: string, name: string): Promise<void> {
    const subject = 'Your OTP for Highway Delite';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background-color: #007bff;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .otp-container {
            background-color: #f8f9fa;
            border: 2px dashed #007bff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">HD</div>
            <h1>Highway Delite</h1>
            <h2>OTP Verification</h2>
          </div>
          
          <p>Hello <strong>${name}</strong>,</p>
          
          <p>Thank you for signing up with Highway Delite! To complete your registration, please use the following OTP:</p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>This OTP is valid for <strong>10 minutes</strong> and can only be used once.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            • Never share this OTP with anyone<br>
            • Highway Delite will never ask for your OTP via phone or email<br>
            • If you didn't request this OTP, please ignore this email
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br>The Highway Delite Team</p>
            <p>© 2024 Highway Delite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Highway Delite!';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Highway Delite</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            background-color: #007bff;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .welcome-message {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
          }
          .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .feature-item {
            margin: 10px 0;
            padding-left: 20px;
          }
          .feature-item:before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">HD</div>
            <h1>Highway Delite</h1>
          </div>
          
          <div class="welcome-message">
            <h2>🎉 Welcome to Highway Delite, ${name}!</h2>
            <p>Your account has been successfully created and verified.</p>
          </div>
          
          <p>We're excited to have you on board! Highway Delite is your personal space for capturing thoughts, ideas, and memories.</p>
          
          <div class="features">
            <h3>What you can do:</h3>
            <div class="feature-item">Create and organize notes</div>
            <div class="feature-item">Add tags and categories</div>
            <div class="feature-item">Pin important notes</div>
            <div class="feature-item">Search through your notes</div>
            <div class="feature-item">Access from anywhere</div>
          </div>
          
          <p>Start creating your first note and discover the power of organized thinking!</p>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Best regards,<br>The Highway Delite Team</p>
            <p>© 2024 Highway Delite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService();
export const sendOTP = (email: string, otp: string, name: string) => emailService.sendOTP(email, otp, name);
export const sendWelcomeEmail = (email: string, name: string) => emailService.sendWelcomeEmail(email, name);
