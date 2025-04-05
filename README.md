# <p align="center">CARA</p>

CARA is a feature-rich e-commerce platform offering seamless product, cart, wishlist, and order management for customers — and powerful controls for admins.

---

## Features

### **User & Admin Management**
- Secure user signup, login, and session handling.
- Admin panel for managing users, orders, products, coupons, and offers.
- Referral program to drive organic user growth.

### **Product, Cart & Wishlist**
- Add/remove products from cart and wishlist.
- Quantity adjustment, stock updates, and live pricing.
- Detailed product views with offer handling.

### **Order & Invoice System**
- Full order history for users and admin.
- Invoice generation after purchase.
- Order status tracking and admin-side control.

### **Coupon & Offers**
- Apply coupons during checkout.
- Admin can create, update, and disable offers or promo codes.

### **Razorpay Payment Integration**
- Secure payments via Razorpay gateway.
- Order confirmation only after successful payment.

### **Email Notifications**
- Email confirmations for registration and orders via Nodemailer.

---

## Tech Stack

- **Backend**: Node.js, Express.js  
- **Templating**: EJS  
- **Database**: MongoDB (Mongoose)  
- **Payments**: Razorpay  
- **Email Service**: Nodemailer  
- **Deployment**: AWS EC2  

---

## Installation

```bash
# Clone the repository
git clone https://github.com/shahzadahamad/Cara.git

# Install dependencies
npm install

# Set up environment variables (check ENV_SETUP.md for details)
# Ensure you create a .env file in the root directory

# Start the application
npm start

