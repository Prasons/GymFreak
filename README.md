# Gym Management System

A comprehensive gym management system built with React, Node.js, Express, and MySQL. This application provides features for both gym administrators and members, including class scheduling, membership management, product inventory, and more.

## Features

- **User Authentication**: Secure login and registration for members and administrators
- **Class Management**: Schedule and manage gym classes
- **Product Management**: Add, edit, and remove gym products
- **Membership Plans**: Manage different membership tiers and subscriptions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL Server

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gym-management-system.git
   cd gym-management-system
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install backend dependencies
   cd gymbackend
   npm install
   
   # Install frontend dependencies
   cd ../GymFreak
   npm install
   ```

3. Set up the database:
   - Create a MySQL database
   - Import the database schema from `gymbackend/database/schema.sql`

4. Configure environment variables:
   - Copy `.env.example` to `.env` in both `gymbackend` and `GymFreak` directories
   - Update the configuration values as needed

5. Start the development servers:
   ```bash
   # Start backend server
   cd gymbackend
   npm run dev
   
   # In a new terminal, start frontend
   cd ../GymFreak
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
gym-management-system/
├── gymbackend/           # Backend server code
│   ├── config/           # Database and other configurations
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads
│   └── server.js         # Main server file
│
├── GymFreak/            # Frontend React application
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── api/          # API service functions
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       └── App.jsx       # Main application component
│
├── .gitignore           # Git ignore file
└── README.md            # Project documentation
```

## API Documentation

For detailed API documentation, please refer to [API_DOCUMENTATION.md](gymbackend/API_DOCUMENTATION.md) in the backend directory.

## Contributing

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Tailwind CSS](https://tailwindcss.com/)
