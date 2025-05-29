const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Step 1: Fetch public Instagram or Facebook page info
exports.fetchPublicInfo = async (req, res) => {
  const { platform, handle } = req.query;

  if (!platform || !handle) {
    return res.status(400).json({ error: "Missing platform or handle" });
  }

  let apiUrl;
  if (platform === "instagram") {
    apiUrl = `https://instagram-data1.p.rapidapi.com/user/info?username=${handle}`;
  } else if (platform === "facebook") {
    apiUrl = `https://facebook-data1.p.rapidapi.com/page/info?username=${handle}`;
  } else {
    return res.status(400).json({ error: "Unsupported platform" });
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": platform === "instagram"
          ? "instagram-data1.p.rapidapi.com"
          : "facebook-data1.p.rapidapi.com",
      },
    });

    const defaultClient = await prisma.client.findFirst();
    if (!defaultClient) {
      return res.status(404).json({ error: "Client not found" });
    }

    const data = response.data.data || response.data;

    const saved = await prisma.socialMediaAccount.upsert({
      where: {
        platform_pageId: {
          platform,
          pageId: data.id || data.username || data.name || handle,
        },
      },
      update: {
        handle: data.username || data.name,
        pageName: data.full_name || data.name,
        followers: data.followers || data.fan_count,
        posts: data.posts,
        profilePicture: data.profile_pic_url || data.picture,
        isConnected: false,
        clientId: defaultClient.id,
      },
      create: {
        platform,
        pageId: data.id || data.username || data.name || handle,
        handle: data.username || data.name,
        pageName: data.full_name || data.name,
        followers: data.followers || data.fan_count,
        posts: data.posts,
        profilePicture: data.profile_pic_url || data.picture,
        isConnected: false,
        permissions: "public_profile",
        clientId: defaultClient.id,
      },
    });

    return res.json(saved);
  } catch (err) {
    console.error("❌ Failed to fetch public info:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch public info" });
  }
};

// Step 2: List connected or fetched social accounts
exports.listAccounts = async (req, res) => {
  try {
    console.log("📦 [listAccounts] Fetching all social media accounts...");

    const accounts = await prisma.socialMediaAccount.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(accounts);
  } catch (err) {
    console.error("❌ [listAccounts] Failed to fetch accounts:", err.message);
    return res.status(500).json({ error: "Failed to list accounts." });
  }
};

// Step 3: Delete a connected social account
exports.deleteAccount = async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ [deleteAccount] Attempting to delete account: ${id}`);

  try {
    await prisma.socialMediaAccount.delete({ where: { id } });
    return res.json({ success: true, message: "Account deleted." });
  } catch (err) {
    console.error(`❌ [deleteAccount] Failed to delete account ${id}:`, err.message);
    return res.status(500).json({ error: "Failed to delete account." });
  }
};

