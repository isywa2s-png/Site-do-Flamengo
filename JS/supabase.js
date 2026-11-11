/* =========================================================
   CLUBE DE REGATAS DO FLAMENGO
   PORTAL OFICIAL - TPS FUTEBOL DE RUA
   Arquivo: JS/supabase.js (Cliente Supabase & Realtime)
   ========================================================= */

// 1. CONFIGURAÇÕES DE CONEXÃO
const SUPABASE_URL = 'https://zfulozynhalxgnmlcxfk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_o_jDKz6mHuVubA_fhAcYhQ_ajEmgFGe';

// Instância Global do Cliente Supabase
let supabase = null;

// Inicialização segura do cliente Supabase
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        console.log('✅ Supabase inicializado com sucesso.');
    } else {
        console.warn('⚠️ Biblioteca do Supabase não foi carregada via CDN.');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar o cliente Supabase:', error);
}

/* =========================================================
   2. MÉTODOS DE BANCO DE DADOS (CRUD)
   ========================================================= */

/**
 * Carrega todos os dados do clube armazenados na tabela 'flamengo_data'.
 */
async function fetchFlamengoData() {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('flamengo_data')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) {
            // Se a linha id=1 não existir no Supabase, retorna null para criação inicial
            if (error.code === 'PGRST116') {
                console.log('ℹ️ Nenhum dado encontrado. Criando registro inicial...');
                return null;
            }
            console.error('❌ Erro ao carregar dados do Supabase:', error.message);
            return null;
        }

        return data ? data.payload : null;
    } catch (err) {
        console.error('❌ Erro inesperado ao buscar dados:', err);
        return null;
    }
}

/**
 * Salva ou atualiza os dados completos do clube no Supabase.
 * Somente executado quando o usuário for "Lemos".
 */
async function saveFlamengoData(payload) {
    if (!supabase) return false;

    try {
        const { data, error } = await supabase
            .from('flamengo_data')
            .upsert({
                id: 1,
                payload: payload,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('❌ Erro ao salvar dados no Supabase:', error.message);
            return false;
        }

        console.log('⚡ Dados sincronizados com o Supabase com sucesso!');
        return true;
    } catch (err) {
        console.error('❌ Erro inesperado ao salvar dados:', err);
        return false;
    }
}

/* =========================================================
   3. SINCRONIZAÇÃO EM TEMPO REAL (REALTIME)
   ========================================================= */

/**
 * Escuta alterações no Supabase em tempo real.
 * Sempre que você (Lemos) fizer uma alteração, todos os visitantes verão na hora!
 */
function initRealtimeSync(onUpdateCallback) {
    if (!supabase) return;

    const channel = supabase
        .channel('public:flamengo_data')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'flamengo_data'
            },
            (payload) => {
                console.log('🔔 Atualização recebida em tempo real!', payload);
                if (payload.new && payload.new.payload) {
                    if (typeof onUpdateCallback === 'function') {
                        onUpdateCallback(payload.new.payload);
                    }
                }
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('📡 Conectado ao canal em Tempo Real do Supabase!');
            }
        });
}

// Exporta as funções globais para o window poder acessar de outros scripts
window.FlamengoDB = {
    fetchData: fetchFlamengoData,
    saveData: saveFlamengoData,
    initRealtime: initRealtimeSync
};