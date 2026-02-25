export default function getColor(data) {
	if (data == null) return "text-gray-500";
	return data < 0 ? "text-red-600" : "text-green-600";
}
