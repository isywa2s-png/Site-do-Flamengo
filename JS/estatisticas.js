/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/estatisticas.js (Gerenciamento de Estatísticas)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Escuta o evento global de renderização
    window.addEventListener('flamengo:render', () => {
        renderEstatisticasPage();
    });
});

/**
 * Renderiza e atualiza todas as estatísticas da temporada atual.
 */
function renderEstatisticasPage() {
    if (typeof AppState === 'undefined') return;

    const players = AppState.players || [];

    // 1. Atualizar Badges de Temporada
    const statsSeasonEl = document.getElementById('stats-season');
    if (statsSeasonEl) {
        statsSeasonEl.textContent = `TEMPORADA ${AppState.currentSeason || 'S1'}`;
    }

    // 2. Calcular Totais da Temporada
    // Total de jogos (maior número de partidas registradas por um atleta)
    const totalGames = players.reduce((max, p) => Math.max(max, parseInt(p.games) || 0), 0);
    
    // Total de gols somados do elenco
    const totalGoals = players.reduce((sum, p) => sum + (parseInt(p.goals) || 0), 0);
    
    // Total de assistências somadas do elenco
    const totalAssists = players.reduce((sum, p) => sum + (parseInt(p.assists) || 0), 0);

    const statsGamesEl = document.getElementById('stats-games');
    const statsGoalsEl = document.getElementById('stats-goals');
    const statsAssistsEl = document.getElementById('stats-assists');

    if (statsGamesEl) statsGamesEl.textContent = totalGames;
    if (statsGoalsEl) statsGoalsEl.textContent = totalGoals;
    if (statsAssistsEl) statsAssistsEl.textContent = totalAssists;

    // 3. Renderizar Artilheiro da Temporada
    renderTopScorer(players);

    // 4. Renderizar Líder de Assistências
    renderTopAssister(players);

    // 5. Renderizar Tabela Completa de Desempenho Individual
    renderStatisticsTable(players);
}

/**
 * Identifica e exibe o artilheiro do time na temporada.
 */
function renderTopScorer(players) {
    const container = document.getElementById('top-scorer');
    if (!container) return;

    // Ordenar jogadores por gols em ordem decrescente
    const sortedScorers = [...players].sort((a, b) => (parseInt(b.goals) || 0) - (parseInt(a.goals) || 0));
    const topScorer = sortedScorers[0];

    if (!topScorer || (parseInt(topScorer.goals) || 0) === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-futbol"></i>
                </div>
                <strong>Nenhum gol registrado.</strong>
                <span>Os gols marcados aparecerão aqui.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="ranking-player">
            <div class="ranking-position">
                <i class="fa-solid fa-trophy"></i>
            </div>
            <div class="ranking-player-info">
                <strong>${escapeHTML(topScorer.name)}</strong>
                <span>Camisa ${topScorer.number || '-'} • ${escapeHTML(topScorer.position)}</span>
            </div>
            <div class="ranking-player-value">
                ${topScorer.goals} Gols
            </div>
        </div>
    `;
}

/**
 * Identifica e exibe o principal assistente (garçom) do time na temporada.
 */
function renderTopAssister(players) {
    const container = document.getElementById('top-assister');
    if (!container) return;

    // Ordenar jogadores por assistências em ordem decrescente
    const sortedAssisters = [...players].sort((a, b) => (parseInt(b.assists) || 0) - (parseInt(a.assists) || 0));
    const topAssister = sortedAssisters[0];

    if (!topAssister || (parseInt(topAssister.assists) || 0) === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-handshake"></i>
                </div>
                <strong>Nenhuma assistência registrada.</strong>
                <span>As assistências realizadas aparecerão aqui.</span>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="ranking-player">
            <div class="ranking-position" style="color: var(--red-light); background: var(--red-soft);">
                <i class="fa-solid fa-fire"></i>
            </div>
            <div class="ranking-player-info">
                <strong>${escapeHTML(topAssister.name)}</strong>
                <span>Camisa ${topAssister.number || '-'} • ${escapeHTML(topAssister.position)}</span>
            </div>
            <div class="ranking-player-value">
                ${topAssister.assists} Assistências
            </div>
        </div>
    `;
}

/**
 * Preenche a tabela detalhada de estatísticas individuais por jogador.
 */
function renderStatisticsTable(players) {
    const tbody = document.getElementById('statistics-table-body');
    if (!tbody) return;

    if (players.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">
                    Nenhum jogador cadastrado no elenco.
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar por quantidade de gols (decrescente) como critério principal
    const sortedPlayers = [...players].sort((a, b) => (parseInt(b.goals) || 0) - (parseInt(a.goals) || 0));

    tbody.innerHTML = sortedPlayers.map(p => `
        <tr>
            <td>
                <strong>${escapeHTML(p.name)}</strong>
                <span style="display: block; font-size: 8px; color: var(--gray-500); font-weight: normal;">Camisa ${p.number || '-'}</span>
            </td>
            <td>${escapeHTML(p.position)}</td>
            <td>${p.games || 0}</td>
            <td><strong style="color: var(--red-light);">${p.goals || 0}</strong></td>
            <td>${p.assists || 0}</td>
        </tr>
    `).join('');
}

/* =========================================================
   FUNÇÃO AUXILIAR DE SEGURANÇA
   ========================================================= */

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}