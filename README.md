Assignment 4 

### 🔑 Default Admin Credentials (For Testing)
To test admin-only features (like creating categories), please use the following credentials:

* **Email:** "Sabiha13@admin.com",
* **Password:** "sabiha404?"




## 🚀 API Documentation

The complete Postman Collection is included in the root directory as `collection.json`. You can easily import it into Postman.

### Base URL
`http://localhost:3000/api/`

### Endpoints Summary

#### 🔑 Authentication
* `POST /auth/register` - User Registration
* `POST /auth/login` - User Login

#### 🏠 Properties & Rentals (with Category)
* `POST /properties/create` - Create a new property/rental (Admin/Landlord)
* `GET /properties` - Get all properties (Supports query filtering: `?category=APPOINTMENT` or `?category=APARTMENT`)

#### 📅 Bookings
* `POST /bookings/create` - Book a rental request (Tenant)
* `PATCH /bookings/:id/status` - Accept/Confirm booking request (Landlord)

#### 💳 Payments (SSLCommerz Integration)
* `POST /payments/create` - Initialize payment session (Tenant)
* `POST /payments/confirm` - SSLCommerz Success Callback (Server-to-Server)
* `POST /payments/fail` - SSLCommerz Fail Callback
* `POST /payments/cancel` - SSLCommerz Cancel Callback
