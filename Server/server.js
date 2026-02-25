const express = require("express");
require("dotenv").config();
const cors = require("cors");
const supabase = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 3000;
const app = express();

app.use(
	cors({
		origin: process.env.CLIENT || "https://cryptotrack-ultimez.vercel.app",
		credentials: true,
	})
);

app.use(express.json());
const passport = require("./auth");
app.use(passport.initialize());

app.get("/", (req, res) => {
	return res.send("API is running");
});

app.post("/register", async (req, res) => {
	const { username, password } = req.body;
	try {
		// Check if user already exists
		const { data: existing } = await supabase
			.from("users")
			.select("id")
			.eq("username", username)
			.maybeSingle();

		if (existing) {
			return res.status(400).json({ Error: "User Already Exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const { error } = await supabase
			.from("users")
			.insert({ username, password: hashedPassword });

		if (error) throw error;

		return res.status(200).json({ message: "User Registered Successfully" });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

app.post("/login", (req, res, next) => {
	passport.authenticate("local", { session: false }, (err, user, info) => {
		if (err) {
			return res.status(500).json({ error: "Authentication error" });
		}
		if (!user) {
			return res.status(400).json({ error: "Invalid credentials" });
		}

		const payload = { id: user.id, username: user.username };
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "24h",
		});

		res.status(200).json({
			message: "Login successful",
			token: token,
			user: {
				id: user.id,
				username: user.username,
			},
		});
	})(req, res, next);
});

app.get(
	"/watchlist",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		try {
			const userId = req.user.id;

			const { data, error } = await supabase
				.from("watchlist")
				.select("coin")
				.eq("user_id", userId);

			if (error) throw error;

			return res.json({ watchlist: data.map((row) => row.coin) });
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.get(
	"/portfolio",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		try {
			const userId = req.user.id;

			const { data, error } = await supabase
				.from("portfolio")
				.select("coin, total_investment, coins")
				.eq("user_id", userId);

			if (error) throw error;

			// Convert to object map keyed by coin name
			const portfolio = {};
			for (const row of data) {
				portfolio[row.coin] = {
					totalInvestment: row.total_investment,
					coins: row.coins,
				};
			}

			return res.json(portfolio);
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.put(
	"/watchlist/add",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const userId = req.user.id;
		const coin = req.body.coin;
		try {
			const { error } = await supabase
				.from("watchlist")
				.upsert({ user_id: userId, coin }, { onConflict: "user_id,coin" });

			if (error) throw error;

			const { data, error: fetchError } = await supabase
				.from("watchlist")
				.select("coin")
				.eq("user_id", userId);

			if (fetchError) throw fetchError;

			return res.status(200).json({ watchlist: data.map((row) => row.coin) });
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.put(
	"/watchlist/remove",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const userId = req.user.id;
		const coin = req.body.coin;
		try {
			const { error } = await supabase
				.from("watchlist")
				.delete()
				.eq("user_id", userId)
				.eq("coin", coin);

			if (error) throw error;

			const { data, error: fetchError } = await supabase
				.from("watchlist")
				.select("coin")
				.eq("user_id", userId);

			if (fetchError) throw fetchError;

			return res.status(200).json({ watchlist: data.map((row) => row.coin) });
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.put(
	"/portfolio/update",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const userId = req.user.id;
		const { coin, coinData } = req.body;

		try {
			if (
				!coin ||
				!coinData ||
				typeof coinData.totalInvestment !== "number" ||
				typeof coinData.coins !== "number"
			) {
				return res.status(400).json({ error: "Invalid input data" });
			}

			// Get existing coin entry
			const { data: existing } = await supabase
				.from("portfolio")
				.select("*")
				.eq("user_id", userId)
				.eq("coin", coin)
				.maybeSingle();

			if (existing) {
				const newCoins = existing.coins + coinData.coins;

				if (coinData.coins < 0) {
					const sellAmount = Math.abs(coinData.coins);
					if (sellAmount > existing.coins) {
						return res.status(400).json({
							error: `Cannot sell ${sellAmount} coins. You only own ${existing.coins} coins.`,
						});
					}
				}

				if (newCoins <= 0) {
					// Remove coin from portfolio
					const { error } = await supabase
						.from("portfolio")
						.delete()
						.eq("user_id", userId)
						.eq("coin", coin);

					if (error) throw error;
				} else {
					let newTotalInvestment;
					if (coinData.coins < 0) {
						const remainingRatio = newCoins / existing.coins;
						newTotalInvestment = existing.total_investment * remainingRatio;
					} else {
						newTotalInvestment = existing.total_investment + coinData.totalInvestment;
					}

					const { error } = await supabase
						.from("portfolio")
						.update({ coins: newCoins, total_investment: newTotalInvestment })
						.eq("user_id", userId)
						.eq("coin", coin);

					if (error) throw error;
				}
			} else {
				if (coinData.coins < 0) {
					return res.status(400).json({
						error: "Cannot sell coins that are not in your portfolio",
					});
				}
				if (coinData.totalInvestment > 0 && coinData.coins > 0) {
					const { error } = await supabase.from("portfolio").insert({
						user_id: userId,
						coin,
						total_investment: coinData.totalInvestment,
						coins: coinData.coins,
					});

					if (error) throw error;
				}
			}

			// Return updated portfolio
			const { data, error: fetchError } = await supabase
				.from("portfolio")
				.select("coin, total_investment, coins")
				.eq("user_id", userId);

			if (fetchError) throw fetchError;

			const portfolio = {};
			for (const row of data) {
				portfolio[row.coin] = {
					totalInvestment: row.total_investment,
					coins: row.coins,
				};
			}

			return res.status(200).json(portfolio);
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
