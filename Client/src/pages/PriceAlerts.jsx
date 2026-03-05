import { useState, useEffect } from "react";
import { alertsAPI } from "../services/api";
import { toast } from "react-toastify";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useCurrency } from "../context/CurrencyContext";
import useTopCoins from "../hooks/useTopCoins";
import Searchbar from "../components/Searchbar";

const PriceAlerts = ({ alerts, setAlerts }) => {
	const [showForm, setShowForm] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedCoin, setSelectedCoin] = useState(null);
	const [targetPrice, setTargetPrice] = useState("");
	const [condition, setCondition] = useState("above");
	const [submitting, setSubmitting] = useState(false);
	const { coins, loading: coinsLoading } = useTopCoins();
	const { formatCurrency } = useCurrency();

	const filteredCoins =
		search.length > 0
			? coins.filter(
					(c) =>
						c.name.toLowerCase().includes(search.toLowerCase()) ||
						c.symbol.toLowerCase().includes(search.toLowerCase())
			  )
			: [];

	const handleSelectCoin = (coin) => {
		setSelectedCoin(coin);
		setSearch("");
		setTargetPrice("");
	};

	const handleAddAlert = async () => {
		if (!selectedCoin) {
			toast.error("Please select a coin.");
			return;
		}
		const price = parseFloat(targetPrice);
		if (!targetPrice || isNaN(price) || price <= 0) {
			toast.error("Please enter a valid target price.");
			return;
		}
		setSubmitting(true);
		try {
			const { alert } = await alertsAPI.add({
				coin_id: selectedCoin.id,
				coin_name: selectedCoin.name,
				coin_image: selectedCoin.image,
				target_price: price,
				condition,
			});
			setAlerts((prev) => [alert, ...prev]);
			toast.success(`Alert set for ${selectedCoin.name}!`);
			setShowForm(false);
			setSelectedCoin(null);
			setTargetPrice("");
			setCondition("above");
		} catch (err) {
			toast.error("Failed to create alert. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id, coinName) => {
		try {
			await alertsAPI.remove(id);
			setAlerts((prev) => prev.filter((a) => a.id !== id));
			toast.info(`Alert for ${coinName} removed.`);
		} catch (err) {
			toast.error("Failed to delete alert.");
		}
	};

	return (
		<div className="bg-slate-100 min-h-screen w-full p-4 sm:p-6 lg:p-8 dark:bg-gray-900 dark:text-white">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2">
						<NotificationsNoneIcon className="text-blue-600" fontSize="large" />
						<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
							Price Alerts
						</h1>
					</div>
					<button
						onClick={() => {
							setShowForm((v) => !v);
							setSelectedCoin(null);
							setSearch("");
							setTargetPrice("");
							setCondition("above");
						}}
						className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
					>
						<AddAlertIcon fontSize="small" />
						New Alert
					</button>
				</div>

				{/* Create Alert Form */}
				{showForm && (
					<div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-6">
						<h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-white">
							Create New Alert
						</h2>

						{/* Coin Search */}
						{!selectedCoin ? (
							<div className="mb-4 relative">
								<label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
									Search Coin
								</label>
								<Searchbar
									searchValue={search}
									setSearchValue={setSearch}
									placeholder="Search Bitcoin, Ethereum..."
								/>
								{search.length > 0 && (
									<div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
										{coinsLoading && (
											<p className="p-3 text-gray-500 text-sm">
												Loading...
											</p>
										)}
										{!coinsLoading && filteredCoins.length === 0 && (
											<p className="p-3 text-gray-500 text-sm">
												No coins found
											</p>
										)}
										{filteredCoins.map((coin) => (
											<div
												key={coin.id}
												onClick={() => handleSelectCoin(coin)}
												className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 transition-all"
											>
												<img
													src={coin.image}
													alt={coin.name}
													className="w-6 h-6 rounded-full"
												/>
												<span className="font-medium text-gray-800 dark:text-white">
													{coin.name}
												</span>
												<span className="text-xs text-gray-400 uppercase">
													{coin.symbol}
												</span>
												<span className="ml-auto text-sm text-gray-600 dark:text-gray-300">
													{formatCurrency(coin.current_price)}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						) : (
							<div className="mb-4 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<img
									src={selectedCoin.image}
									alt={selectedCoin.name}
									className="w-8 h-8 rounded-full"
								/>
								<div>
									<p className="font-semibold text-gray-800 dark:text-white">
										{selectedCoin.name}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Current:{" "}
										{formatCurrency(selectedCoin.current_price)}
									</p>
								</div>
								<button
									onClick={() => setSelectedCoin(null)}
									className="ml-auto text-xs text-blue-600 hover:underline cursor-pointer"
								>
									Change
								</button>
							</div>
						)}

						{/* Condition */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
								Condition
							</label>
							<div className="flex gap-3">
								<button
									onClick={() => setCondition("above")}
									className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
										condition === "above"
											? "bg-green-500 text-white border-green-500"
											: "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400"
									}`}
								>
									↑ Price goes above
								</button>
								<button
									onClick={() => setCondition("below")}
									className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
										condition === "below"
											? "bg-red-500 text-white border-red-500"
											: "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-red-400"
									}`}
								>
									↓ Price goes below
								</button>
							</div>
						</div>

						{/* Target Price */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
								Target Price (USD)
							</label>
							<input
								type="number"
								min="0"
								step="any"
								value={targetPrice}
								onChange={(e) => setTargetPrice(e.target.value)}
								placeholder="e.g. 50000"
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							<button
								onClick={handleAddAlert}
								disabled={submitting}
								className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-60"
							>
								{submitting ? "Saving..." : "Set Alert"}
							</button>
							<button
								onClick={() => setShowForm(false)}
								className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all cursor-pointer"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{/* Alerts List */}
				{alerts.length === 0 ? (
					<div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-12 text-center">
						<NotificationsNoneIcon
							className="text-gray-300 dark:text-gray-600 mb-3"
							sx={{ fontSize: 56 }}
						/>
						<p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
							No alerts set yet
						</p>
						<p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
							Click "New Alert" to get notified when a coin hits your target price.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{alerts.map((alert) => (
							<div
								key={alert.id}
								className="bg-white dark:bg-gray-800 shadow rounded-xl px-5 py-4 flex items-center gap-4"
							>
								{alert.coin_image && (
									<img
										src={alert.coin_image}
										alt={alert.coin_name}
										className="w-10 h-10 rounded-full"
									/>
								)}
								<div className="flex-1">
									<p className="font-semibold text-gray-800 dark:text-white">
										{alert.coin_name}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Alert when price goes{" "}
										<span
											className={`font-semibold ${
												alert.condition === "above"
													? "text-green-500"
													: "text-red-500"
											}`}
										>
											{alert.condition === "above" ? "↑ above" : "↓ below"}
										</span>{" "}
										<span className="font-semibold text-gray-700 dark:text-gray-200">
											${Number(alert.target_price).toLocaleString()}
										</span>
									</p>
								</div>
								<button
									onClick={() => handleDelete(alert.id, alert.coin_name)}
									className="text-gray-400 hover:text-red-500 transition-all cursor-pointer"
									title="Delete alert"
								>
									<DeleteOutlineIcon />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default PriceAlerts;
