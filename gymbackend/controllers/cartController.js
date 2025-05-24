import pool from "../config/db.js";

// Add to cart
export const addToCart = async (req, res) => {
  const client = await pool.connect();
  const products = req.body;
  const userId = req.user ? req.user.userId : null; // Handle unauthenticated users

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to add to cart" });
  }
  try {
    await client.query('BEGIN');

    // Insert into cart table and get cart_id
    const cartResult = await client.query(
      `INSERT INTO cart (user_id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING id`,
      [userId]
    );
    const cartId = cartResult.rows[0].id;
      // Prepare cart_items insert values

    if (products.length > 0) {
      for (const product of products) {
        await client.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, created_at, updated_at) VALUES ($1, $2,$3,NOW(),NOW())`,
          [parseInt(cartId), parseInt(product.id),parseInt(product.quantity)]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Cart and items created successfully', cartId });
  } catch (error) {
    await client.query('ROLLBACK');
     console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }

  
  
};

// Get user cart
export const getUserCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.name, p.price
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query("DELETE FROM cart WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};
