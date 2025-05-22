import pool from "../config/db.js";

class MembershipPlan {
  static async create({ name, description, price, duration_days, features, is_popular = false }) {
    const query = `
      INSERT INTO membership_plans (name, description, price, duration_days, features, is_popular)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, description, price, duration_days, JSON.stringify(features), is_popular];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findAll(activeOnly = true) {
    try {
      let query = 'SELECT * FROM membership_plans';
      const values = [];
      
      if (activeOnly) {
        query += ' WHERE is_active = $1';
        values.push(true);
      }
      
      query += ' ORDER BY price ASC';
      console.log('Executing query:', query, 'with values:', values);
      const { rows } = await pool.query(query, values);
      console.log('Query result:', rows);
      return rows;
    } catch (error) {
      console.error('Error in MembershipPlan.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM membership_plans WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  static async update(id, { name, description, price, duration_days, features, is_active, is_popular }) {
    const query = `
      UPDATE membership_plans
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        duration_days = COALESCE($4, duration_days),
        features = COALESCE($5, features),
        is_active = COALESCE($6, is_active),
        is_popular = COALESCE($7, is_popular, false),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const values = [
      name,
      description,
      price,
      duration_days,
      features ? JSON.stringify(features) : null,
      is_active,
      is_popular,
      id
    ];
    
    const { rows } = await pool.query(query, values);
    return rows[0];
  }


  static async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM membership_plans WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  static async toggleStatus(id) {
    const { rows } = await pool.query(
      'UPDATE membership_plans SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0];
  }
}

export default MembershipPlan;
