import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("pages/support", { success: false, error: false });
});

export default router;
