import { Request, Response } from "express";
import db from "../db.ts";

export const getReviews = (req: Request, res: Response) => {
  try {
    const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

export const createReview = (req: Request, res: Response) => {
  const { user_name, rating, comment } = req.body;

  if (!user_name || !rating || !comment) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const result = db.prepare(
      "INSERT INTO reviews (user_name, rating, comment) VALUES (?, ?, ?)"
    ).run(user_name, rating, comment);

    res.status(201).json({ message: "Review submitted successfully", id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ message: "Error submitting review" });
  }
};
