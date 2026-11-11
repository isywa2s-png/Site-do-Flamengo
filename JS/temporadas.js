/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/temporadas.js (Gerenciamento de Temporadas e Histórico)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initSeasonModals();

    // Escuta o evento global de renderização
    window.addEventListener('flamengo:render', () => {
        renderTemporadasPage();
    });
});

/**
 * Renderiza e atualiza todas as informações da temporada atual e histórico.
 */
function renderTemporadasPage() {
    if (typeof AppState === 'undefined') return;

    // Atualizar badge da temporada atual na página
    const currentSeasonCardTitle = document.getElementById('history-current-season');
    if (currentSeasonCardTitle) {
        currentSeasonCardTitle.textContent = AppState.currentSeason || 'S1';
    }

    // Renderizar lista de temporadas encerradas (Histórico)
    renderSeasonsHistoryList();
}

/**
 * Renderiza a lista de temporadas anteriores/encerradas.
 */
function renderSeasonsHistoryList() {
    const listEl = document.getElementById('seasons-list');
    if (!listEl) return;

    const history = AppState.seasonsHistory || [];

    if (history.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
                <strong>Nenhuma temporada encerrada.</strong>
                <span>Quando uma temporada for encerrada, seu histórico aparecerá aqui.</span>
            </div>
        `;
        return;
    }

    listEl.innerHTML = history.map((s, idx) => `
        <div class="season-history-card">
            <div class="season-history-header">
                <h3>Temporada ${escapeHTML(s.seasonName)}</h3>
                <span>Encerrada</span>
            </div>

            <div class="season-history-content">
                <div class="season-history-stat">
                    <span>Brasileirão</span>
                    <strong>${escapeHTML(s.brasileirao || '-')}</strong>
                </div>
                <div class="season-history-stat">
                    <span>Libertadores</span>
                    <strong>${escapeHTML(s.libertadores || '-')}</strong>
                </div>
                <div class="season-history-stat">
                    <span>Artilheiro</span>
                    <strong>${escapeHTML(s.scorer || '-')} (${s.scorerGoals || 0})</strong>
                </div>
                <div class="season-history-stat">
                    <span>Gols Feitos</span>
                    <strong>${s.totalGoals || 0}</strong>
                </div>
            </div>

            <div class="season-history-actions">
                <button type="button" onclick="viewSeasonReport(${idx})">
                    <i class="fa-solid fa-eye"></i> Ver Relatório Completo
                </button>
                ${AppState.isAdmin ? `
                    <button type="button" class="danger-button" onclick="confirmDeleteSeason(${idx})">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

/* =========================================================
   CONTROLE DE MODAIS E FORMULÁRIOS DE TEMPORADA
   ========================================================= */

function initSeasonModals() {
    // Botão de avançar temporada
    const advanceBtn = document.getElementById('advance-season-button');
    if (advanceBtn) {
        advanceBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) {
                showToast('Apenas Lemos pode avançar a temporada.', 'error');
                return;
            }
            openSeasonModalForCurrent();
        });
    }

    // Botão de editar informações da temporada atual
    const editCurrentBtn = document.getElementById('edit-current-season');
    if (editCurrentBtn) {
        editCurrentBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) {
                showToast('Apenas Lemos pode editar a temporada.', 'error');
                return;
            }
            openSeasonModalForCurrent();
        });
    }

    const adminEditSeasonBtn = document.getElementById('admin-edit-season');
    if (adminEditSeasonBtn) {
        adminEditSeasonBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) {
                showToast('Apenas Lemos pode editar a temporada.', 'error');
                return;
            }
            openSeasonModalForCurrent();
        });
    }

    // Submissão do formulário de temporada
    const form = document.getElementById('season-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!AppState.isAdmin) return;

            await saveCurrentSeasonData();
        });
    }
}

/**
 * Abre o modal de edição da temporada atual preenchendo com os dados existentes ou calculados.
 */
function openSeasonModalForCurrent() {
    const modalTitle = document.getElementById('season-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `Registrar / Avançar Temporada ${AppState.currentSeason}`;
    }

    // Tentar identificar artilheiro e assistente atuais automaticamente para sugerir no form
    const players = AppState.players || [];
    const sortedScorers = [...players].sort((a, b) => (parseInt(b.goals) || 0) - (parseInt(a.goals) || 0));
    const sortedAssisters = [...players].sort((a, b) => (parseInt(b.assists) || 0) - (parseInt(a.assists) || 0));
    const totalGoalsSum = players.reduce((sum, p) => sum + (parseInt(p.goals) || 0), 0);

    // Preencher campos com dados atuais se já existirem na temporaria em andamento
    setValue('season-id', AppState.currentSeason);
    setValue('season-scorer', sortedScorers[0] ? sortedScorers[0].name : '');
    setValue('season-scorer-goals', sortedScorers[0] ? sortedScorers[0].goals : 0);
    setValue('season-assister', sortedAssisters[0] ? sortedAssisters[0].name : '');
    setValue('season-assister-count', sortedAssisters[0] ? sortedAssisters[0].assists : 0);
    setValue('season-total-goals', totalGoalsSum);

    if (typeof openModal === 'function') {
        openModal('season-modal');
    }
}

/**
 * Salva os dados preenchidos no modal e executa a virada/avanço da temporada.
 */
async function saveCurrentSeasonData() {
    if (!AppState.isAdmin) {
        showToast('Apenas Lemos pode salvar dados da temporada.', 'error');
        return;
    }

    const seasonName = AppState.currentSeason;

    const seasonRecord = {
        seasonName: seasonName,
        florida: getValue('season-florida'),
        guanabara: getValue('season-guanabara'),
        carioca: getValue('season-carioca'),
        brasileirao: getValue('season-brasileirao'),
        copaBrasil: getValue('season-copa-brasil'),
        libertadores: getValue('season-libertadores'),
        supercopa: getValue('season-supercopa'),
        recopa: getValue('season-recopa'),
        intercontinental: getValue('season-intercontinental'),
        derby: getValue('season-derby'),
        challenge: getValue('season-challenge'),
        supermundial: getValue('season-supermundial'),
        scorer: getValue('season-scorer'),
        scorerGoals: parseInt(getValue('season-scorer-goals')) || 0,
        assister: getValue('season-assister'),
        assisterCount: parseInt(getValue('season-assister-count')) || 0,
        biggestWin: getValue('season-biggest-win'),
        biggestLoss: getValue('season-biggest-loss'),
        totalGoals: parseInt(getValue('season-total-goals')) || 0,
        concededGoals: parseInt(getValue('season-conceded-goals')) || 0,
        notes: getValue('season-notes')
    };

    // Verificar se já existe no histórico para atualizar ou se é um avanço para nova temporada
    const existingIndex = AppState.seasonsHistory.findIndex(s => s.seasonName === seasonName);
    
    if (existingIndex >= 0) {
        // Apenas atualizar dados da temporada atual existente no histórico
        AppState.seasonsHistory[existingIndex] = seasonRecord;
        showToast('Informações da temporada atualizadas com sucesso!');
    } else {
        // Encerrar temporada atual, adicionar ao histórico e avançar para a próxima (S1 -> S2, etc.)
        AppState.seasonsHistory.unshift(seasonRecord);

        const currentNum = parseInt(seasonName.replace('S', '')) || 1;
        AppState.currentSeason = `S${currentNum + 1}`;

        // Resetar estatísticas de jogos, gols e assistências dos jogadores para a nova temporada
        if (AppState.players) {
            AppState.players.forEach(p => {
                p.games = 0;
                p.goals = 0;
                p.assists = 0;
            });
        }

        showToast(`Temporada ${seasonName} encerrada! Iniciada a Temporada ${AppState.currentSeason}.`);
    }

    if (typeof closeModal === 'function') {
        closeModal('season-modal');
    }

    if (typeof saveAppData === 'function') {
        await saveAppData();
    }
    if (typeof renderAll === 'function') {
        renderAll();
    }
}

/**
 * Exibe um relatório completo de uma temporada encerrada.
 */
function viewSeasonReport(index) {
    const s = AppState.seasonsHistory[index];
    if (!s) return;

    alert(
        `🏆 RELATÓRIO DA TEMPORADA ${s.seasonName}\n\n` +
        `• Florida Cup: ${s.florida || 'Não informada'}\n` +
        `• Guanabará: ${s.guanabara || 'Não informada'}\n` +
        `• Carioca: ${s.carioca || 'Não informado'}\n` +
        `• Brasileirão: ${s.brasileirao || 'Não informado'}\n` +
        `• Copa do Brasil: ${s.copaBrasil || 'Não informada'}\n` +
        `• Libertadores: ${s.libertadores || 'Não informada'}\n` +
        `• Supercopa: ${s.supercopa || 'Não informada'}\n` +
        `• Recopa: ${s.recopa || 'Não informada'}\n` +
        `• Intercontinental: ${s.intercontinental || 'Não informado'}\n` +
        `• Derby das Américas: ${s.derby || 'Não informado'}\n` +
        `• Desafio Challenge: ${s.challenge || 'Não informado'}\n` +
        `• Super Mundial: ${s.supermundial || 'Não informado'}\n\n` +
        `⚽ Artilheiro: ${s.scorer || 'Nenhum'} (${s.scorerGoals || 0} gols)\n` +
        `🎯 Garçom: ${s.assister || 'Nenhum'} (${s.assisterCount || 0} assists)\n` +
        `🔥 Maior Goleada Feita: ${s.biggestWin || 'N/A'}\n` +
        `⚠️ Maior Goleada Sofrida: ${s.biggestLoss || 'N/A'}\n` +
        `⚽ Gols Feitos: ${s.totalGoals || 0} | Gols Sofridos: ${s.concededGoals || 0}\n\n` +
        `📝 Notas: ${s.notes || 'Nenhuma observação.'}`
    );
}

/**
 * Confirma a exclusão de um registro de temporada do histórico.
 */
async function confirmDeleteSeason(index) {
    if (!AppState.isAdmin) {
        showToast('Apenas Lemos pode excluir temporadas.', 'error');
        return;
    }

    if (confirm('Tem certeza de que deseja excluir este histórico de temporada?')) {
        AppState.seasonsHistory.splice(index, 1);

        if (typeof saveAppData === 'function') {
            await saveAppData();
        }
        if (typeof renderAll === 'function') {
            renderAll();
        }
        showToast('Histórico de temporada excluído.');
    }
}

/* =========================================================
   FUNÇÕES AUXILIARES DE FORMULÁRIO
   ========================================================= */

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}