import pool from "../config/db.js";
import bcrypt from 'bcryptjs';

// Hash password helper function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password helper function
const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const Admin = {
  /**
   * Find admin by email
   * @param {string} email - Admin's email
   * @returns {Promise<Object>} Admin object or undefined if not found
   */
  async findByEmail(email) {
    try {
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, 
                role, status, last_login, 
                created_at, updated_at
         FROM admins 
         WHERE email = $1`, 
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  },

  /**
   * Find admin by ID
   * @param {number} id - Admin's ID
   * @returns {Promise<Object>} Admin object or undefined if not found
   */
  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, 
                role, status, last_login, 
                created_at, updated_at
         FROM admins 
         WHERE id = $1`, 
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error finding admin by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new admin
   * @param {Object} adminData - Admin data
   * @param {string} adminData.email - Admin's email
   * @param {string} adminData.password - Plain text password
   * @param {string} adminData.first_name - Admin's first name
   * @param {string} adminData.last_name - Admin's last name
   * @returns {Promise<Object>} Created admin object
   */
  async create({ email, password, first_name = null, last_name = null }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const result = await client.query(
        `INSERT INTO admins 
         (email, password, first_name, last_name, status) 
         VALUES ($1, $2, $3, $4, 'active') 
         RETURNING id, email, first_name, last_name, role, status, created_at`,
        [email, hashedPassword, first_name, last_name]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating admin:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Update admin profile
   * @param {number} id - Admin ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated admin object
   */
  async update(id, updates) {
    const { email, first_name, last_name, status } = updates;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `UPDATE admins 
         SET email = COALESCE($1, email),
             first_name = COALESCE($2, first_name),
             last_name = COALESCE($3, last_name),
             status = COALESCE($4, status),
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5 
         RETURNING id, email, first_name, last_name, role, status, last_login, created_at, updated_at`,
        [email, first_name, last_name, status, id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating admin:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Update admin password
   * @param {number} id - Admin ID
   * @param {string} newPassword - New plain text password
   * @returns {Promise<boolean>} True if password was updated
   */
  async updatePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await pool.query(
        'UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, id]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating admin password:', error);
      throw error;
    }
  },

  /**
   * Verify admin credentials
   * @param {string} email - Admin's email
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Admin object if credentials are valid, null otherwise
   */
  async verifyCredentials(email, password) {
    try {
      // First get the admin with password
      const result = await pool.query(
        'SELECT * FROM admins WHERE email = $1',
        [email]
      );
      
      const admin = result.rows[0];
      if (!admin) return null;
      
      const isMatch = await comparePassword(password, admin.password);
      if (isMatch) {
        // Don't return the password hash
        const { password, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw error;
    }
  },

  /**
   * Update last login timestamp
   * @param {number} id - Admin ID
   * @returns {Promise<void>}
   */
  async updateLastLogin(id) {
    try {
      const result = await pool.query(
        'UPDATE admins SET last_login = NOW() WHERE id = $1 RETURNING last_login',
        [id]
      );
      return result.rows[0].last_login;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  },

  /**
   * Delete admin
   * @param {number} id - Admin ID
   * @returns {Promise<boolean>} True if admin was deleted
   */
  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Prevent deleting the last admin
      const adminCount = await client.query('SELECT COUNT(*) FROM admins');
      if (adminCount.rows[0].count <= 1) {
        throw new Error('Cannot delete the last admin');
      }
      
      await client.query('DELETE FROM admins WHERE id = $1', [id]);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting admin:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * List all admins (paginated)
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} { admins, total, page, totalPages }
   */
  async listAdmins(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [result, countResult] = await Promise.all([
        pool.query(
          `SELECT id, email, first_name, last_name, role, status, "lastLogin" as last_login, created_at 
           FROM admins 
           ORDER BY created_at DESC 
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        ),
        pool.query('SELECT COUNT(*) FROM admins')
      ]);
      
      const total = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(total / limit);
      
      return {
        admins: result.rows,
        total,
        page,
        totalPages,
        limit
      };
    } catch (error) {
      console.error('Error listing admins:', error);
      throw error;
    }
  }
};

export default Admin;
