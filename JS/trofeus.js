/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/trofeus.js (Gerenciamento da Sala de Troféus)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initTrophySearch();
    initTrophyFormHandlers();

    // Escuta o evento global de renderização
    window.addEventListener('flamengo:render', () => {
        renderTrofeusPage();
    });
});

/**
 * Renderiza e atualiza toda a página da Sala de Troféus.
 */
function renderTrofeusPage() {
    if (typeof AppState === 'undefined') return;

    renderTrophiesGrid();
}

/**
 * Renderiza os cards de troféus aplicando o filtro de busca.
 */
function renderTrophiesGrid() {
    const grid = document.getElementById('trophies-grid');
    const totalEl = document.getElementById('total-trophies');
    if (!grid) return;

    const trophies = AppState.trophies || [];
    const searchTerm = getTrophySearchTerm();

    // Calcular o total geral de títulos conquistados
    const totalTrophiesCount = trophies.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);
    if (totalEl) {
        totalEl.textContent = totalTrophiesCount;
    }

    // Filtrar por termo de busca
    let filteredTrophies = trophies;
    if (searchTerm) {
        filteredTrophies = trophies.filter(t => 
            t.name.toLowerCase().includes(searchTerm) || 
            (t.seasons && t.seasons.toLowerCase().includes(searchTerm))
        );
    }

    if (filteredTrophies.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <strong>Nenhum título encontrado.</strong>
                <span>${searchTerm ? 'Nenhum resultado para a busca.' : 'As conquistas do Flamengo aparecerão aqui.'}</span>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredTrophies.map(t => `
        <article class="trophy-card">
            <div class="trophy-card-top">
                <div class="trophy-card-logo">
                    ${t.logo ? `<img src="${t.logo}" alt="${escapeHTML(t.name)}">` : `<i class="fa-solid fa-trophy"></i>`}
                </div>
                <div class="trophy-card-name">
                    <h3>${escapeHTML(t.name)}</h3>
                    <span>Competição Oficial</span>
                </div>
            </div>

            <div class="trophy-count">
                <strong>${t.quantity || 0}</strong>
                <span>VEZES CAMPEÃO</span>
            </div>

            <div class="trophy-seasons">
                <span>EM QUAIS TEMPORADAS:</span>
                <p>${escapeHTML(t.seasons || 'Nenhuma temporada especificada')}</p>
            </div>

            ${AppState.isAdmin ? `
                <div class="trophy-actions">
                    <button type="button" onclick="openTrophyModalForEdit('${t.id}')">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button type="button" class="danger-button" onclick="confirmDeleteTrophy('${t.id}')">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </div>
            ` : ''}
        </article>
    `).join('');
}

/* =========================================================
   BUSCA E FILTROS DA SALA DE TROFÉUS
   ========================================================= */

function initTrophySearch() {
    const searchInput = document.getElementById('trophy-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderTrophiesGrid();
        });
    }
}

function getTrophySearchTerm() {
    const searchInput = document.getElementById('trophy-search');
    return searchInput ? searchInput.value.trim().toLowerCase() : '';
}

/* =========================================================
   MANIPULAÇÃO DE FORMULÁRIO E UPLOAD DE LOGO
   ========================================================= */

function initTrophyFormHandlers() {
    // Pré-visualização da imagem do logo ao fazer upload
    const logoInput = document.getElementById('trophy-logo');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const previewContainer = document.getElementById('trophy-logo-preview');
            if (!previewContainer) return;

            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    previewContainer.innerHTML = `<img src="${event.target.result}" alt="Preview do Logo" style="max-width: 60px; max-height: 60px; object-fit: contain;">`;
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.innerHTML = `
                    <i class="fa-solid fa-image"></i>
                    <span>Pré-visualização da imagem</span>
                `;
            }
        });
    }
}

/**
 * Abre o modal de troféus para adicionar uma nova competição ou editar existente.
 */
function openTrophyModalForEdit(trophyId = null) {
    if (!AppState.isAdmin) {
        showToast('Apenas Lemos pode gerenciar troféus.', 'error');
        return;
    }

    const form = document.getElementById('trophy-form');
    if (form) form.reset();

    const titleEl = document.getElementById('trophy-modal-title');
    const idInput = document.getElementById('trophy-id');
    const previewContainer = document.getElementById('trophy-logo-preview');

    if (idInput) idInput.value = '';
    if (titleEl) titleEl.textContent = 'Adicionar Competição';
    if (previewContainer) {
        previewContainer.innerHTML = `
            <i class="fa-solid fa-image"></i>
            <span>Pré-visualização da imagem</span>
        `;
    }

    if (trophyId) {
        const trophy = AppState.trophies.find(t => t.id === trophyId);
        if (trophy) {
            if (idInput) idInput.value = trophy.id;
            if (titleEl) titleEl.textContent = 'Editar Competição';
            
            setValue('trophy-name', trophy.name);
            setValue('trophy-quantity', trophy.quantity);
            setValue('trophy-seasons', trophy.seasons);

            if (trophy.logo && previewContainer) {
                previewContainer.innerHTML = `<img src="${trophy.logo}" alt="Logo" style="max-width: 60px; max-height: 60px; object-fit: contain;">`;
            }
        }
    }

    if (typeof openModal === 'function') {
        openModal('trophy-modal');
    }
}

/**
 * Confirma a exclusão de um troféu da sala.
 */
async function confirmDeleteTrophy(trophyId) {
    if (!AppState.isAdmin) {
        showToast('Apenas Lemos pode excluir troféus.', 'error');
        return;
    }

    const trophy = AppState.trophies.find(t => t.id === trophyId);
    const trophyName = trophy ? trophy.name : 'esta competição';

    if (confirm(`Tem certeza de que deseja remover ${trophyName} da Sala de Troféus do Flamengo?`)) {
        AppState.trophies = AppState.trophies.filter(t => t.id !== trophyId);

        if (typeof saveAppData === 'function') {
            await saveAppData();
        }
        if (typeof renderAll === 'function') {
            renderAll();
        }
        showToast('Competição removida com sucesso!');
    }
}

/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

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