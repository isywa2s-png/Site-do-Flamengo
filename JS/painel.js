/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/painel.js (Lógica do Painel Geral)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Escuta o evento global de renderização
    window.addEventListener('flamengo:render', () => {
        renderPainelGeral();
    });
});

/**
 * Renderiza e atualiza todos os componentes do Painel Geral.
 */
function renderPainelGeral() {
    if (typeof AppState === 'undefined') return;

    updateHeroSection();
    updateStatCards();
    updateClubInformation();
    updateRecentTransfers();
}

/**
 * Atualiza o banner Hero e badges da temporada atual no Painel.
 */
function updateHeroSection() {
    const seasonText = AppState.currentSeason || 'S1';
    const seasonNumber = seasonText.replace('S', '').padStart(2, '0');

    const heroSeasonEl = document.getElementById('hero-season');
    if (heroSeasonEl) heroSeasonEl.textContent = seasonText;

    const badgeEl = document.getElementById('dashboard-season-badge');
    if (badgeEl) badgeEl.textContent = seasonText;

    const numberEl = document.getElementById('dashboard-season-number');
    if (numberEl) numberEl.textContent = seasonNumber;
}

/**
 * Atualiza os cartões de números principais (Jogadores, Caixa, Partidas, Títulos).
 */
function updateStatCards() {
    // Total de Jogadores
    const playerCount = AppState.players ? AppState.players.length : 0;
    const playerCountEl = document.getElementById('dashboard-player-count');
    if (playerCountEl) playerCountEl.textContent = playerCount;

    // Valor de Caixa (em Euros e formatado)
    const cashValue = AppState.cash !== undefined ? AppState.cash : 0;
    const cashEl = document.getElementById('dashboard-cash');
    if (cashEl) {
        cashEl.textContent = formatCurrencyEUR(cashValue);
    }

    // Total de Jogos (maior número de jogos disputado por um jogador na temporada)
    let maxGames = 0;
    if (AppState.players && AppState.players.length > 0) {
        maxGames = AppState.players.reduce((max, p) => Math.max(max, parseInt(p.games) || 0), 0);
    }
    const gamesEl = document.getElementById('dashboard-games');
    if (gamesEl) gamesEl.textContent = maxGames;

    // Total de Troféus Conquistados
    let totalTrophies = 0;
    if (AppState.trophies && AppState.trophies.length > 0) {
        totalTrophies = AppState.trophies.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
    }
    const trophiesEl = document.getElementById('dashboard-trophies');
    if (trophiesEl) trophiesEl.textContent = totalTrophies;
}

/**
 * Atualiza o bloco de dados institucionais do Flamengo.
 */
function updateClubInformation() {
    const presidentEl = document.getElementById('club-president');
    if (presidentEl) {
        presidentEl.textContent = AppState.president || 'Koee_annaa';
    }

    const clubSeasonEl = document.getElementById('club-season');
    if (clubSeasonEl) {
        clubSeasonEl.textContent = AppState.currentSeason || 'S1';
    }
}

/**
 * Renderiza a lista das últimas contratações feitas pelo Mengão.
 */
function updateRecentTransfers() {
    const container = document.getElementById('recent-transfers');
    if (!container) return;

    const transfers = AppState.transfers || [];

    if (transfers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-shirt"></i>
                </div>
                <strong>Nenhuma contratação ainda</strong>
                <span>As novas contratações aparecerão aqui.</span>
            </div>
        `;
        return;
    }

    // Pega até as 4 últimas contratações registradas (em ordem decrescente)
    const recentList = [...transfers].reverse().slice(0, 4);

    container.innerHTML = recentList.map(item => `
        <div class="transfer-item">
            <div class="transfer-avatar">
                <i class="fa-solid fa-user-plus"></i>
            </div>
            <div class="transfer-info">
                <strong>${escapeHtml(item.player)}</strong>
                <span>${escapeHtml(item.position || 'Reforço')} • ${formatDateBR(item.date)}</span>
            </div>
            <div class="transfer-value">
                + ${formatCurrencyEUR(item.value || 0)}
            </div>
        </div>
    `).join('');
}

/* =========================================================
   FUNÇÕES AUXILIARES DE FORMATAÇÃO
   ========================================================= */

function formatCurrencyEUR(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(value || 0);
}

function formatDateBR(dateString) {
    if (!dateString) return 'Data não inf.';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}