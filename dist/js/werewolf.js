/**
 * 狼人杀 2.0 游戏模块
 * 源自《现在就出发》综艺节目
 */
const werewolf = {
    // 游戏配置
    config: {
        minPlayers: 3,
        maxPlayers: 12,
        playerCount: 6,
        wolfCount: 2
    },

    // 游戏状态
    state: {
        players: [],        // 玩家身份列表
        currentPlayer: 0,   // 当前查看身份的玩家
        eliminated: 0,      // 已淘汰人数
        isStarted: false
    },

    /**
     * 初始化设置页
     */
    init() {
        this.config.playerCount = 6;
        this.config.wolfCount = 2;
        this.updateUI();
    },

    /**
     * 调整玩家人数
     */
    adjustPlayers(delta) {
        const newCount = this.config.playerCount + delta;
        if (newCount >= this.config.minPlayers && newCount <= this.config.maxPlayers) {
            this.config.playerCount = newCount;
            // 自动调整狼人数量
            this.autoAdjustWolves();
            this.updateUI();
        }
    },

    /**
     * 调整狼人数量
     */
    adjustWolves(delta) {
        const newCount = this.config.wolfCount + delta;
        const maxWolves = Math.floor(this.config.playerCount / 2) - 1;
        if (newCount >= 1 && newCount <= maxWolves) {
            this.config.wolfCount = newCount;
            this.updateUI();
        }
    },

    /**
     * 自动调整狼人数量
     */
    autoAdjustWolves() {
        const recommended = this.getRecommendedWolves();
        // 确保狼人数不超过最大值
        const maxWolves = Math.floor(this.config.playerCount / 2) - 1;
        this.config.wolfCount = Math.min(this.config.wolfCount, maxWolves);
        this.config.wolfCount = Math.max(this.config.wolfCount, 1);
    },

    /**
     * 获取推荐狼人数
     */
    getRecommendedWolves() {
        const p = this.config.playerCount;
        if (p <= 4) return 1;
        if (p <= 7) return 2;
        if (p <= 10) return 3;
        return 4;
    },

    /**
     * 更新界面
     */
    updateUI() {
        document.getElementById('werewolf-player-count').textContent = this.config.playerCount;
        document.getElementById('werewolf-wolf-count').textContent = this.config.wolfCount;

        const sheepCount = this.config.playerCount - this.config.wolfCount;
        const recommended = this.getRecommendedWolves();
        document.getElementById('werewolf-hint').textContent =
            `建议：${this.config.playerCount}人游戏配置${recommended}只狼人，当前${sheepCount}只小羊`;
    },

    /**
     * 开始游戏 - 分配身份
     */
    startGame() {
        // 创建身份数组
        const identities = [];

        // 添加狼人
        for (let i = 0; i < this.config.wolfCount; i++) {
            identities.push({
                role: 'wolf',
                name: '狼人',
                icon: '🐺',
                desc: `你是狼人！共有${this.config.wolfCount}只狼人。\n找到同伴，用"碰杀"或"目击杀"淘汰小羊。`,
                theme: 'wolf'
            });
        }

        // 添加小羊
        const sheepCount = this.config.playerCount - this.config.wolfCount;
        for (let i = 0; i < sheepCount; i++) {
            identities.push({
                role: 'sheep',
                name: '小羊',
                icon: '🐑',
                desc: '你是小羊！请小心狼人。\n观察周围，找出狼人...',
                theme: 'sheep'
            });
        }

        // 随机打乱
        this.state.players = GameData.shuffle(identities);
        this.state.currentPlayer = 0;
        this.state.eliminated = 0;
        this.state.isStarted = true;

        // 显示身份查看页
        app.showIdentityView('werewolf');
    },

    /**
     * 获取当前玩家身份
     */
    getCurrentIdentity() {
        return this.state.players[this.state.currentPlayer];
    },

    /**
     * 开始游戏进行阶段
     */
    startActivePhase() {
        const status = document.getElementById('game-status');
        const actions = document.getElementById('game-actions');

        document.getElementById('active-game-title').textContent = '🐺 狼人杀进行中';

        const sheepCount = this.config.playerCount - this.config.wolfCount;
        const toKill = Math.floor(sheepCount / 2) + 1;

        status.innerHTML = `
            <h2>游戏开始！</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${this.config.wolfCount}</span>
                    <span class="stat-label">🐺 狼人</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${sheepCount}</span>
                    <span class="stat-label">🐑 小羊</span>
                </div>
            </div>
            <div class="rules-reminder">
                <p>🎯 <strong>狼人目标</strong>：淘汰 ${toKill} 只小羊</p>
                <p>⚡ <strong>碰杀</strong>：狼人轻碰目标即淘汰</p>
                <p>👁️ <strong>目击杀</strong>：狼人对视后同时看向目标</p>
                <p>💀 被杀玩家<strong>手指戳脸颊</strong>表示出局</p>
            </div>
        `;

        actions.innerHTML = `
            <button class="danger-btn" onclick="werewolf.endGame('wolves')">
                🐺 狼人获胜
            </button>
            <button class="primary-btn" onclick="werewolf.endGame('sheep')">
                🐑 小羊获胜
            </button>
        `;

        app.showPage('game-active');
    },

    /**
     * 结束游戏
     */
    endGame(winner) {
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const resultStats = document.getElementById('result-stats');

        if (winner === 'wolves') {
            resultIcon.textContent = '🐺';
            resultTitle.textContent = '狼人获胜！';
            resultMessage.textContent = '小羊们全军覆没...';
        } else {
            resultIcon.textContent = '🐑';
            resultTitle.textContent = '小羊获胜！';
            resultMessage.textContent = '成功找出了所有狼人！';
        }

        resultStats.innerHTML = `
            <p><span>游戏人数</span><strong>${this.config.playerCount}人</strong></p>
            <p><span>狼人数量</span><strong>${this.config.wolfCount}只</strong></p>
            <p><span>小羊数量</span><strong>${this.config.playerCount - this.config.wolfCount}只</strong></p>
        `;

        app.currentGame = 'werewolf';
        app.showPage('game-over');
    },

    /**
     * 重新开始
     */
    restart() {
        this.init();
        app.showPage('werewolf-setup');
    }
};

// 初始化
window.werewolf = werewolf;
