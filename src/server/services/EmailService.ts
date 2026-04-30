import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    // Direct SMTP configuration for Gmail
    // Trying port 465 (SMTPS) which is often more stable than 587 (STARTTLS)
    this.config = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'craaj17atz@gmail.com',
        pass: 'vzqpuukfjnnvzlsv'
      }
    };

    console.log('🔧 SMTP Configuration:');
    console.log(`   Host: ${this.config.host}`);
    console.log(`   Port: ${this.config.port}`);
    console.log(`   User: ${this.config.auth.user}`);
    console.log(`   Pass: ${this.config.auth.pass ? '***' + this.config.auth.pass.slice(-4) : 'MISSING'}`);

    // Gmail specific configuration with enhanced settings
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      debug: false,
      logger: false
    });
  }

  async verifyConnection(): Promise<boolean> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        if (!this.config.auth.user || !this.config.auth.pass) {
          console.log('❌ SMTP credentials missing');
          return false;
        }

        console.log(`🔍 Verifying SMTP connection to ${this.config.host}:${this.config.port} (Attempt ${attempt + 1}/${maxRetries + 1})`);
        console.log(`📧 Using email: ${this.config.auth.user}`);
        
        await this.transporter.verify();
        console.log('✅ SMTP server connection verified');
        return true;
      } catch (error) {
        const err = error as Error;
        console.error(`❌ SMTP connection attempt ${attempt + 1} failed:`, err.message);
        
        if (attempt === maxRetries) {
          // Provide specific Gmail troubleshooting on final failure
          if (this.config.host === 'smtp.gmail.com') {
            console.log('\n🔧 Gmail SMTP Troubleshooting:');
            console.log('1. Ensure 2FA is enabled on your Gmail account');
            console.log('2. Generate a new App Password: https://myaccount.google.com/apppasswords');
            console.log('3. Use App Password (not regular password)');
            console.log('4. Remove spaces from the App Password');
            console.log('5. Wait 5-10 minutes after generating new password');
            console.log('6. Ensure your network/firewall allows outgoing connections to port 465 or 587.');
          }
          return false;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempt++;
      }
    }
    return false;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"IUK Clearance System" <${this.config.auth.user}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      console.log(`📧 Sending email to: ${options.to}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      
      // For Gmail, show preview URL if available
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Preview URL:', previewUrl);
        }
      }
      
      return true;
    } catch (error) {
      const err = error as Error;
      console.error('❌ Failed to send email:', err.message);
      
      // Don't fail the operation if email fails
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string, userName: string = ''): Promise<boolean> {
    const subject = 'Password Reset Request - IUK Clearance System';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - IUK Clearance System</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          .content {
            margin: 30px 0;
          }
          .reset-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .reset-button:hover {
            background-color: #2563eb;
          }
          .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .expiry-warning {
            color: #dc2626;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="http://localhost:5173/iuk_logo.png" alt="IUK Logo" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;" />
              <span style="vertical-align: middle;">IUK Clearance System</span>
            </div>
            <div class="title">Password Reset Request</div>
            <div class="subtitle">Secure password recovery for your account</div>
          </div>
          
          <div class="content">
            ${userName ? `<p>Hello <strong>${userName}</strong>,</p>` : '<p>Hello,</p>'}
            
            <p>We received a request to reset your password for your IUK Clearance System account. If you made this request, please click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="reset-button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetLink}
            </p>
            
            <div class="security-note">
              <strong>🔒 Security Notice:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This link will expire in <span class="expiry-warning">24 hours</span></li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If you continue to have problems, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from IUK Clearance System.</p>
            <p>© 2026 IUK Clearance System. All rights reserved.</p>
            <p>If you didn't request this password reset, please disregard this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - IUK Clearance System
      
      Hello ${userName || 'User'},
      
      We received a request to reset your password. Click the link below to reset it:
      
      ${resetLink}
      
      This link will expire in 24 hours. If you didn't request this reset, please ignore this email.
      
      IUK Clearance System
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  async sendWelcomeEmail(email: string, userName: string, accountType: string): Promise<boolean> {
    const subject = 'Welcome to IUK Clearance System';
    
    // Dynamic frontend URL
    const getFrontendUrl = () => {
      if (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== 'undefined') {
        return process.env.FRONTEND_URL.replace(/\/$/, '');
      }
      return 'http://localhost:8080'; // Default development URL
    };
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome - IUK Clearance System</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #10b981;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
          }
          .welcome-message {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .login-button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="http://localhost:5173/iuk_logo.png" alt="IUK Logo" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;" />
              <span style="vertical-align: middle;">IUK Clearance System</span>
            </div>
            <h1>Welcome to IUK Clearance!</h1>
          </div>
          
          <div class="welcome-message">
            <strong>🎉 Account Created Successfully!</strong>
            <p>Your ${accountType} account has been set up and is ready to use.</p>
          </div>
          
          <p>Hello <strong>${userName}</strong>,</p>
          
          <p>Welcome to the IUK Clearance System! Your account has been successfully created with the following details:</p>
          
          <ul>
            <li><strong>Account Type:</strong> ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Status:</strong> Active</li>
          </ul>
          
          <p>You can now log in to your account and start using the clearance system:</p>
          
          <div style="text-align: center;">
            <a href="${getFrontendUrl()}/login" class="login-button">Log In to Your Account</a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The IUK Clearance Team</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  async sendClearanceStatusUpdateEmail(email: string, userName: string, status: string, departmentUpdates?: any[]): Promise<boolean> {
    const isApproved = status === 'completed';
    const subject = isApproved 
      ? 'Congratulations! Your Clearance is Approved - IUK Clearance System' 
      : 'Clearance Status Update - IUK Clearance System';
    
    // Dynamic frontend URL
    const getFrontendUrl = () => {
      if (process.env.FRONTEND_URL && process.env.FRONTEND_URL !== 'undefined') {
        return process.env.FRONTEND_URL.replace(/\/$/, '');
      }
      return 'http://localhost:8080';
    };

    const statusBadgeColor = isApproved ? '#10b981' : '#ef4444';
    const statusText = isApproved ? 'APPROVED' : 'REJECTED';
    
    let departmentStatusHtml = '';
    if (departmentUpdates && departmentUpdates.length > 0) {
      departmentStatusHtml = `
        <div style="margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 10px;">Department Updates:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #4b5563;">Department</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #4b5563;">Status</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2 solid #e5e7eb; color: #4b5563;">Comment</th>
              </tr>
            </thead>
            <tbody>
              ${departmentUpdates.map(update => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${update.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: ${update.status === 'approved' ? '#10b981' : '#ef4444'}; font-weight: bold;">
                      ${update.status.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                    ${update.comment || '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clearance Update - IUK Clearance System</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid ${statusBadgeColor}; }
          .logo { font-size: 24px; font-weight: bold; color: ${statusBadgeColor}; margin-bottom: 10px; }
          .status-banner { background-color: ${isApproved ? '#d1fae5' : '#fee2e2'}; border-left: 4px solid ${statusBadgeColor}; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: center; }
          .status-label { font-size: 20px; font-weight: bold; color: ${statusBadgeColor}; letter-spacing: 1px; }
          .action-button { display: inline-block; background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; text-align: center; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">IUK Clearance System</div>
            <h1 style="color: #111827; margin: 0;">Clearance Request Update</h1>
          </div>
          
          <p>Hello <strong>${userName}</strong>,</p>
          
          <p>There has been an update to your graduation clearance request. Your overall status is now:</p>
          
          <div class="status-banner">
            <div class="status-label">${statusText}</div>
          </div>
          
          ${isApproved 
            ? `<p>Congratulations! You have been cleared by all departments. You can now log in to generate and download your official clearance certificate.</p>` 
            : `<p>Unfortunately, your clearance request has been rejected by one or more departments. Please review the comments below and take the necessary actions to resolve the issues.</p>`
          }
          
          ${departmentStatusHtml}
          
          <div style="text-align: center;">
            <a href="${getFrontendUrl()}/student" class="action-button">View My Dashboard</a>
          </div>
          
          <p>If you have any questions, please contact the respective department or the Registrar's office.</p>
          
          <div class="footer">
            <p>This is an automated message from IUK Clearance System.</p>
            <p>© 2026 IUK Clearance System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

// Create singleton instance
export const emailService = new EmailService();

// Initialize and verify connection on startup
emailService.verifyConnection().then(isConnected => {
  if (!isConnected) {
    console.warn('⚠️ Email service is not available. Password reset emails will not be sent.');
  }
});

export default EmailService;
