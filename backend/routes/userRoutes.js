const router = require("express").Router();
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { changePassword, getStats, getUsers, createUser } = require("../controllers/userController");

router.put("/change-password", authenticateToken, changePassword);
router.get("/stats", authenticateToken, authorizeRoles("admin"), getStats);
router.get("/", authenticateToken, authorizeRoles("admin"), getUsers);
router.post("/", authenticateToken, authorizeRoles("admin"), createUser);

module.exports = router;
