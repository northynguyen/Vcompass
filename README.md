# Vcompass Travel Planning Platform

## Deploy
#### Customer : https://vcompass.onrender.com
#### Partner  : https://vcompass-partner.onrender.com

## Overview
Vcompass is a comprehensive travel planning platform designed for three main user roles: **Admin**, **Partner**, and **Customer**. The platform allows users to create personalized travel itineraries, explore and modify existing itineraries, and book accommodations directly without third-party intermediaries.

### Key Features
#### For Customers
- Create and customize travel itineraries by selecting destinations, restaurants, and hotels.
- View and modify itineraries shared by other users.
- Visualize travel plans on an interactive map for better time and location management.
- Book accommodations directly without third-party websites.
- Receive real-time notifications and email updates about bookings and travel plans.

#### For Partners
- Register as a partner to list hotels, restaurants, or cafes on the platform.
- Manage bookings and view customer reviews for their services.
- Update service details and availability in real-time.

#### For Admins
- Manage and monitor all user accounts (customers and partners).
- Approve or suspend partner services for compliance with platform standards.
- Oversee system-wide operations and resolve disputes.

#### Additional Features
- Real-time notifications for bookings, updates, and system alerts.
- Email notifications for itinerary changes, booking confirmations, and promotional offers.

## Technologies
- **Frontend:** Vite, ReactJS, HTML, CSS, JavaScript
- **Backend:** Node.js, ExpressJS, MongoDB
- **Other Tools:** Axios (API calls), Map APIs (e.g., Google Maps), Socket.IO (real-time notifications), Nodemailer (email notifications)

## Installation

### Clone the Repository
```bash
git clone https://github.com/your-username/vcompass.git
```

### Navigate to the Project Directory
```bash
cd vcompass
```

### Install Dependencies
For the frontend:
```bash
cd frontend && npm install
```

For the backend:
```bash
cd ../backend && npm install
```

### Environment Variables Setup

#### Backend
Create a `.env` file in the **backend** folder and add the following:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

#### Frontend
Create a `.env` file in the **frontend** folder and add your Map API key:
```env
VITE_MAP_API_KEY=your_map_api_key
```

### Start the Development Server

#### Backend
```bash
cd backend && npm start
```

#### Frontend
```bash
cd frontend && npm run dev
```

### Access the Application
Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Contributing
We welcome contributions from the community! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add a brief description of your changes"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request on GitHub.

## License
This project is licensed under the [MIT License](./LICENSE).
