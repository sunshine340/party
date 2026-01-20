/**
 * 聚会游戏助手 - 主应用控制器
 */
const app = {
    // 当前状态
    currentGame: null,      // 当前游戏类型
    currentPage: 'home',    // 当前页面
    gameState: null,        // 当前游戏状态引用

    /**
     * 初始化应用
     */
    init() {
        this.showPage('home-page');

        // 初始化各游戏模块
        if (typeof werewolf !== 'undefined') werewolf.init();
        if (typeof undercover !== 'undefined') undercover.init();
        if (typeof charades !== 'undefined') charades.init();

        // 阻止移动端双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // 处理返回按钮
        window.addEventListener('popstate', (e) => {
            if (this.currentPage !== 'home-page') {
                e.preventDefault();
                this.goHome();
            }
        });
    },

    /**
     * 选择游戏
     */
    selectGame(game) {
        this.currentGame = game;

        switch (game) {
            case 'werewolf':
                werewolf.init();
                this.showPage('werewolf-setup');
                break;
            case 'undercover':
                undercover.init();
                this.showPage('undercover-setup');
                break;
            case 'charades':
                charades.init();
                this.showPage('charades-setup');
                break;
        }
    },

    /**
     * 返回首页
     */
    goHome() {
        // 清理当前游戏状态
        if (typeof charades !== 'undefined') charades.cleanup();

        this.currentGame = null;
        this.showPage('home-page');
    },

    /**
     * 显示页面
     */
    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }

        // 添加历史记录
        if (pageId !== 'home-page') {
            history.pushState({ page: pageId }, '', '');
        }
    },

    /**
     * 显示身份查看页面
     */
    showIdentityView(gameType) {
        this.currentGame = gameType;

        // 设置标题
        const titles = {
            werewolf: '🐺 查看身份',
            undercover: '🕵️ 查看词语'
        };
        document.getElementById('identity-title').textContent = titles[gameType] || '查看身份';

        // 获取游戏模块
        const game = gameType === 'werewolf' ? werewolf : undercover;

        // 设置玩家数量
        const totalPlayers = game.config.playerCount;
        document.getElementById('total-player-num').textContent = totalPlayers;
        document.getElementById('current-player-num').textContent = 1;

        // 重置卡片状态
        const card = document.getElementById('identity-card');
        card.classList.remove('flipped', 'wolf', 'sheep', 'spy', 'civilian', 'blank');

        // 更新按钮状态
        document.getElementById('prev-player-btn').style.visibility = 'hidden';
        document.getElementById('next-player-btn').textContent = '下一位 →';

        this.showPage('identity-view');
    },

    /**
     * 翻转身份卡
     */
    toggleIdentity() {
        const card = document.getElementById('identity-card');

        if (!card.classList.contains('flipped')) {
            // 显示身份
            const game = this.currentGame === 'werewolf' ? werewolf : undercover;
            const identity = game.getCurrentIdentity();

            // 设置卡片内容
            document.getElementById('identity-icon').textContent = identity.icon;
            document.getElementById('identity-role').textContent = identity.name;
            document.getElementById('identity-desc').textContent = identity.desc;

            // 设置主题
            card.className = 'identity-card flipped ' + identity.theme;
        } else {
            // 隐藏身份
            card.classList.remove('flipped');
        }
    },

    /**
     * 上一位玩家
     */
    prevPlayer() {
        const game = this.currentGame === 'werewolf' ? werewolf : undercover;

        if (game.state.currentPlayer > 0) {
            game.state.currentPlayer--;
            this.updatePlayerNav();
        }
    },

    /**
     * 下一位玩家
     */
    nextPlayer() {
        const game = this.currentGame === 'werewolf' ? werewolf : undercover;
        const totalPlayers = game.config.playerCount;

        // 先隐藏当前身份
        const card = document.getElementById('identity-card');
        if (card.classList.contains('flipped')) {
            card.classList.remove('flipped');
        }

        // 检查是否是最后一位玩家
        if (game.state.currentPlayer >= totalPlayers - 1) {
            // 所有人都看完了，开始游戏
            game.startActivePhase();
        } else {
            // 下一位玩家
            game.state.currentPlayer++;
            this.updatePlayerNav();
        }
    },

    /**
     * 更新玩家导航状态
     */
    updatePlayerNav() {
        const game = this.currentGame === 'werewolf' ? werewolf : undercover;
        const current = game.state.currentPlayer;
        const total = game.config.playerCount;

        // 更新数字
        document.getElementById('current-player-num').textContent = current + 1;

        // 更新按钮
        document.getElementById('prev-player-btn').style.visibility = current > 0 ? 'visible' : 'hidden';
        document.getElementById('next-player-btn').textContent =
            current >= total - 1 ? '开始游戏 →' : '下一位 →';

        // 重置卡片
        const card = document.getElementById('identity-card');
        card.classList.remove('flipped', 'wolf', 'sheep', 'spy', 'civilian', 'blank');
    },

    /**
     * 确认退出游戏
     */
    confirmExit() {
        this.showModal(
            '确认退出？',
            '游戏进度将丢失',
            () => this.goHome()
        );
    },

    /**
     * 确认结束游戏
     */
    confirmEnd() {
        this.showModal(
            '结束游戏？',
            '确定要提前结束本局游戏吗？',
            () => {
                if (this.currentGame === 'charades') {
                    charades.endGame();
                } else {
                    this.goHome();
                }
            }
        );
    },

    /**
     * 显示模态框
     */
    showModal(title, message, onConfirm) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;

        const confirmBtn = document.getElementById('modal-confirm');
        confirmBtn.onclick = () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        };

        document.getElementById('confirm-modal').classList.add('active');
    },

    /**
     * 关闭模态框
     */
    closeModal() {
        document.getElementById('confirm-modal').classList.remove('active');
    },

    /**
     * 重新开始当前游戏
     */
    restartGame() {
        switch (this.currentGame) {
            case 'werewolf':
                werewolf.restart();
                break;
            case 'undercover':
                undercover.restart();
                break;
            case 'charades':
                charades.restart();
                break;
            default:
                this.goHome();
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 导出
window.app = app;
