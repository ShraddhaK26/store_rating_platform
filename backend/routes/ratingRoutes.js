const router = require("express").Router();
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");
const { submitRating, getMyRatings } = require("../controllers/ratingController");

router.post("/", authenticateToken, authorizeRoles("user"), submitRating);
router.get("/my", authenticateToken, authorizeRoles("user"), getMyRatings);

module.exports = router;
