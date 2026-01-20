/**
 * 谁是卧底游戏模块
 */
const undercover = {
    // 游戏配置
    config: {
        minPlayers: 3,
        maxPlayers: 15,
        playerCount: 6,
        spyCount: 1,
        hasBlank: false
    },

    // 游戏状态
    state: {
        players: [],         // 玩家信息列表
        currentPlayer: 0,    // 当前查看的玩家
        civilianWord: '',    // 平民词
        spyWord: '',         // 卧底词
        eliminated: [],      // 已淘汰玩家索引
        round: 1,            // 当前轮次
        isStarted: false
    },

    /**
     * 初始化设置页
     */
    init() {
        this.config.playerCount = 6;
        this.config.spyCount = 1;
        this.config.hasBlank = false;
        document.getElementById('undercover-blank').checked = false;
        this.updateUI();
    },

    /**
     * 调整玩家人数
     */
    adjustPlayers(delta) {
        const newCount = this.config.playerCount + delta;
        if (newCount >= this.config.minPlayers && newCount <= this.config.maxPlayers) {
            this.config.playerCount = newCount;
            // 自动调整卧底数量确保合理
            this.autoAdjustSpies();
            this.updateUI();
        }
    },

    /**
     * 调整卧底数量
     */
    adjustSpies(delta) {
        const newCount = this.config.spyCount + delta;
        const maxSpies = this.getMaxSpyCount();
        if (newCount >= 1 && newCount <= maxSpies) {
            this.config.spyCount = newCount;
            this.updateUI();
        }
    },

    /**
     * 获取最大卧底数
     */
    getMaxSpyCount() {
        // 卧底最多占1/3玩家
        return Math.max(1, Math.floor(this.config.playerCount / 3));
    },

    /**
     * 自动调整卧底数量
     */
    autoAdjustSpies() {
        const maxSpies = this.getMaxSpyCount();
        this.config.spyCount = Math.min(this.config.spyCount, maxSpies);
    },

    /**
     * 切换白板
     */
    toggleBlank() {
        this.config.hasBlank = document.getElementById('undercover-blank').checked;
    },

    /**
     * 更新界面
     */
    updateUI() {
        document.getElementById('undercover-player-count').textContent = this.config.playerCount;
        document.getElementById('undercover-spy-count').textContent = this.config.spyCount;
    },

    /**
     * 开始游戏 - 分配词语
     */
    startGame() {
        // 获取随机词语对
        const wordPair = GameData.getRandomUndercoverPair();
        this.state.civilianWord = wordPair[0];
        this.state.spyWord = wordPair[1];

        // 创建玩家列表
        const players = [];

        // 添加卧底
        for (let i = 0; i < this.config.spyCount; i++) {
            players.push({
                role: 'spy',
                name: '卧底',
                icon: '🕵️',
                word: this.state.spyWord,
                desc: '你是卧底！你的词语与其他人略有不同。',
                theme: 'spy'
            });
        }

        // 添加白板（如果启用）
        if (this.config.hasBlank) {
            players.push({
                role: 'blank',
                name: '白板',
                icon: '📄',
                word: '???',
                desc: '你是白板！你没有词语，请根据他人描述猜测。',
                theme: 'blank'
            });
        }

        // 添加平民
        const civilianCount = this.config.playerCount - this.config.spyCount - (this.config.hasBlank ? 1 : 0);
        for (let i = 0; i < civilianCount; i++) {
            players.push({
                role: 'civilian',
                name: '平民',
                icon: '👤',
                word: this.state.civilianWord,
                desc: '你是平民！找出词语不同的卧底。',
                theme: 'civilian'
            });
        }

        // 随机打乱
        this.state.players = GameData.shuffle(players);
        this.state.currentPlayer = 0;
        this.state.eliminated = [];
        this.state.round = 1;
        this.state.isStarted = true;

        // 显示身份查看页
        app.showIdentityView('undercover');
    },

    /**
     * 获取当前玩家身份
     */
    getCurrentIdentity() {
        const player = this.state.players[this.state.currentPlayer];
        return {
            ...player,
            name: player.word, // 显示词语作为主要内容
            desc: player.desc
        };
    },

    /**
     * 开始游戏进行阶段
     */
    startActivePhase() {
        this.showGameStatus();
        app.showPage('game-active');
    },

    /**
     * 显示游戏状态
     */
    showGameStatus() {
        const status = document.getElementById('game-status');
        const actions = document.getElementById('game-actions');

        document.getElementById('active-game-title').textContent = '🕵️ 谁是卧底';

        const aliveCount = this.config.playerCount - this.state.eliminated.length;

        status.innerHTML = `
            <h2>第 ${this.state.round} 轮</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${aliveCount}</span>
                    <span class="stat-label">存活人数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.state.eliminated.length}</span>
                    <span class="stat-label">已淘汰</span>
                </div>
            </div>
            <div class="rules-reminder">
                <p>1️⃣ 轮流用一句话<strong>描述</strong>你的词语</p>
                <p>2️⃣ 不能直接说出词语</p>
                <p>3️⃣ 投票选出<strong>嫌疑人</strong></p>
                <p>4️⃣ 得票最多者<strong>出局</strong></p>
            </div>
        `;

        actions.innerHTML = `
            <button class="secondary-btn" onclick="undercover.nextRound()">
                完成本轮描述 →
            </button>
            <button class="primary-btn" onclick="undercover.showVoteResult()">
                投票结束
            </button>
        `;
    },

    /**
     * 下一轮
     */
    nextRound() {
        this.state.round++;
        this.showGameStatus();
    },

    /**
     * 显示投票结果输入
     */
    showVoteResult() {
        const status = document.getElementById('game-status');
        const actions = document.getElementById('game-actions');

        // 生成存活玩家按钮
        let playerButtons = '';
        for (let i = 0; i < this.config.playerCount; i++) {
            if (!this.state.eliminated.includes(i)) {
                playerButtons += `
                    <button class="vote-btn" onclick="undercover.eliminatePlayer(${i})">
                        玩家 ${i + 1}
                    </button>
                `;
            }
        }

        status.innerHTML = `
            <h2>选择被淘汰的玩家</h2>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">
                点击得票最多的玩家编号
            </p>
            <div class="vote-grid">
                ${playerButtons}
            </div>
        `;

        actions.innerHTML = `
            <button class="secondary-btn" onclick="undercover.showGameStatus()">
                ← 返回
            </button>
        `;
    },

    /**
     * 淘汰玩家
     */
    eliminatePlayer(index) {
        const player = this.state.players[index];
        this.state.eliminated.push(index);

        // 检查游戏是否结束
        const result = this.checkGameEnd();

        if (result) {
            this.endGame(result);
        } else {
            // 显示被淘汰玩家身份
            const status = document.getElementById('game-status');
            status.innerHTML = `
                <div class="eliminated-reveal">
                    <h2>玩家 ${index + 1} 出局</h2>
                    <div class="reveal-icon">${player.icon}</div>
                    <p class="reveal-role">${player.role === 'spy' ? '卧底' : player.role === 'blank' ? '白板' : '平民'}</p>
                    <p class="reveal-word">词语：${player.word}</p>
                </div>
            `;

            const actions = document.getElementById('game-actions');
            actions.innerHTML = `
                <button class="primary-btn" onclick="undercover.continueGame()">
                    继续游戏 →
                </button>
            `;
        }
    },

    /**
     * 继续游戏
     */
    continueGame() {
        this.state.round++;
        this.showGameStatus();
    },

    /**
     * 检查游戏是否结束
     */
    checkGameEnd() {
        // 统计存活的各角色
        let aliveCivilians = 0;
        let aliveSpies = 0;
        let aliveBlank = 0;

        for (let i = 0; i < this.state.players.length; i++) {
            if (!this.state.eliminated.includes(i)) {
                const role = this.state.players[i].role;
                if (role === 'spy') aliveSpies++;
                else if (role === 'blank') aliveBlank++;
                else aliveCivilians++;
            }
        }

        const totalAlive = aliveCivilians + aliveSpies + aliveBlank;

        // 卧底全部出局 -> 平民胜利
        if (aliveSpies === 0) {
            return 'civilians';
        }

        // 卧底人数 >= 其他存活人数 -> 卧底胜利
        if (aliveSpies >= (aliveCivilians + aliveBlank)) {
            return 'spies';
        }

        // 只剩2-3人且卧底存活 -> 卧底胜利
        if (totalAlive <= 3 && aliveSpies > 0) {
            return 'spies';
        }

        return null; // 游戏继续
    },

    /**
     * 结束游戏
     */
    endGame(winner) {
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const resultStats = document.getElementById('result-stats');

        if (winner === 'spies') {
            resultIcon.textContent = '🕵️';
            resultTitle.textContent = '卧底获胜！';
            resultMessage.textContent = '卧底成功隐藏到最后！';
        } else {
            resultIcon.textContent = '🎉';
            resultTitle.textContent = '平民获胜！';
            resultMessage.textContent = '成功找出了所有卧底！';
        }

        resultStats.innerHTML = `
            <p><span>平民词</span><strong>${this.state.civilianWord}</strong></p>
            <p><span>卧底词</span><strong>${this.state.spyWord}</strong></p>
            <p><span>游戏轮次</span><strong>${this.state.round}轮</strong></p>
        `;

        app.currentGame = 'undercover';
        app.showPage('game-over');
    },

    /**
     * 重新开始
     */
    restart() {
        this.init();
        app.showPage('undercover-setup');
    }
};

// 添加必要的CSS
const undercoverStyles = document.createElement('style');
undercoverStyles.textContent = `
    .vote-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
    }
    
    .vote-btn {
        padding: 16px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: var(--bg-card);
        color: var(--text-primary);
        border-radius: 12px;
        font-size: 14px;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .vote-btn:hover {
        background: var(--danger);
        border-color: var(--danger);
    }
    
    .eliminated-reveal {
        text-align: center;
    }
    
    .reveal-icon {
        font-size: 80px;
        margin: 20px 0;
    }
    
    .reveal-role {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--undercover);
    }
    
    .reveal-word {
        font-size: 18px;
        color: var(--text-secondary);
    }
    
    .stats-grid {
        display: flex;
        justify-content: center;
        gap: 32px;
        margin: 24px 0;
    }
    
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }
    
    .stat-value {
        font-size: 36px;
        font-weight: 700;
        color: var(--primary-light);
    }
    
    .stat-label {
        font-size: 14px;
        color: var(--text-muted);
    }
    
    .rules-reminder {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 20px;
        text-align: left;
    }
    
    .rules-reminder p {
        margin: 8px 0;
        font-size: 14px;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(undercoverStyles);

// 初始化
window.undercover = undercover;
