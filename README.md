
# RentNest 🏠
*"Find & List Rental Properties with Ease"*

RentNest is a backend API for a rental property marketplace. It allows **Landlords** to list properties and manage rental requests, **Tenants** to browse listings, book properties, and make payments, and **Admins** to oversee the entire platform, manage users, and moderate content.

---

## 🔗 Live Server URL
The backend application is successfully deployed and live at:
* **Production Link:** [https://assignment-4-vnjw.onrender.com](https://assignment-4-vnjw.onrender.com)
* **Base API Path:** `https://assignment-4-vnjw.onrender.com/api/`

---

## 🛠️ Tech Stack
* **Runtime Environment:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt
* **Payment Gateway:** SSLCommerz Integration

---

## 👥 Roles & Permissions

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Tenant** | Users looking for rental properties | Browse listings, submit rental requests, make payments, manage profile |
| **Landlord** | Property owners who list rentals | Create/manage listings, approve/reject requests, view history |
| **Admin** | Platform moderators | Manage all users, oversee listings, manage categories |

> 💡 **Note:** Users select their respective role during the registration process.

---

## 🔑 Default Admin Credentials (For Testing)
To test admin-only features (such as creating/managing categories or moderating users), please use the following credentials:
* **Email:** `sabiha13@admin.com`
* **Password:** `sabiha404?`

---

## 🚀 API Documentation & Endpoints

The complete Postman Collection is included in the root directory as `collection.json`. You can easily import it into Postman.

### 1. Authentication
* `POST /auth/register` - Register a new user (Tenant/Landlord)
* `POST /auth/login` - User login (Returns JWT token)

### 2. Properties & Rentals (with Category)
* `POST /properties/create` - Create a new property listing *(Admin/Landlord)*
* `GET /properties` - Get all properties *(Supports query filtering: `?category=APPOINTMENT` or `?category=APARTMENT`)*

### 3. Bookings
* `POST /rentals/create` - Book a rental request *(Tenant)*
* `PATCH /rentals/:id/status` - Accept or confirm booking request *(Landlord)*

### 4. Payments (SSLCommerz Integration)
* `POST /payments/create` - Initialize SSLCommerz payment session *(Tenant)*
* `POST /payments/confirm` - SSLCommerz Success Callback (Server-to-Server)
* `POST /payments/fail` - SSLCommerz Fail Callback
* `POST /payments/cancel` - SSLCommerz Cancel Callback

---

## 🔄 Rental Request Workflow

1. **Browse & Request:** Tenant browses properties ➡️ Submits a rental request (`PENDING`).
2. **Approval:** Landlord reviews the request ➡️ Approves/Accepts it (`APPROVED`).
3. **Payment:** Tenant initializes payment via SSLCommerz session.
4. **Active:** Once payment is confirmed (`SUCCESS`), the booking/rental status updates to `ACTIVE`.

---

## 💻 Getting Started Locally

### Prerequisites
Make sure you have **Node.js** and **npm** installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/RentNest.git](https://github.com/your-username/RentNest.git)
   cd RentNest