# **CRM-DASH-PRO**
```
☑️ Data Ingestion APIs - Implemented using Pub-sub architecture - RabbitMQ
☑️ Campaign Creation UI - With drag and drop mechanics 
☑️ Campaign Delivery - DB update in batches
☑️ Google OAuth 2.0 Login system
☑️ Used AI for for creative response to Admin 
```

**ApiDocumentation - Swagger** : [Link](https://assignmentx-k4ii.onrender.com/api-docs/)

**Website URL :** [Link](https://assignment-x-ruddy.vercel.app)

## **Project Overview**

This project, **CRM-DASH-PRO**, is designed to manage customers, orders, and campaigns in a modern CRM system. It demonstrates the integration of asynchronous messaging with **RabbitMQ**, secure authentication with **Google OAuth**, and dynamic campaign delivery with audience segmentation.

It includes:
- A **MERN** (MongoDB, Express.js, React, Node.js) stack
- **API documentation** using **swagger**
- **Admin/user role-based access**
- **RabbitMQ** for asynchronous data handling
- **Campaign management** with rule-based audience targeting
- **Communication logging** and **delivery stats**

## **Features**

- 🔐 **Google OAuth**-based login and session management
- 👤 **Admin and user authorization** levels
- 📋 **Customer and order management panels**
- 📦 **Campaign creation** with rule builder and delivery tracking
- 📊 **Campaign history** with delivery performance
- 🐇 **RabbitMQ** for processing customer/order/campaign events asynchronously

## **Installation**

To set up the project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/aditya-mistri/assignmentX
    ```

2. **Navigate to the project directory**:
    ```
    cd assignmentX
    ```

3. **Install backend dependencies**:
    ```
    cd server
    npm install
    ```

4. **Install frontend dependencies**:
    ```
    cd ../client
    npm install
    ```

### **.env file for client & server**

```env

VITE_BACKEND_URL="your-backend-url"


.env for server

PORT=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RABBITMQ_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
```

## Usage
### Start the backend server:

```
cd server
npm run dev:all ### This starts the backend(Nodejs+express) & Consumer Service concurrently
```
### Start the frontend
```
cd client
npm run dev

```

```
assignmentX/
│
├── client/                         # Frontend React Application
│   ├── .env                        # Environment variables
│   ├── .gitignore                  # Git ignore file
│   ├── eslint.config.js            # ESLint configuration
│   ├── index.html                  # Main HTML entry point
│   ├── package.json                # Frontend npm dependencies
│   ├── pnpm-lock.yaml              # Dependency lock file
│   ├── public/                     # Public assets
│   │   └── vite.svg                # Vite logo
│   ├── README.md                   # Frontend README
│   ├── src/                        # Source directory
│   │   ├── App.css                 # Global CSS
│   │   ├── App.jsx                 # Main React application component
│   │   ├── assets/                 # Static assets
│   │   │   └── react.svg           # React logo
│   │   ├── components/             # Reusable React components
│   │   │   ├── Alert.jsx           # Alert component
│   │   │   ├── Card.jsx            # Generic card component
│   │   │   ├── CreateOrderModal.jsx# Modal for creating orders
│   │   │   ├── CreateUserModal.jsx # Modal for creating users
│   │   │   ├── Layout.jsx          # Main layout component
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── OrderCard.jsx       # Order display card
│   │   │   ├── RuleBuilder/        # Rule builder components
│   │   │   │   ├── RuleBuilder.jsx # Main rule builder
│   │   │   │   ├── RuleGroup.jsx   # Rule grouping logic
│   │   │   │   └── RuleItem.jsx    # Individual rule item
│   │   │   ├── Sidebar.jsx         # Application sidebar
│   │   │   ├── Spinner.jsx         # Loading spinner
│   │   │   └── UserCard.jsx        # User display card
│   │   ├── context/                # React context providers
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── index.css               # Global CSS styles
│   │   ├── main.jsx                # React entry point
│   │   └── pages/                  # Page components
│   │       ├── CampaignCreate.jsx  # Campaign creation page
│   │       ├── CampaignHistory.jsx # Campaign history page
│   │       ├── CustomerDetail.jsx  # Customer details page
│   │       ├── Dashboard.jsx       # Main dashboard
│   │       ├── Login.jsx           # Login page
│   │       ├── Orders.jsx          # Orders management page
│   │       ├── Profile.jsx         # User profile page
│   │       ├── Settings.jsx        # Application settings
│   │       └── Users.jsx           # User management page
│   └── vite.config.js              # Vite configuration
│
└── server/                         # Backend Node.js Application
    ├── .env                        # Environment variables
    ├── config/                     # Configuration files
    │   ├── passport.js             # Passport.js configuration
    │   ├── rabbitmq.js             # RabbitMQ connection setup
    │   └── swagger.js              # Swagger documentation config
    ├── consumer-service.js         # Main consumer service
    ├── consumer/                   # Consumer-related files
    │   └── index.js                # Consumer entry point
    ├── controllers/                # Route controllers
    │   └── authController.js
    │   └── customerController.js
    │   └── orderController.js
    │   └── campaignController.js
    ├── index.js                    # Main server entry point
    ├── middleware/                 # Express middleware
    │   └── auth.js                 # Authentication middleware
    ├── models/                     # Mongoose models
    │   ├── admin.js                # Admin user model
    │   ├── Campaign.js             # Campaign data model
    │   ├── order.js                # Order data model
    │   ├── Segment.js              # Customer segment model
    │   └── User.js                 # User data model
    ├── package.json                # Backend npm dependencies
    ├── package-lock.json           # Dependency lock file
    ├── pnpm-lock.yaml              # Alternative lock file
    └── routes/                     # Express routes
        ├── auth.js                 # Authentication routes
        ├── campaigns.js            # Campaign-related routes
        ├── customers.js            # Customer-related routes
        └── order.js                # Order-related routes

```

### **Project Architecture**
![image](https://github.com/user-attachments/assets/64d98092-d9dd-45f7-8b0f-7e4b1ce6470e)

### **Rabbit MQ Part - The most crucial part**

![image](https://github.com/user-attachments/assets/52d1b199-58b5-4545-afa0-1f705e1bd7d2)

**Architecture Overview**
This system uses RabbitMQ as a message broker to decouple the main API from background processing tasks. The flow works as follows:

API receives request from frontend/client
API publishes message to RabbitMQ exchange
Consumer services process messages from queues asynchronously


**Configuration**
The RabbitMQ setup is configured in config/rabbitmq.js with:

```
// Connection
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Core Components
const EXCHANGES = {
  DATA_INGESTION: 'data_ingestion_exchange' // Topic exchange
};

const QUEUES = {
  CUSTOMER: 'customer_queue',
  ORDER: 'order_queue',
  CAMPAIGN: 'campaign_queue'
};

const ROUTING_KEYS = {
  CUSTOMER_CREATE: 'customer.create',
  // ... other routing keys
};

```

For production purpose I have used **cloudmq**, for depicting **rabbitmq** , and deployed both **consumer and main server in render.com**.


### **Note**

This application is still under development, by Aditya Mistri
