import express from "express";
import { createUser } from "../database/models/User.js";
import { createUserSubscription } from "../database/models/UserSubscription.js";
import { auth } from "../middlewares/auth.js";

export const webhook = express.Router();

webhook.post("/clerk/registered", async (req, res) => {
	const userData = req.body.data;
	const email = userData.email_addresses?.[0]?.email_address;
	const username = userData.username || email;
	const fullName = `${userData.first_name} ${userData.last_name}`;
	const clerkId = userData.id;

	const user = await createUser({
		username,
		email,
		fullName,
		clerkId,
		metaMaskWalletAddress: "", // Placeholder, should be set after wallet setup
		status: "active", // Default status
		lastLoginAt: new Date(), // Set to current time
	});
	console.log("User registered:", user);
	res.status(200).json({ message: "User registration received" });
});

webhook.post("/payments/web3", auth, async (req, res) => {
	const txnId = req.body.transactionId;
	const userId = req.userId;
	const subscriptionPlan = req.body.subscriptionPlan;
	const quotaLimit = req.body.quotaLimit || 1000; // Default quota limit if not provided

	if (!txnId || !userId || !subscriptionPlan) {
		res.status(400).json({ error: "Missing required fields" });
		return;
	}
	const subscription = await createUserSubscription({
		clerkUserId: userId,
		plan: subscriptionPlan,
		quotaLimit,
		renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set renewsAt to 30 days from now
	});

	console.log("User subscription updated:", subscription);
	res.status(200).json({ message: "User subscription update received" });
});

webhook.post("/user/deleted", (req, res) => {
	// Handle user deletion webhook
	console.log("User deleted:", req.body);
	res.status(200).send("User deletion received");
});
