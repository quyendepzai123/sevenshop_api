import {
  createVoucher,
  deleteVoucher,
  getVoucherById,
  getVouchers,
  updateVoucher,
} from "controllers/voucher";
import { Router } from "express";
import { validateAdmin, validateToken } from "middleware/validate";

const router = Router();

const isAdmin = [validateAdmin];
const isUser = [validateToken];

router.get("/", isAdmin, getVouchers);
router.post("/", isAdmin, createVoucher);
router.get("/:id", isAdmin, getVoucherById);
router.put("/:id", isAdmin, updateVoucher);
router.delete("/:id", isAdmin, deleteVoucher);

export default router;
