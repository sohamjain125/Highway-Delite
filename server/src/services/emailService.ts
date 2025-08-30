import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter?: nodemailer.Transporter;
  private isMockMode: boolean;

  constructor() {
    // Check if we're in mock mode (no email credentials)
    this.isMockMode = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
    
    if (!this.isMockMode) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    if (this.isMockMode) {
      // Mock email sending - just log to console
      console.log('📧 [MOCK MODE] Email would be sent:');
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Content: ${options.html.replace(/<[^>]*>/g, '').substring(0, 100)}...`);
      console.log('📧 [MOCK MODE] Email "sent" successfully!');
      return;
    }

    try {
      if (!this.transporter) {
        throw new Error('Email transporter not configured');
      }
      
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
          .logo {
            width: 60px;
            height: 24px;
            margin: 0 auto 20px auto;
            display: block;
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
            <svg class="logo" viewBox="0 0 79 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.1424 0.843087L16.9853 0L14.3248 9.89565L11.9228 0.961791L8.76555 1.80488L11.3608 11.4573L4.8967 5.01518L2.58549 7.31854L9.67576 14.3848L0.845959 12.0269L0 15.1733L9.64767 17.7496C9.53721 17.2748 9.47877 16.7801 9.47877 16.2717C9.47877 12.6737 12.4055 9.75685 16.0159 9.75685C19.6262 9.75685 22.5529 12.6737 22.5529 16.2717C22.5529 16.7768 22.4952 17.2685 22.3861 17.7405L31.1541 20.0818L32 16.9354L22.314 14.3489L31.1444 11.9908L30.2984 8.84437L20.6128 11.4308L27.0768 4.98873L24.7656 2.68538L17.7737 9.65357L20.1424 0.843087Z" fill="#367AFF"/>
              <path d="M22.3776 17.7771C22.1069 18.9176 21.5354 19.9421 20.7513 20.763L27.1033 27.0935L29.4145 24.7901L22.3776 17.7771Z" fill="#367AFF"/>
              <path d="M20.6872 20.8292C19.8936 21.637 18.8907 22.2398 17.7661 22.5504L20.0775 31.1472L23.2346 30.3041L20.6872 20.8292Z" fill="#367AFF"/>
              <path d="M17.6482 22.5819C17.1264 22.7156 16.5795 22.7866 16.0159 22.7866C15.4121 22.7866 14.8274 22.705 14.2723 22.5523L11.9589 31.1569L15.116 32L17.6482 22.5819Z" fill="#367AFF"/>
              <path d="M14.1607 22.5205C13.0532 22.1945 12.0682 21.584 11.2908 20.7739L4.92322 27.1199L7.23442 29.4233L14.1607 22.5205Z" fill="#367AFF"/>
              <path d="M11.2377 20.7178C10.4737 19.9026 9.91718 18.8917 9.65228 17.7688L0.855713 20.1179L1.70167 23.2643L11.2377 20.7178Z" fill="#367AFF"/>
              <path d="M46.0766 25V7.54544H49.2385V14.9346H57.3266V7.54544H60.497V25H57.3266V17.5852H49.2385V25H46.0766ZM68.8907 25H62.976V7.54544H69.0101C70.743 7.54544 72.2316 7.89487 73.476 8.59374C74.726 9.28692 75.6862 10.2841 76.3566 11.5852C77.0271 12.8864 77.3623 14.4432 77.3623 16.2557C77.3623 18.0739 77.0243 19.6364 76.3481 20.9432C75.6777 22.25 74.7089 23.2528 73.4419 23.9517C72.1805 24.6506 70.6635 25 68.8907 25ZM66.1379 22.2642H68.7373C69.9532 22.2642 70.9674 22.0426 71.7799 21.5994C72.5924 21.1506 73.2032 20.4829 73.6123 19.5966C74.0214 18.7045 74.226 17.5909 74.226 16.2557C74.226 14.9204 74.0214 13.8125 73.6123 12.9318C73.2032 12.0454 72.5981 11.3835 71.797 10.946C71.0015 10.5028 70.0129 10.2812 68.8311 10.2812H66.1379V22.2642Z" fill="#232323"/>
            </svg>
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
          .logo {
            width: 60px;
            height: 24px;
            margin: 0 auto 20px auto;
            display: block;
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
            <svg class="logo" viewBox="0 0 79 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.1424 0.843087L16.9853 0L14.3248 9.89565L11.9228 0.961791L8.76555 1.80488L11.3608 11.4573L4.8967 5.01518L2.58549 7.31854L9.67576 14.3848L0.845959 12.0269L0 15.1733L9.64767 17.7496C9.53721 17.2748 9.47877 16.7801 9.47877 16.2717C9.47877 12.6737 12.4055 9.75685 16.0159 9.75685C19.6262 9.75685 22.5529 12.6737 22.5529 16.2717C22.5529 16.7768 22.4952 17.2685 22.3861 17.7405L31.1541 20.0818L32 16.9354L22.314 14.3489L31.1444 11.9908L30.2984 8.84437L20.6128 11.4308L27.0768 4.98873L24.7656 2.68538L17.7737 9.65357L20.1424 0.843087Z" fill="#367AFF"/>
              <path d="M22.3776 17.7771C22.1069 18.9176 21.5354 19.9421 20.7513 20.763L27.1033 27.0935L29.4145 24.7901L22.3776 17.7771Z" fill="#367AFF"/>
              <path d="M20.6872 20.8292C19.8936 21.637 18.8907 22.2398 17.7661 22.5504L20.0775 31.1472L23.2346 30.3041L20.6872 20.8292Z" fill="#367AFF"/>
              <path d="M17.6482 22.5819C17.1264 22.7156 16.5795 22.7866 16.0159 22.7866C15.4121 22.7866 14.8274 22.705 14.2723 22.5523L11.9589 31.1569L15.116 32L17.6482 22.5819Z" fill="#367AFF"/>
              <path d="M14.1607 22.5205C13.0532 22.1945 12.0682 21.584 11.2908 20.7739L4.92322 27.1199L7.23442 29.4233L14.1607 22.5205Z" fill="#367AFF"/>
              <path d="M11.2377 20.7178C10.4737 19.9026 9.91718 18.8917 9.65228 17.7688L0.855713 20.1179L1.70167 23.2643L11.2377 20.7178Z" fill="#367AFF"/>
              <path d="M46.0766 25V7.54544H49.2385V14.9346H57.3266V7.54544H60.497V25H57.3266V17.5852H49.2385V25H46.0766ZM68.8907 25H62.976V7.54544H69.0101C70.743 7.54544 72.2316 7.89487 73.476 8.59374C74.726 9.28692 75.6862 10.2841 76.3566 11.5852C77.0271 12.8864 77.3623 14.4432 77.3623 16.2557C77.3623 18.0739 77.0243 19.6364 76.3481 20.9432C75.6777 22.25 74.7089 23.2528 73.4419 23.9517C72.1805 24.6506 70.6635 25 68.8907 25ZM66.1379 22.2642H68.7373C69.9532 22.2642 70.9674 22.0426 71.7799 21.5994C72.5924 21.1506 73.2032 20.4829 73.6123 19.5966C74.0214 18.7045 74.226 17.5909 74.226 16.2557C74.226 14.9204 74.0214 13.8125 73.6123 12.9318C73.2032 12.0454 72.5981 11.3835 71.797 10.946C71.0015 10.5028 70.0129 10.2812 68.8311 10.2812H66.1379V22.2642Z" fill="#232323"/>
            </svg>
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
