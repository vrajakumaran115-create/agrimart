import { Request, Response } from "express";
import db from "../db.ts";

export const getAdminStats = (req: Request, res: Response) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const totalListings = db.prepare("SELECT COUNT(*) as count FROM listings").get() as any;
    const freeListings = db.prepare("SELECT COUNT(*) as count FROM listings WHERE payment_status = 'free'").get() as any;
    const paidListings = db.prepare("SELECT COUNT(*) as count FROM listings WHERE payment_status = 'paid'").get() as any;
    const pendingListings = db.prepare("SELECT COUNT(*) as count FROM listings WHERE payment_status = 'pending'").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'completed'").get() as any;

    res.json({
      totalUsers: totalUsers.count,
      totalListings: totalListings.count,
      freeListings: freeListings.count,
      paidListings: paidListings.count,
      pendingListings: pendingListings.count,
      totalRevenue: totalRevenue ? totalRevenue.sum : 0
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

export const getAllListings = (req: Request, res: Response) => {
  try {
    const listings = db.prepare(`
      SELECT l.*, u.name as seller_name, c.name as category_name
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      JOIN categories c ON l.category_id = c.id
      ORDER BY l.created_at DESC
    `).all();
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all listings" });
  }
};

export const setListingStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'free', 'paid', 'pending'

  try {
    db.prepare("UPDATE listings SET payment_status = ? WHERE id = ?").run(status, id);
    res.json({ message: `Listing status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to update listing status" });
  }
};

export const getAllUsers = (req: Request, res: Response) => {
  try {
    const users = db.prepare("SELECT id, name, email, phone, role, location, created_at FROM users").all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
