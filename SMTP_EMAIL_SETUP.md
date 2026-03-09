# 📧 SMTP Email Configuration

## 🔧 **Setup Instructions**

### **1. Configure Gmail SMTP (Recommended)**

#### **Step 1: Enable 2-Factor Authentication**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. This is required for App Passwords

#### **Step 2: Create App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" for the app
3. Select "Other (Custom name)" and name it "IUK Clearance System"
4. Copy the generated 16-character password

#### **Step 3: Update .env File**
Add these lines to your `backend/.env` file:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:8081
```

### **2. Alternative SMTP Providers**

#### **Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### **Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### **SendGrid (Production):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
```

---

## 🚀 **Testing the Email Service**

### **1. Start Backend Server**
```bash
cd backend
npm run dev
```

### **2. Check Email Service Status**
You should see in the console:
```
✅ SMTP server connection verified
```

### **3. Test Password Reset**
1. Go to http://localhost:8081/forgot-password
2. Enter your email
3. Check your email inbox for the reset link

### **4. Test Welcome Email**
1. Create a new account at http://localhost:8081/signup
2. Check your email for the welcome message

---

## 📨 **Email Templates**

### **Password Reset Email:**
- ✅ Professional HTML template
- ✅ Responsive design
- ✅ Security warnings
- ✅ Expiration notice (24 hours)
- ✅ Clear call-to-action button

### **Welcome Email:**
- ✅ Account confirmation
- ✅ Login credentials reminder
- ✅ Account type information
- ✅ Professional branding

---

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **"SMTP connection failed"**
- Check email/password are correct
- Ensure 2FA is enabled for Gmail
- Use App Password (not regular password)
- Verify SMTP host/port settings

#### **"Email not received"**
- Check spam/junk folder
- Verify email address is correct
- Check SMTP logs in console
- Ensure firewall allows SMTP traffic

#### **"Invalid login" (Gmail)**
- Enable "Less secure app access" temporarily
- Or use App Password (recommended)
- Check if Google blocked the attempt

### **Debug Mode:**
Add this to your `.env` for detailed logging:
```env
NODE_ENV=development
```

---

## 🎯 **Production Considerations**

### **Security:**
- ✅ Use App Passwords (not real passwords)
- ✅ Store credentials in environment variables
- ✅ Never commit .env file to git
- ✅ Use dedicated email service in production

### **Deliverability:**
- ✅ Set up SPF/DKIM records
- ✅ Use dedicated SMTP service (SendGrid, Mailgun)
- ✅ Monitor email bounce rates
- ✅ Set up reply-to addresses

### **Scaling:**
- ✅ Use email queue for bulk sending
- ✅ Implement rate limiting
- ✅ Monitor SMTP provider limits
- ✅ Use multiple SMTP providers for redundancy

---

## 🎉 **Features Implemented**

### **✅ Email Service:**
- SMTP connection verification
- Professional HTML templates
- Error handling and logging
- Graceful fallback on email failure

### **✅ Password Reset:**
- Secure token generation
- Email delivery confirmation
- Professional email template
- Security warnings and expiration

### **✅ Welcome Emails:**
- Account confirmation
- User onboarding
- Professional branding
- Login instructions

---

## 📞 **Support**

If you encounter issues:

1. **Check console logs** for detailed error messages
2. **Verify SMTP credentials** are correct
3. **Test with different email providers**
4. **Check spam/junk folders**
5. **Ensure firewall allows SMTP traffic**

**The email system is now fully functional and production-ready!** 📧✨
