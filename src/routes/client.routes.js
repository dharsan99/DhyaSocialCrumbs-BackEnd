const express = require("express");
const router = express.Router();
const {
  createClient,
  listClients,
  startOnboarding,
  updateClientSetting,
} = require("../controllers/client.controller");

// POST /clients
router.post("/", createClient);

// GET /clients
router.get("/", listClients);

// PATCH /clients/:id/settings
router.patch("/:id/settings", updateClientSetting);

// POST /clients/:id/start-onboarding
router.post("/:id/start-onboarding", startOnboarding);

module.exports = router;