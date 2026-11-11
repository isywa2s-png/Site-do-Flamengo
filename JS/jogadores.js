/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/jogadores.js (Gerenciamento do Elenco)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Configurar filtros e eventos da página de elenco
    initSquadFilters();

    // Escuta o evento global de renderização
    window.addEventListener('flamengo:render', () => {
        renderElencoPage();
    });
});

/**
 * Renderiza todos os grupos de posições e estatísticas do elenco.
 */
function renderElencoPage() {
    if (typeof AppState === 'undefined') return;

    const players = AppState.players || [];
    
    // Atualizar resumo geral do elenco
    const squadTotalEl = document.getElementById('squad-total');
    if (squadTotalEl) squadTotalEl.textContent = players.length;

    // Maior número de jogos de um atleta na temporada atual
    const maxGames = players.reduce((acc, p) => Math.max(acc, parseInt(p.games) || 0), 0);
    const squadGamesEl = document.getElementById('squad-games');
    if (squadGamesEl) squadGamesEl.textContent = maxGames;

    // Renderizar posições específicas
    renderPositionGroup('Goleiro', 'players-goleiro', 'count-goleiro', '🧤');
    renderPositionGroup('Zagueiro', 'players-zagueiro', 'count-zagueiro', '🛡️');
    renderPositionGroup('Meia', 'players-meia', 'count-meia', '🎯');
    renderPositionGroup('Atacante', 'players-atacante', 'count-atacante', '⚽');
    renderPositionGroup('Ala', 'players-ala', 'count-ala', '🏃');
}

/**
 * Renderiza os cards dos jogadores de uma posição específica aplicando filtros de busca.
 */
function renderPositionGroup(positionName, containerId, countId, emojiIcon) {
    const container = document.getElementById(containerId);
    const countEl = document.getElementById(countId);
    if (!container) return;

    const searchTerm = getSearchTerm();
    const selectedFilter = getPositionFilter();

    // Se o filtro global de posição estiver ativo e for diferente desta, esconde ou filtra
    let filteredPlayers = (AppState.players || []).filter(p => p.position === positionName);

    // Aplicar busca por nome
    if (searchTerm) {
        filteredPlayers = filteredPlayers.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            String(p.number).includes(searchTerm)
        );
    }

    if (countEl) {
        countEl.textContent = filteredPlayers.length;
    }

    // Se o filtro dropdown for diferente de 'todos' e desta posição, esconde o grupo
    const groupElement = container.closest('.position-group');
    if (groupElement) {
        if (selectedFilter !== 'todos' && selectedFilter !== positionName) {
            groupElement.style.display = 'none';
            return;
        } else {
            groupElement.style.display = 'block';
        }
    }

    if (filteredPlayers.length === 0) {
        container.innerHTML = `
            <div class="empty-position">
                Nenhum ${positionName.toLowerCase()} encontrado${searchTerm ? ' para a busca' : ''}.
            </div>
        `;
        return;
    }

    container.innerHTML = filteredPlayers.map(p => `
        <article class="player-card">
            <div class="player-card-top">
                <div class="player-number">${p.number || '0'}</div>
                <div class="player-name">
                    <strong>${escapeHTML(p.name)}</strong>
                    <span>${emojiIcon} ${escapeHTML(p.position)}</span>
                </div>
            </div>

            <div class="player-statistics">
                <div>
                    <strong>${p.games || 0}</strong>
                    <span>Jogos</span>
                </div>
                <div>
                    <strong>${p.goals || 0}</strong>
                    <span>Gols</span>
                </div>
                <div>
                    <strong>${p.assists || 0}</strong>
                    <span>Assists</span>
                </div>
            </div>

            ${AppState.isAdmin ? `
                <div class="player-actions">
                    <button type="button" onclick="openPlayerModalForEdit('${p.id}')">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button type="button" class="delete-player" onclick="confirmDeletePlayer('${p.id}')">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </div>
            ` : ''}
        </article>
    `).join('');
}

/* =========================================================
   FILTROS E BUSCA DO ELENCO
   ========================================================= */

function initSquadFilters() {
    const searchInput = document.getElementById('player-search');
    const filterSelect = document.getElementById('player-filter');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderElencoPage();
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            renderElencoPage();
        });
    }
}

function getSearchTerm() {
    const searchInput = document.getElementById('player-search');
    return searchInput ? searchInput.value.trim().toLowerCase() : '';
}

function getPositionFilter() {
    const filterSelect = document.getElementById('player-filter');
    return filterSelect ? filterSelect.value : 'todos';
}

/* =========================================================
   AÇÕES RESTRITAS A LEMOS (ADMIN)
   ========================================================= */

function openPlayerModalForEdit(playerId) {
    if (!AppState.isAdmin) {
        showToast('Apenas Lemos pode editar jogadores.', 'error');
        return;
    }
    if (typeof openPlayerModal === 'function') {
        openPlayerModal(playerId);
    }
}

async function confirmDeletePlayer(playerId) {
    if (!AppState.isAdmin) {
        showToast('Apenas Lemos pode excluir jogadores.', 'error');
        return;
    }

    const player = AppState.players.find(p => p.id === playerId);
    const playerName = player ? player.name : 'este jogador';

    if (confirm(`Tem certeza de que deseja excluir ${playerName} do elenco do Flamengo?`)) {
        AppState.players = AppState.players.filter(p => p.id !== playerId);
        
        if (typeof saveAppData === 'function') {
            await saveAppData();
        }
        if (typeof renderAll === 'function') {
            renderAll();
        }
        showToast('Jogador excluído com sucesso!');
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}