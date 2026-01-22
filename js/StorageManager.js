export class StorageManager {
	get(key, defaultValue = null) {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : defaultValue;
	}
	set(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}
}
