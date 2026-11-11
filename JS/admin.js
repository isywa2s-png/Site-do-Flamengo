/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/admin.js (Gerenciamento Administrativo)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initAdminPanelEvents();

    // Escuta o evento global de renderização
    window.addEventListener('flamengo:render', () => {
        renderAdminPage();
    });
});

/**
 * Renderiza e atualiza o estado da página e componentes de Administração.
 */
function renderAdminPage() {
    if (typeof AppState === 'undefined') return;

    updateAdminStateUI();
}

/**
 * Inicializa todos os ouvintes de eventos da aba de administração.
 */
function initAdminPanelEvents() {
    // 1. Formulário de Login Administrativo
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('admin-name');
            const feedback = document.getElementById('admin-login-feedback');
            const username = nameInput ? nameInput.value.trim() : '';

            if (!username) return;

            // Validação de Acesso: Apenas "Lemos" (case-insensitive) ganha permissão de Administrador
            if (username.toLowerCase() === 'lemos') {
                AppState.currentUser = 'Lemos';
                AppState.isAdmin = true;

                if (feedback) feedback.textContent = '';
                if (typeof showToast === 'function') {
                    showToast('Bem-vindo, Lemos! Painel Administrativo liberado.');
                }
                
                loginForm.reset();
            } else {
                // Visitante ou outro usuário: apenas modo de visualização
                AppState.currentUser = username;
                AppState.isAdmin = false;

                if (feedback) {
                    feedback.textContent = `Acesso liberado como leitor para "${username}". Apenas Lemos pode fazer alterações.`;
                }
                if (typeof showToast === 'function') {
                    showToast(`Olá, ${username}! Você está em modo de visualização.`, 'warning');
                }
            }

            if (typeof renderAll === 'function') {
                renderAll();
            }
        });
    }

    // 2. Botão de Logout / Sair da Sessão Administrativa
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AppState.currentUser = null;
            AppState.isAdmin = false;

            if (typeof showToast === 'function') {
                showToast('Sessão encerrada com sucesso.');
            }

            if (typeof renderAll === 'function') {
                renderAll();
            }
        });
    }

    // 3. Atalhos das Ferramentas Administrativas no Painel
    setupAdminToolButtons();
}

/**
 * Configura os botões de ação do painel administrativo.
 */
function setupAdminToolButtons() {
    // Editar Caixa (Financeiro)
    const editCashBtn = document.getElementById('edit-cash-button');
    if (editCashBtn) {
        editCashBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) return;
            const input = document.getElementById('cash-value');
            if (input) input.value = AppState.cash || 0;
            if (typeof openModal === 'function') openModal('cash-modal');
        });
    }

    // Adicionar Jogador via Admin
    const adminAddPlayerBtn = document.getElementById('admin-add-player');
    if (adminAddPlayerBtn) {
        adminAddPlayerBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) return;
            if (typeof switchPage === 'function') switchPage('elenco');
            if (typeof openPlayerModalForEdit === 'function') openPlayerModalForEdit(null);
        });
    }

    // Adicionar Troféu via Admin
    const adminAddTrophyBtn = document.getElementById('admin-add-trophy');
    if (adminAddTrophyBtn) {
        adminAddTrophyBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) return;
            if (typeof switchPage === 'function') switchPage('trofeus');
            if (typeof openTrophyModalForEdit === 'function') openTrophyModalForEdit(null);
        });
    }

    // Editar / Avançar Temporada via Admin
    const adminEditSeasonBtn = document.getElementById('admin-edit-season');
    if (adminEditSeasonBtn) {
        adminEditSeasonBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) return;
            if (typeof switchPage === 'function') switchPage('temporadas');
            if (typeof openSeasonModalForCurrent === 'function') openSeasonModalForCurrent();
        });
    }

    // Registrar Contratação
    const addTransferBtn = document.getElementById('add-transfer-button');
    if (addTransferBtn) {
        addTransferBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) return;
            const form = document.getElementById('transfer-form');
            if (form) form.reset();

            const dateInput = document.getElementById('transfer-date');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }

            if (typeof openModal === 'function') openModal('transfer-modal');
        });
    }

    // Editar Informações do Clube (Presidenta, etc)
    const editClubBtn = document.getElementById('edit-club-button');
    if (editClubBtn) {
        editClubBtn.addEventListener('click', () => {
            if (!AppState.isAdmin) return;
            
            const nameInput = document.getElementById('club-name-input');
            const presidentInput = document.getElementById('club-president-input');
            
            if (nameInput) nameInput.value = AppState.clubName || 'Clube de Regatas do Flamengo';
            if (presidentInput) presidentInput.value = AppState.president || 'Koee_annaa';

            if (typeof openModal === 'function') openModal('club-modal');
        });
    }
}

/**
 * Atualiza visualmente o painel de administração de acordo com o status (Admin x Visitante).
 */
function updateAdminStateUI() {
    const adminLoginCard = document.getElementById('admin-login-card');
    const adminPanel = document.getElementById('admin-panel');
    const adminStatus = document.getElementById('admin-status');
    const adminElements = document.querySelectorAll('.admin-only');

    if (AppState.isAdmin) {
        // Exibe painel liberado para Lemos
        if (adminLoginCard) adminLoginCard.classList.add('hidden');
        if (adminPanel) adminPanel.classList.remove('hidden');

        if (adminStatus) {
            adminStatus.innerHTML = '<span></span> ADMINISTRADOR (LEMOS)';
            adminStatus.style.color = 'var(--red-light)';
            const dot = adminStatus.querySelector('span');
            if (dot) dot.style.background = 'var(--red-light)';
        }

        // Mostra botões restritos em todas as páginas
        adminElements.forEach(el => {
            el.style.display = 'inline-flex';
        });
    } else {
        // Modo visitante / leitura
        if (adminLoginCard) adminLoginCard.classList.remove('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');

        if (adminStatus) {
            adminStatus.innerHTML = '<span></span> MODO VISUALIZAÇÃO';
            adminStatus.style.color = 'var(--gray-300)';
            const dot = adminStatus.querySelector('span');
            if (dot) dot.style.background = 'var(--gray-500)';
        }

        // Esconde botões restritos em todas as páginas
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}