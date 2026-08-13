const router = require("express").Router();
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getStores, getAdminStores, getOwners, createStore, getOwnerDashboard
} = require("../controllers/storeController");

router.get("/", authenticateToken, authorizeRoles("user"), getStores);
router.get("/admin", authenticateToken, authorizeRoles("admin"), getAdminStores);
router.get("/owners", authenticateToken, authorizeRoles("admin"), getOwners);
router.post("/", authenticateToken, authorizeRoles("admin"), createStore);
router.get("/owner/dashboard", authenticateToken, authorizeRoles("owner"), getOwnerDashboard);

module.exports = router;
