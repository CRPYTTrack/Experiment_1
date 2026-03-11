import React, { useState, useEffect, useRef } from "react";
import {
	Routes,
	Route,
	useLocation,
	Navigate,
	useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Watchlist from "./pages/Watchlist";
import PriceAlerts from "./pages/PriceAlerts";
import { AnimatePresence } from "motion/react";
import { useAuth } from "./context/AuthContext";
import { portfolioAPI, watchlistAPI, alertsAPI } from "./services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
	const [menu, setMenu] = useState(false);
	const { isAuthenticated, loading, logout } = useAuth();
	const [watchlist, setWatchlist] = useState([]);
	const [form, setForm] = useState(false);
	const [coinData, setCoinData] = useState({});
	const [portfolio, setPortfolio] = useState({});
	const [alerts, setAlerts] = useState([]);
	const alertsRef = useRef(alerts);
	const navigate = useNavigate();

	const handleLogout = () => {
		setWatchlist([]);
		setPortfolio({});
		setAlerts([]);
		logout();
		toast.success("Logged out successfully", {
			position: "top-right",
			autoClose: 3000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: true,
		});
		navigate("/");
	};

	useEffect(() => {
		if (isAuthenticated) {
			loadUserData();
		} else {
			setWatchlist([]);
			setPortfolio({});
			setAlerts([]);
		}
	}, [isAuthenticated]);

	const loadUserData = async () => {
		try {
			const [portfolioData, watchlistData, alertsData] = await Promise.all([
			portfolioAPI.get(),
			watchlistAPI.get(),
			 alertsAPI.get(),
			]);
			setPortfolio(portfolioData);
		setWatchlist(watchlistData.watchlist);
		setAlerts(alertsData.alerts || []);
		} catch (error) {
			console.error("Failed to load user data:", error);
		}
	};

	// Keep alertsRef in sync with the latest alerts state
	useEffect(() => {
		alertsRef.current = alerts;
	}, [alerts]);

	// Price alert checker — runs every 60 seconds when user is logged in
	useEffect(() => {
		if (!isAuthenticated) return;

		const checkAlerts = async () => {
			const currentAlerts = alertsRef.current;
			if (currentAlerts.length === 0) return;
			try {
				const coinIds = [...new Set(currentAlerts.map((a) => a.coin_id))].join(",");
				const res = await fetch(
					`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`
				);
				if (!res.ok) return;
				const coins = await res.json();

				const triggeredIds = [];
				currentAlerts.forEach((alert) => {
					const coin = coins.find((c) => c.id === alert.coin_id);
					if (!coin) return;
					const currentPrice = coin.current_price;
					const triggered =
						(alert.condition === "above" && currentPrice >= alert.target_price) ||
						(alert.condition === "below" && currentPrice <= alert.target_price);

					if (triggered) {
						toast.success(
							`🔔 ${alert.coin_name} is now ${currentPrice.toLocaleString()} — ${alert.condition === "above" ? "above" : "below"} your target of ${Number(alert.target_price).toLocaleString()}!`,
							{ autoClose: 6000 }
						);
						triggeredIds.push(alert.id);
					}
				});

				// Remove triggered alerts
				if (triggeredIds.length > 0) {
					await Promise.all(triggeredIds.map((id) => alertsAPI.remove(id)));
					const updated = currentAlerts.filter((a) => !triggeredIds.includes(a.id));
					alertsRef.current = updated;
					setAlerts(updated);
				}
			} catch (err) {
				console.error("Alert check failed:", err);
			}
		};

		checkAlerts();
		const interval = setInterval(checkAlerts, 60000);
		return () => clearInterval(interval);
	}, [isAuthenticated]);

	function toggleForm(coin = null) {
		if (coin) {
			setCoinData(coin);
		} else {
			setCoinData({});
		}
		setForm((form) => !form);
	}

	async function addCoin(id, totalInvestment, coins) {
		try {
			const coinData = {
				totalInvestment: parseFloat(totalInvestment),
				coins: parseFloat(coins),
			};
			const updatedPortfolio = await portfolioAPI.update(id, coinData);
			setPortfolio(updatedPortfolio);
			toggleForm();
			toast.success("Portfolio updated successfully.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
			});
		} catch (error) {
			console.error("Failed to add coin:", error);
		}
	}

	async function removeCoin(id, totalInvestment, coins) {
		try {
			const coinData = {
				totalInvestment: -parseFloat(totalInvestment),
				coins: -parseFloat(coins),
			};
			const updatedPortfolio = await portfolioAPI.update(id, coinData);
			setPortfolio(updatedPortfolio);
			toggleForm();
			toast.success("Portfolio updated successfully.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: false,
				draggable: true,
			});
		} catch (error) {
			console.error("Failed to remove coin:", error);
		}
	}

	const location = useLocation();

	useEffect(() => {
		setMenu(false);
	}, [location]);

	function toggleMenu() {
		setMenu((menu) => !menu);
	}

	async function toggleWatchlist(coinId, coinName = null) {
		try {
			if (!watchlist.includes(coinId)) {
				const response = await watchlistAPI.add(coinId);
				setWatchlist(response.watchlist);
				toast.success(`${coinName || "Coin"} was added to watchlist`, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
				});
			} else {
				const response = await watchlistAPI.remove(coinId);
				setWatchlist(response.watchlist);
				toast.info(`${coinName || "Coin"} was removed from watchlist`, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
				});
			}
		} catch (error) {
			console.error("Failed to update watchlist:", error);
			toast.error("Failed to update watchlist. Please try again.", {
				position: "top-right",
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
			});
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				Loading...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
			<Header
				menu={menu}
				toggleMenu={toggleMenu}
				handleLogout={handleLogout}
			/>

			<AnimatePresence>
				{menu && <Menu handleLogout={handleLogout} />}
			</AnimatePresence>
			<Routes>
				<Route
					path="/"
					element={
						<Home
							watchlist={watchlist}
							toggleWatchlist={toggleWatchlist}
							addCoin={addCoin}
							form={form}
							toggleForm={toggleForm}
							coinData={coinData}
						/>
					}
				/>
				<Route
					path="/dashboard"
					element={
						isAuthenticated ? (
							<Dashboard
								watchlist={watchlist}
								toggleWatchlist={toggleWatchlist}
								portfolio={portfolio}
								addCoin={addCoin}
								form={form}
								toggleForm={toggleForm}
								coinData={coinData}
								removeCoin={removeCoin}
							/>
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/watchlist"
					element={
						isAuthenticated ? (
							<Watchlist
								watchlist={watchlist}
								toggleForm={toggleForm}
								toggleWatchlist={toggleWatchlist}
								addCoin={addCoin}
								form={form}
								coinData={coinData}
							/>
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/alerts"
					element={
						isAuthenticated ? (
							<PriceAlerts alerts={alerts} setAlerts={setAlerts} />
						) : (
							<Navigate to="/login" />
						)
					}
				/>
				<Route
					path="/login"
					element={
						isAuthenticated ? (
							<Navigate to="/dashboard" />
						) : (
							<Login toggleForm={toggleForm} form={form} />
						)
					}
				/>
				<Route
					path="/signup"
					element={
						isAuthenticated ? (
							<Navigate to="/dashboard" />
						) : (
							<SignUp />
						)
					}
				/>
			</Routes>
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				draggable
				theme="light"
			/>
		</div>
	);
};

export default App;
