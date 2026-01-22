export class CBBTGame {
	constructor(storage, container, onBack, sandbox = false) {
		this.storage = storage;
		this.container = container;
		this.onBack = onBack;
		this.sandbox = sandbox;
		this.level = 1;
		this.lives = this.sandbox ? Infinity : 3;
		this.score = 0;
		this.reverse = false;
		this.record = this.storage.get('cbbtRecord', 0);
		this.recordReverse = this.storage.get('cbbtRecordReverse', 0);
		this.gridSize = 3;
		this.sequence = [];
		this.playerSequence = [];
		this.isLocked = false;
		this.init();
	}
	init() {
		this.render();
		this.startRound();
	}
	render() {
		this.container.innerHTML = `
			<button class="back-btn" id="backBtn">&larr;</button>
			<div class="container">
				<div class="header">
					<div class="header-item"><span>Очки</span><strong id="score">${this.score}</strong></div>
					<div class="header-item"><span>Уровень</span><strong id="level">${this.level}</strong></div>
					<div class="header-item"><span>Рекорд</span><strong id="record">${this.reverse ? this.recordReverse : this.record}</strong></div>
				</div>
				<div class="lives" id="lives">${this.renderLives()}</div>
				<div class="mode-toggle">
					<button class="mode-btn ${!this.reverse ? 'active' : ''}" id="normalBtn">Прямой</button>
					<button class="mode-btn ${this.reverse ? 'active' : ''}" id="reverseBtn">Обратный</button>
				</div>
				<p class="message" id="message">Запомните последовательность</p>
				<div class="game-grid" id="grid" style="grid-template-columns: repeat(${this.gridSize}, 1fr); width: min(80vw, 300px);"></div>
			</div>
		`;
		this.grid = document.getElementById('grid');
		this.renderGrid();
		document.getElementById('backBtn').addEventListener('click', () => this.onBack());
		document.getElementById('normalBtn').addEventListener('click', () => this.setMode(false));
		document.getElementById('reverseBtn').addEventListener('click', () => this.setMode(true));
	}
	setMode(reverse) {
		if (this.reverse === reverse) return;
		this.reverse = reverse;
		this.level = 1;
		this.lives = this.sandbox ? Infinity : 3;
		this.score = 0;
		this.gridSize = 3;
		this.render();
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
	getSequenceLength() {
		return Math.min(this.level + 2, this.gridSize * this.gridSize);
	}
	startRound() {
		this.playerSequence = [];
		this.isLocked = true;
		this.clearTiles();
		this.updateMessage('Запомните последовательность');
		this.sequence = this.generateSequence();
		this.showSequence();
	}
	clearTiles() {
		const tiles = this.grid.children;
		Array.from(tiles).forEach(t => t.classList.remove('correct', 'wrong', 'active', 'missed'));
	}
	generateSequence() {
		const total = this.gridSize * this.gridSize;
		const length = this.getSequenceLength();
		const seq = [];
		for (let i = 0; i < length; i++) {
			seq.push(Math.floor(Math.random() * total));
		}
		return seq;
	}
	showSequence() {
		const tiles = this.grid.children;
		let i = 0;
		const showNext = () => {
			if (i > 0) {
				tiles[this.sequence[i - 1]].classList.remove('active');
			}
			if (i < this.sequence.length) {
				setTimeout(() => {
					tiles[this.sequence[i]].classList.add('active');
					i++;
					setTimeout(showNext, 400);
				}, 200);
			} else {
				this.isLocked = false;
				const msg = this.reverse ? 'Повторите в обратном порядке' : 'Повторите последовательность';
				this.updateMessage(msg);
			}
		};
		setTimeout(showNext, 500);
	}
	handleTileClick(index) {
		if (this.isLocked) return;
		const tiles = this.grid.children;
		const expectedSeq = this.reverse ? [...this.sequence].reverse() : this.sequence;
		const expected = expectedSeq[this.playerSequence.length];
		if (index === expected) {
			tiles[index].classList.add('correct');
			setTimeout(() => tiles[index].classList.remove('correct'), 200);
			this.playerSequence.push(index);
			this.score += 10;
			this.updateScore();
			if (this.playerSequence.length === this.sequence.length) {
				this.levelUp();
			}
		} else {
			this.isLocked = true;
			tiles[index].classList.add('wrong');
			this.lives--;
			this.updateLives();
			if (this.lives <= 0) {
				this.gameOver();
			} else {
				this.updateMessage('Неверно! Попробуйте снова');
				setTimeout(() => this.replayRound(), 1000);
			}
		}
	}
	replayRound() {
		this.playerSequence = [];
		this.clearTiles();
		this.updateMessage('Запомните последовательность');
		this.showSequence();
	}
	levelUp() {
		this.isLocked = true;
		this.level++;
		if (this.level > 3 && this.gridSize < 5) {
			this.gridSize++;
			this.renderGrid();
		}
		this.updateLevel();
		this.updateRecord();
		setTimeout(() => this.startRound(), 500);
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
	gameOver() {
		this.updateRecord();
		this.updateMessage('Игра окончена!');
		setTimeout(() => {
			this.level = 1;
			this.lives = this.sandbox ? Infinity : 3;
			this.score = 0;
			this.gridSize = 3;
			this.render();
			this.startRound();
		}, 2000);
	}
	updateMessage(text) {
		document.getElementById('message').textContent = text;
	}
	updateRecord() {
		const key = this.reverse ? 'cbbtRecordReverse' : 'cbbtRecord';
		const currentRecord = this.reverse ? this.recordReverse : this.record;
		if (this.score > currentRecord) {
			if (this.reverse) {
				this.recordReverse = this.score;
			} else {
				this.record = this.score;
			}
			this.storage.set(key, this.score);
			document.getElementById('record').textContent = this.score;
		}
	}
}
