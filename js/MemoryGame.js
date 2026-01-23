export class MemoryGame {
	constructor(storage, container, onBack, sandbox = false) {
		this.storage = storage;
		this.container = container;
		this.onBack = onBack;
		this.sandbox = sandbox;
		this.level = 1;
		this.lives = this.sandbox ? Infinity : 3;
		this.score = 0;
		this.record = this.storage.get('memoryRecord', 0);
		this.gridSize = 3;
		this.activeTiles = [];
		this.selectedTiles = [];
		this.isLocked = false;
		this.timers = [];
		this.init();
	}
	init() {
		this.render();
		this.startRound();
	}
	render() {
		this.container.innerHTML = `
			<button class="back-btn" id="backBtn">&larr;</button>
			${this.sandbox ? '<button class="skip-btn" id="skipBtn">Пропустить</button>' : ''}
			<div class="container">
				<div class="header">
					<div class="header-item"><span>Очки</span><strong id="score">${this.score}</strong></div>
					<div class="header-item"><span>Уровень</span><strong id="level">${this.level}</strong></div>
					<div class="header-item"><span>Рекорд</span><strong id="record">${this.record}</strong></div>
				</div>
				<div class="lives" id="lives">${this.renderLives()}</div>
				<p class="message" id="message">Запомните плитки</p>
				<div class="game-grid" id="grid" style="grid-template-columns: repeat(${this.gridSize}, 1fr); width: min(80vw, 300px);"></div>
			</div>
		`;
		this.grid = document.getElementById('grid');
		this.renderGrid();
		document.getElementById('backBtn').addEventListener('click', () => this.onBack());
		if (this.sandbox) document.getElementById('skipBtn').addEventListener('click', () => this.skipLevel());
	}
	clearTimers() {
		this.timers.forEach(t => clearTimeout(t));
		this.timers = [];
	}
	addTimer(fn, ms) {
		this.timers.push(setTimeout(fn, ms));
	}
	skipLevel() {
		this.clearTimers();
		this.isLocked = true;
		this.level++;
		const total = this.gridSize * this.gridSize;
		if (this.getActiveTilesCount() >= Math.floor(total * 0.5) && this.gridSize < 9) {
			this.gridSize++;
			this.renderGrid();
		}
		this.updateLevel();
		this.startRound();
	}
	renderLives() {
		if (this.sandbox) return '<div class="life"></div><span style="margin-left:0.5rem">∞</span>';
		return Array(3).fill(0).map((_, i) => `<div class="life ${i >= this.lives ? 'lost' : ''}"></div>`).join('');
	}
	renderGrid() {
		this.grid.innerHTML = '';
		this.grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
		const total = this.gridSize * this.gridSize;
		for (let i = 0; i < total; i++) {
			const tile = document.createElement('div');
			tile.className = 'tile';
			tile.dataset.index = i;
			tile.addEventListener('click', () => this.handleTileClick(i));
			this.grid.appendChild(tile);
		}
	}
	getActiveTilesCount() {
		const total = this.gridSize * this.gridSize;
		return Math.min(this.level + 2, Math.floor(total * 0.5));
	}
	startRound() {
		this.selectedTiles = [];
		this.isLocked = true;
		this.clearTiles();
		this.updateMessage('Запомните плитки');
		this.activeTiles = this.generatePattern();
		this.showPattern();
	}
	clearTiles() {
		const tiles = this.grid.children;
		Array.from(tiles).forEach(t => t.classList.remove('correct', 'wrong', 'active', 'missed'));
	}
	showMissedTiles() {
		const tiles = this.grid.children;
		this.activeTiles.forEach(i => {
			if (!this.selectedTiles.includes(i)) {
				tiles[i].classList.add('missed');
			}
		});
	}
	generatePattern() {
		const total = this.gridSize * this.gridSize;
		const count = this.getActiveTilesCount();
		const indices = [];
		while (indices.length < count) {
			const r = Math.floor(Math.random() * total);
			if (!indices.includes(r)) indices.push(r);
		}
		return indices;
	}
	showPattern() {
		const tiles = this.grid.children;
		this.activeTiles.forEach(i => tiles[i].classList.add('active'));
		this.addTimer(() => {
			this.activeTiles.forEach(i => tiles[i].classList.remove('active'));
			this.isLocked = false;
			this.updateMessage('Выберите плитки');
		}, 1000 + this.level * 200);
	}
	handleTileClick(index) {
		if (this.isLocked) return;
		if (this.selectedTiles.includes(index)) return;
		const tiles = this.grid.children;
		if (this.activeTiles.includes(index)) {
			tiles[index].classList.add('correct');
			this.selectedTiles.push(index);
			this.score += 10;
			this.updateScore();
			if (this.selectedTiles.length === this.activeTiles.length) {
				this.levelUp();
			}
		} else {
			this.isLocked = true;
			tiles[index].classList.add('wrong');
			this.showMissedTiles();
			this.lives--;
			this.updateLives();
			if (this.lives <= 0) {
				this.gameOver();
			} else {
				this.level = Math.max(1, this.level - 1);
				this.updateLevel();
				this.addTimer(() => this.startRound(), 1000);
			}
		}
	}
	levelUp() {
		this.isLocked = true;
		this.level++;
		const total = this.gridSize * this.gridSize;
		if (this.getActiveTilesCount() >= Math.floor(total * 0.5) && this.gridSize < 9) {
			this.gridSize++;
			this.renderGrid();
		}
		this.updateLevel();
		this.updateRecord();
		this.addTimer(() => this.startRound(), 500);
	}
	gameOver() {
		this.updateRecord();
		this.updateMessage('Игра окончена!');
		this.addTimer(() => {
			this.level = 1;
			this.lives = this.sandbox ? Infinity : 3;
			this.score = 0;
			this.gridSize = 3;
			this.render();
			this.startRound();
		}, 2000);
	}
	updateScore() {
		document.getElementById('score').textContent = this.score;
	}
	updateLevel() {
		document.getElementById('level').textContent = this.level;
	}
	updateLives() {
		document.getElementById('lives').innerHTML = this.renderLives();
	}
	updateMessage(text) {
		document.getElementById('message').textContent = text;
	}
	updateRecord() {
		if (this.score > this.record) {
			this.record = this.score;
			this.storage.set('memoryRecord', this.record);
			document.getElementById('record').textContent = this.record;
		}
	}
}
