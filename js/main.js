import { StorageManager } from './StorageManager.js';
import { MemoryGame } from './MemoryGame.js';
import { MemoryRotateGame } from './MemoryRotateGame.js';
import { StroopTest } from './StroopTest.js';
import { CBBTGame } from './CBBTGame.js';
import { SchulteTable } from './SchulteTable.js';
import { AngleSumGame } from './AngleSumGame.js';
class App {
	constructor() {
		this.storage = new StorageManager();
		this.container = document.getElementById('app');
		this.sandbox = this.storage.get('sandbox', false);
		this.currentGame = null;
		const game = new URLSearchParams(location.search).get('game');
		if (game) this.startGame(game);
		else this.showMenu();
		window.addEventListener('popstate', () => {
			const game = new URLSearchParams(location.search).get('game');
			if (game) this.startGame(game);
			else this.showMenu();
		});
	}
	showMenu() {
		history.pushState(null, '', location.pathname);
		this.container.innerHTML = `
			<button class="sandbox-btn ${this.sandbox ? 'active' : ''}" id="sandboxBtn">Sandbox: ${this.sandbox ? 'ВКЛ' : 'ВЫКЛ'}</button>
			<div class="container">
				<h1 style="text-align: center; padding: 2rem 0;">Когнитивные тренировки</h1>
				<div class="menu">
					<button class="menu-btn" data-game="memory">Игра на память</button>
					<button class="menu-btn" data-game="memoryRotate">Память с вращением</button>
					<button class="menu-btn" data-game="cbbt">Блоки Корси</button>
					<button class="menu-btn" data-game="schulte">Таблица Шульте</button>
					<button class="menu-btn" data-game="stroop">Тест Струпа</button>
					<button class="menu-btn" data-game="anglesum">Углосумм</button>
				</div>
			</div>
		`;
		document.getElementById('sandboxBtn').addEventListener('click', () => this.toggleSandbox());
		this.container.addEventListener('click', (e) => {
			const btn = e.target.closest('[data-game]');
			if (btn) this.startGame(btn.dataset.game);
		});
	}
	toggleSandbox() {
		this.sandbox = !this.sandbox;
		this.storage.set('sandbox', this.sandbox);
		this.showMenu();
	}
	startGame(type) {
		history.pushState(null, '', `?game=${type}`);
		const onBack = () => this.showMenu();
		switch (type) {
			case 'memory':
				this.currentGame = new MemoryGame(this.storage, this.container, onBack, this.sandbox);
				break;
			case 'memoryRotate':
				this.currentGame = new MemoryRotateGame(this.storage, this.container, onBack, this.sandbox);
				break;
			case 'cbbt':
				this.currentGame = new CBBTGame(this.storage, this.container, onBack, this.sandbox);
				break;
			case 'schulte':
				this.currentGame = new SchulteTable(this.storage, this.container, onBack);
				break;
			case 'stroop':
				this.currentGame = new StroopTest(this.storage, this.container, onBack);
				break;
			case 'anglesum':
				this.currentGame = new AngleSumGame(this.storage, this.container, onBack);
				break;
		}
	}
}
new App();
