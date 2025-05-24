import express from 'express';
import axios from 'axios';
import { protect } from '../middlewares/authMiddleware.js';
import dotenv from "dotenv";

dotenv.config();
import { verifyPayment } from '../scripts/paymentGetway-service.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/verifyPayment', async (req, res) => {
  const { token, amount } = req.body;

  try {
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      {
        token,
        amount,
      },
      {
        headers: {
          Authorization: process.env.KHALTI_SECRET_KEY, // Replace with your actual secret key
        },
      }
    );

    if (response.data.state.name === 'Completed') {
      // Payment successful
      res.json({ success: true, data: response.data });
    } else {
      // Payment not successful
      res.json({ success: false, data: response.data });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

router.post('/epayment', async (req, res) => {
    const { amount, name, email} = req.body;

     const body = {
        return_url: "http://localhost:5174/dashboard?redirect=cart",
        website_url: "http://localhost:5174/",
        amount: amount,
        purchase_order_id: "Ordwer01",
        purchase_order_name: "Test",
        customer_info: {
        name: name,
        email: email,
        phone: process.env.KHALTI_PHONE_NO
        }
    };
    try {
        const response = await axios.post(process.env.KHALTI_EPAYMENT, body, {
        headers: {
            'Authorization': process.env.KHALTI_SECRET_KEY,
            'Content-Type': 'application/json'
        }
    });

    res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
})

export default router;
