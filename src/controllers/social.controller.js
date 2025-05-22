const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const redirectUri = process.env.FB_REDIRECT_URI;
const appId = process.env.FB_APP_ID;
const appSecret = process.env.FB_APP_SECRET;

// Step 1: Initiate Facebook OAuth
exports.connectFacebook = (req, res) => {
  console.log("🔗 [connectFacebook] Initiating Facebook OAuth...");

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_manage_insights`;

  console.log(`🔍 [connectFacebook] Redirecting user to: ${authUrl}`);
  return res.redirect(authUrl);
};

// Step 2: Handle Facebook OAuth callback
exports.facebookCallback = async (req, res) => {
  const { code } = req.query;
  console.log("📥 [facebookCallback] Received callback with code:", code);

  if (!code) {
    console.warn("⚠️ [facebookCallback] Missing `code` query param.");
    return res.redirect("http://localhost:5173/settings?error=missing_code");
  }

  try {
    console.log("🔄 [facebookCallback] Exchanging code for access token...");

    const tokenRes = await axios.get("https://graph.facebook.com/v18.0/oauth/access_token", {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      },
    });

    const accessToken = tokenRes.data.access_token;
    const expiresIn = tokenRes.data.expires_in;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    if (expiresAt) {
      console.log(`✅ Access token received, expires at ${expiresAt.toISOString()}`);
    } else {
      console.warn("⚠️ No expires_in value found.");
    }

    const defaultClient = await prisma.client.findFirst();
    if (!defaultClient) {
      console.error("❌ No client found to associate accounts with.");
      return res.redirect("http://localhost:5173/settings?error=no_client");
    }

    console.log("📡 Fetching Facebook Pages...");
    const pagesRes = await axios.get("https://graph.facebook.com/v18.0/me/accounts", {
      params: { access_token: accessToken },
    });

    const pages = pagesRes.data.data;
    console.log(`📄 Retrieved ${pages.length} pages.`);

    for (const page of pages) {
      console.log(`📝 Saving Facebook Page: ${page.name} (${page.id})`);

      // ✅ Upsert Facebook Page using platform_pageId
      await prisma.socialMediaAccount.upsert({
        where: {
          platform_pageId: {
            platform: "facebook",
            pageId: page.id,
          },
        },
        update: {
          accessToken: page.access_token,
          pageName: page.name,
          isConnected: true,
          clientId: defaultClient.id,
          ...(expiresAt && { expiresAt }),
        },
        create: {
          platform: "facebook",
          handle: page.name,
          pageId: page.id,
          pageName: page.name,
          accessToken: page.access_token,
          permissions: (page.perms || []).join(","),
          isConnected: true,
          clientId: defaultClient.id,
          ...(expiresAt && { expiresAt }),
        },
      });

      // 🔁 Try linking Instagram business account if present
      try {
        const igRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
          params: {
            fields: "instagram_business_account",
            access_token: page.access_token,
          },
        });

        const igBusiness = igRes.data.instagram_business_account;
        if (igBusiness?.id) {
          console.log(`📷 Instagram found: ${igBusiness.id}`);

          const igDetails = await axios.get(`https://graph.facebook.com/v18.0/${igBusiness.id}`, {
            params: {
              fields: "username,profile_picture_url",
              access_token: page.access_token,
            },
          });

          const igData = igDetails.data;

          await prisma.socialMediaAccount.upsert({
            where: {
              platform_pageId: {
                platform: "instagram",
                pageId: igBusiness.id,
              },
            },
            update: {
              handle: igData.username,
              accessToken: page.access_token,
              isConnected: true,
              clientId: defaultClient.id,
              ...(expiresAt && { expiresAt }),
            },
            create: {
              platform: "instagram",
              handle: igData.username,
              pageId: igBusiness.id,
              pageName: igData.username,
              accessToken: page.access_token,
              permissions: "instagram_basic",
              isConnected: true,
              clientId: defaultClient.id,
              ...(expiresAt && { expiresAt }),
            },
          });

          console.log(`✅ Instagram @${igData.username} saved.`);
        }
      } catch (igErr) {
        console.warn(`⚠️ No IG account linked to ${page.name}: ${igErr.response?.data?.error?.message || igErr.message}`);
      }
    }

    console.log("✅ All pages/accounts processed.");
    return res.redirect("http://localhost:5173/settings?connected=facebook");
  } catch (err) {
    console.error("❌ Facebook callback failed:", err.response?.data || err.message);
    return res.redirect("http://localhost:5173/settings?error=facebook");
  }
};

// Step 3: List connected social accounts
exports.listAccounts = async (req, res) => {
  try {
    console.log("📦 [listAccounts] Fetching all connected social media accounts...");

    const accounts = await prisma.socialMediaAccount.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`✅ [listAccounts] Retrieved ${accounts.length} accounts.`);
    return res.json(accounts);
  } catch (err) {
    console.error("❌ [listAccounts] Failed to fetch accounts:", err.message);
    return res.status(500).json({ error: "Failed to list accounts." });
  }
};

// Step 4: Delete a connected social account
exports.deleteAccount = async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ [deleteAccount] Attempting to delete account: ${id}`);

  try {
    await prisma.socialMediaAccount.delete({
      where: { id },
    });

    console.log(`✅ [deleteAccount] Account ${id} removed.`);
    return res.json({ success: true, message: "Account deleted." });
  } catch (err) {
    console.error(`❌ [deleteAccount] Failed to delete account ${id}:`, err.message);
    return res.status(500).json({ error: "Failed to delete account." });
  }
};