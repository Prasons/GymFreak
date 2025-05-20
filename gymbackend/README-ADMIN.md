# Admin System Documentation

This document provides an overview of the admin system implementation in the Gym Management System.

## Features

- **Admin Authentication**: Secure login with JWT tokens
- **Role-Based Access Control (RBAC)**: Different permission levels for admins
- **Admin Management**: CRUD operations for admin users
- **Profile Management**: Update profile and change password
- **Token Refresh**: Secure token refresh mechanism

## Database Schema

### Admins Table

```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  lastLogin TIMESTAMP,
  resetPasswordToken VARCHAR(255),
  resetPasswordExpire TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/refresh-token` - Refresh access token
- `POST /api/admin/change-password` - Change admin password

### Admin Profile

- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile

### Admin Management (Super Admin only)

- `GET /api/admin/admins` - Get all admins
- `POST /api/admin/admins` - Create new admin
- `PUT /api/admin/admins/:id/status` - Update admin status
- `DELETE /api/admin/admins/:id` - Delete admin

## Setup Instructions

1. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Initial Admin**
   ```bash
   # Set the admin credentials in .env first
   npm run create-admin
   ```
   Or use the combined command:
   ```bash
   npm run dev:with-admin
   ```

4. **Start the Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Security Considerations

- Always use HTTPS in production
- Keep your JWT secrets secure and never commit them to version control
- Regularly rotate your JWT secrets
- Implement rate limiting on authentication endpoints
- Keep dependencies up to date
- Use strong passwords for admin accounts

## Testing

To test the admin system, you can use tools like Postman or cURL. Here are some example requests:

### Admin Login
```bash
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "yourpassword"}'
```

### Get Admin Profile
```bash
curl -X GET http://localhost:8080/api/admin/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

- **Issue**: Admin login fails with "Invalid credentials"
  - **Solution**: Verify the email and password are correct. Check if the admin account exists and is active.

- **Issue**: Token validation fails
  - **Solution**: Ensure the JWT_SECRET in your .env file matches the one used to sign the tokens.

- **Issue**: CORS errors
  - **Solution**: Verify the CORS_ORIGIN in your .env file includes your frontend URL.

## License

This project is licensed under the MIT License.
