# Environment Setup Guide

This file explains the required environment variables for running the project.

---

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# MongoDB connection string
MONGO_URL=your_mongo_url

# Email credentials for sending emails
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password

# Razorpay API credentials
KEY_ID=your_razorpay_key_id
KEY_SECRET=your_razorpay_key_secret

# Application port (optional - defaults to 3000 if not set)
PORT=your_port
