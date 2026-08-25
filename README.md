# 🍽️ FoodConnect

**FoodConnect** is a Multi-Restaurant Online Ordering and Restaurant Management Platform developed as a **Bachelor of Science in Information Technology (BSIT) Capstone Project**.

The system is designed to connect customers with multiple restaurants through a single platform. Customers can discover restaurants, browse menus, place orders, complete checkout, and track their orders, while restaurant owners and staff can manage restaurant operations through role-based dashboards.

---

# 🚀 Features

## 👤 Customer

* Restaurant browsing and discovery
* Dynamic restaurant pages
* Menu and product browsing
* Product categories and variants
* Shopping cart
* Checkout
* Multiple order types:

  * Dine-in
  * Take-out
  * Delivery
* Order tracking
* Order cancellation
* My Orders
* Email verification
* QR-based order verification
* Payment integration
* Responsive customer interface
* Light/Dark mode

---

## 🏪 Restaurant Owner

### Dashboard

* Restaurant overview
* Order statistics
* Sales overview
* Restaurant activity

### Restaurant Management

* Restaurant profile management
* Restaurant information and settings
* Restaurant creation workflow
* Restaurant document submission

### Product Management

* Add, edit, and delete products
* Product availability
* Product categories
* Product variants
* Product search
* Category filtering
* Product sorting

### Inventory Management

* Stock monitoring
* In-stock, low-stock, and out-of-stock indicators
* Inventory search
* Stock filtering
* Restocking

### Order Management

* View incoming orders
* View order details
* Manage order status
* Order cancellation handling

### Staff Management

* Manage restaurant staff
* Role-based access

### Sales Reports

* Sales monitoring
* Sales trends
* Order-based analytics
* Restaurant-specific sales data
* Report export

### Notifications

* Restaurant notifications
* Order-related notifications

### Activity Logs

* Track important restaurant activities
* Monitor order-related actions
* Identify actions performed by users

### Settings

* Restaurant settings
* Account settings
* System preferences

---

## 💳 Cashier

* Incoming orders
* Order details
* Order processing
* Order status updates
* Order cancellation
* QR verification
* Customer receipt generation
* Kitchen ticket generation
* Thermal receipt printing
* Customer and kitchen receipt printing

---

## 🚚 Delivery

The delivery module is being developed to support restaurant delivery operations.

Planned/current functionality includes:

* Assigned deliveries
* Delivery status updates
* Restaurant-specific delivery staff
* Delivery coordination
* Third-party rider support
* Delivery fee management

---

## 🤝 Partner Portal

The Partner Portal supports the onboarding and coordination of external delivery partners.

* Partner invitation requests
* Partner registration workflow
* Partner request management
* Partner-related backend functionality

---

## 🛡️ Admin

The Admin module is part of the remaining platform development.

Planned functionality includes:

* Restaurant approval
* Restaurant verification
* Platform management
* User/platform monitoring
* Restaurant account management
* Delivery coordination
* Administrative activity monitoring

---

# 🏗️ System Architecture

FoodConnect uses a **multi-restaurant architecture** where restaurant data is isolated using `restaurant_id`.

This allows multiple restaurants to operate independently within the same platform while sharing the same application infrastructure.

### User Roles

* Customer
* Restaurant Owner
* Cashier
* Kitchen Staff
* Delivery Staff
* Admin
* Delivery/Partner-related users

Access to protected functionality is controlled through role-based authentication and restaurant-specific access rules.

---

# 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* PHP

### Database

* MySQL - Main database used for storing FoodConnect system data such as users, restaurants, products, orders, payments, inventory, and transactions.

### Development Environment

* XAMPP
* Visual Studio Code
* MySQL Workbench
* Git
* GitHub

### External Services / Integrations

* PayMongo Payment Gateway – Used for online payment processing and transaction handling.
* PHPMailer and Brevo SMTP Email Service – Used for sending email notifications, verification emails, and system messages.
* Leaflet - Used as the interactive mapping library for FoodConnect's location-based features. It provides the map interface used for displaying locations, markers, and delivery-related map information within the system.
* Geoapify - Used as the map and location service provider. It provides geocoding, address searching, map tiles, and location-related services required by FoodConnect's delivery and location features.
* Firebase Realtime Database – Used for real-time GPS location tracking in the FoodConnect delivery feature, allowing live monitoring of delivery personnel location updates.
* Aiven – Cloud MySQL Database Hosting Used to host the production MySQL database of FoodConnect in the cloud. It allows the system to store and access its database remotely
* MySQL Workbench – Database Management Tool Used to connect to, manage, and administer the FoodConnect MySQL database hosted on Aiven. It is used for tasks such as viewing tables, executing SQL queries, modifying database structures, and managing database data.
---

# 📂 Project Structure

```text
FoodConnect/
│
├── api/
│   ├── config/
│   └── ...
│
├── database/
│
├── frontend/
│
├── README.md
│
└── .gitignore
```

The project separates the frontend, backend API, database resources, and environment-specific configuration.

---

# 🔐 Security

FoodConnect follows security practices appropriate for a multi-user web application.

* Role-based access control
* Restaurant data isolation using `restaurant_id`
* Session-protected owner/staff APIs
* Separate public and authenticated API endpoints
* Sensitive database credentials are not hard-coded into public files
* SMTP credentials are stored locally and excluded from Git
* Environment/local configuration files are excluded from version control
* Input validation and API-side validation
* Protected administrative and restaurant management functions

Sensitive configuration files must **not** be committed to the repository.

---

# 🌐 Deployment & Testing

FoodConnect is currently transitioning from local development to **cloud-based deployment and live testing**.

The development workflow includes:

1. Local development using XAMPP
2. Local database testing with MySQL
3. Cloud database integration
4. API and frontend deployment
5. Live testing of customer and restaurant workflows
6. Cross-role testing
7. Bug fixing and UI/UX refinement
8. Final system hardening and capstone validation

Some features require a deployed environment for complete testing, particularly services involving email verification, payment processing, external integrations, and live user workflows.

---

# 🧪 Current Development Status

🚧 **Under Active Development — Testing & Finalization Phase**

The major core functionality of FoodConnect has been implemented, and the project is currently focused on:

* Live deployment
* End-to-end testing
* Bug fixing
* UI/UX polishing
* Security hardening
* Cross-role testing
* Payment testing
* Email verification testing
* Delivery workflow completion
* Admin functionality
* Final integration testing
* Capstone presentation readiness

### Completed / Substantially Implemented

* Customer ordering workflow
* Restaurant browsing
* Cart and checkout
* Order tracking
* Customer order management
* Restaurant owner dashboard
* Product management
* Inventory management
* Order management
* Staff management
* Notifications
* Activity logs
* Sales reports
* Restaurant settings
* Cashier dashboard
* QR verification
* Receipt printing
* Partner Portal
* Cloud database integration
* Payment gateway integration

### Still Being Developed / Finalized

* Admin Dashboard
* Restaurant approval workflow
* Delivery Dashboard
* Delivery coordination
* Third-party rider workflow
* Full live deployment
* Complete end-to-end production testing
* Final UI/UX polishing
* Final security and reliability hardening

> **Note:** Some modules may be functionally implemented but still require deployment and real-world testing before being considered fully complete.

---

# 📋 Development Approach

FoodConnect is being developed incrementally with emphasis on preserving the existing system architecture.

The project follows these principles:

* Preserve existing database structure unless a database change is explicitly required
* Maintain restaurant isolation
* Preserve existing API endpoints and frontend integrations
* Avoid unnecessary changes to existing variable names, IDs, class names, and filenames
* Test existing functionality before modifying it
* Prioritize backward compatibility
* Perform live testing before marking integrations as complete
* Fix functionality first, then perform UI/UX refinement and final hardening

---

# 👨‍💻 Developers

* **Carlos Jay Miguel T. Porto**
* **Angel Recepcion**
* **Ian Dela Cruz**

---

# 📄 License

This repository is intended for **educational purposes** as part of a **BSIT Capstone Project**.

It is not intended for commercial distribution without permission from the project developers.
