# 🛒 Grocerly

Grocerly is a full-stack e-commerce grocery application built with **MERN (MongoDB, Express, React, Node.js)**.  
It allows users to browse products, manage their cart, place orders with delivery slots, and manage addresses.  
Admins can manage products, orders, and users via a dashboard.

---

## 🚀 Features

### 👤 User

- Browse products by category
- Add/remove items from the cart
- Minimum spend validation (e.g. 75 currency)
- Multiple shipping addresses (add, change, delete)
- Delivery slot booking system
- Checkout with **Cash on Delivery (COD)** or **Stripe**
- Order history & tracking
- User dashboard with:
  - Recent orders
  - Saved addresses
  - Points system (earned from orders)
  - Account details
  - Discounts (TODO)

### 🛠️ Admin

- Add, update, delete products
  - Product image upload via **Cloudinary**
  - Existing/new image handling during update
  - Old image cleanup from Cloudinary
- Manage orders & confirm deliveries
- Manage users (TODO)
- Dashboard with stats (orders, revenue, etc.)

---

## 🏗️ Tech Stack

**Frontend**

- React + Vite
- TailwindCSS for styling
- Axios for API requests
- React Hot Toast for notifications

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- Cloudinary for image storage
- Multer for file uploads
- Stripe for online payments
- Google login & Custom backend registering/login

---

🧑‍💻 Author

Olly – Aspiring Junior Backend Developer

📧 softwaredevdad@gmail.com

<!-- 🌐 https://devdad.org -->

---

📄 License

This project is licensed under the MIT License.

---

🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
