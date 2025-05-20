import pool from "../config/db.js";

// Add to cart
export const addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user ? req.user.userId : null; // Handle unauthenticated users

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to add to cart" });
  }

  try {
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, product_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3",
        [quantity, userId, product_id]
      );
    } else {
      await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [userId, product_id, quantity]
      );
    }

    res.status(200).json({ message: "Product added to cart" });
  } catch (err) {
    // Enhanced error logging for debugging
    console.error("Add to cart error:", err, "Payload:", { userId, product_id, quantity });
    res.status(500).json({ message: "Server error", error: err.message });
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
