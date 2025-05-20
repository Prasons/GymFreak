# Gym Management System API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile

### Admin
- `GET /api/admin` - List all admins (super_admin only)
- `POST /api/admin` - Create new admin (super_admin only)
- `GET /api/admin/me` - Get current admin profile
- `PUT /api/admin/me` - Update current admin profile
- `PUT /api/admin/me/change-password` - Change admin password
- `PUT /api/admin/:id/status` - Update admin status (super_admin only)
- `DELETE /api/admin/:id` - Delete admin (super_admin only)

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `PATCH /api/users/:id/status` - Change user status (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/profile/me` - Get current user profile
- `PUT /api/users/profile/me` - Update current user profile

### Workout Plans
- `GET /api/workout-plans` - Get all workout plans
- `POST /api/workout-plans` - Create new workout plan (admin only)
- `PUT /api/workout-plans/:id` - Update workout plan (admin only)
- `DELETE /api/workout-plans/:id` - Delete workout plan (admin only)
- `GET /api/workout-plans/user/selections` - Get user's selected workout plans
- `POST /api/workout-plans/user/selections` - Set user's workout plans
- `DELETE /api/workout-plans/user/selections` - Remove all workout plans from user's selection
- `DELETE /api/workout-plans/user/selections/:workoutplan_id` - Remove specific workout plan from user's selection

### Training Schedules
- `GET /api/training-schedules` - Get all training schedules
- `POST /api/training-schedules` - Create new training schedule (admin only)
- `PUT /api/training-schedules/:id` - Update training schedule (admin only)
- `DELETE /api/training-schedules/:id` - Delete training schedule (admin only)
- `GET /api/training-schedules/user/enrollments` - Get user's enrolled schedules
- `POST /api/training-schedules/user/enrollments` - Enroll user in schedules
- `DELETE /api/training-schedules/user/enrollments` - Unenroll from all schedules
- `DELETE /api/training-schedules/user/enrollments/:schedule_id` - Unenroll from specific schedule

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `DELETE /api/cart/items/:id` - Remove item from cart

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized as admin"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```
