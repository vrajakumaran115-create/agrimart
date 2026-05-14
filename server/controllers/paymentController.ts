import { Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import db from "../db.ts";
import { AuthRequest } from "../middleware/auth.ts";

import { LISTING_PRICE } from "../../constants.ts";

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error("CRITICAL: Razorpay keys are missing in process.env");
    return null;
  }

  return new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { listing_id } = req.body;
  const user_id = req.user?.id;

  const razorpay = getRazorpayInstance();

  if (!razorpay) {
    return res.status(500).json({ 
      message: "Razorpay is not configured on the server. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.",
      isConfigError: true
    });
  }

  if (!listing_id) {
    return res.status(400).json({ message: "Listing ID is required" });
  }

  try {
    const listing = db.prepare("SELECT * FROM listings WHERE id = ?").get(listing_id) as any;
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    // In this app, only the seller can promote their listing, but for demo we might allow others or check if it's the seller
    // if (listing.seller_id !== user_id) return res.status(403).json({ message: "Not authorized" });

    // Amount is exactly ₹3 (300 paise)
    const amount = LISTING_PRICE; 
    
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `listing_${listing_id}_${Date.now()}`,
    };

    console.log("Creating Razorpay order with options:", options);

    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created:", order.id);

    // Track the order in payments table
    db.prepare(`
      INSERT INTO payments (user_id, listing_id, amount, order_id, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(user_id, listing_id, amount / 100, order.id);

    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("FULL Razorpay Order Error:", error);
    res.status(500).json({ 
      message: "Could not create Razorpay order", 
      details: error.message || "Unknown error occurred"
    });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listing_id } = req.body;
  const user_id = req.user?.id;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    console.error("Payment verification failed: RAZORPAY_KEY_SECRET is missing.");
    return res.status(500).json({ message: "Razorpay secret is missing on server." });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing required payment verification details" });
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    console.log("Verifying signature for order:", razorpay_order_id);

    if (expectedSignature === razorpay_signature) {
      console.log("Signature verified successfully.");
      // Payment successful
      db.prepare(`
        UPDATE payments 
        SET status = 'completed', payment_id = ? 
        WHERE order_id = ?
      `).run(razorpay_payment_id, razorpay_order_id);

      db.prepare("UPDATE listings SET payment_status = 'paid' WHERE id = ?").run(listing_id);
      db.prepare("UPDATE users SET post_count = post_count + 1 WHERE id = ?").run(user_id);

      res.json({ message: "Payment verified successfully", success: true });
    } else {
      console.error("Invalid signature detected.");
      res.status(400).json({ message: "Invalid signature", success: false });
    }
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ 
      message: "Payment verification failed",
      details: error.message || "Unknown error occurred"
    });
  }
};
