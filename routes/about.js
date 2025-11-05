import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/about", { title: "About — Pig Dice Game" });
});

export default router;
