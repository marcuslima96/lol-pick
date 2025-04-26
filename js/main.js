// Variáveis globais
let selectedLane = null;
let champions = null;
let abilitiesData = null;

// Cache para armazenar dados de habilidades já carregados
let abilitiesCache = {};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados dos campeões
    loadChampionData();
    
    // Carregar dados das habilidades
    loadAbilitiesData();
    
    // Configurar eventos dos botões de lane
    setupLaneButtons();
    
    // Configurar evento do botão de sorteio
    setupRandomizeButton();
    
    // Mostrar o card do campeão vazio inicialmente
    document.getElementById('champion-card').classList.remove('hidden');
});

// Função para carregar os dados dos campeões do arquivo JSON
async function loadChampionData() {
    try {
        const response = await fetch('data/champions.json');
        champions = await response.json();
        console.log('Dados dos campeões carregados com sucesso!');
    } catch (error) {
        console.error('Erro ao carregar dados dos campeões:', error);
    }
}   

// Função para carregar os dados das habilidades do arquivo JSON
async function loadAbilitiesData() {
    try {
        const response = await fetch('data/abilities.json');
        abilitiesData = await response.json();
        console.log('Dados das habilidades carregados com sucesso!');
    } catch (error) {
        console.error('Erro ao carregar dados das habilidades:', error);
    }
}

// Configurar eventos dos botões de lane
function setupLaneButtons() {
    const laneButtons = document.querySelectorAll('.lane-btn');
    
    laneButtons.forEach(button => {
        // Evento de clique
        button.addEventListener('click', () => {
            // Remover classe ativa de todos os botões
            laneButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe ativa ao botão clicado
            button.classList.add('active');
            
            // Atualizar lane selecionada
            selectedLane = button.getAttribute('data-lane');
            document.getElementById('current-lane').textContent = getLaneName(selectedLane);
            
            // Habilitar botão de sorteio
            const randomizeBtn = document.getElementById('randomize-btn');
            randomizeBtn.disabled = false;
            
            // Adicionar animação ao botão de sorteio
            randomizeBtn.classList.add('pulse');
            setTimeout(() => {
                randomizeBtn.classList.remove('pulse');
            }, 1000);
        });
    });
}

// Obter nome da lane em português
function getLaneName(lane) {
    const laneNames = {
        'top': 'Topo',
        'jungle': 'Selva',
        'mid': 'Meio',
        'adc': 'Atirador',
        'support': 'Suporte'
    };
    
    return laneNames[lane] || 'Desconhecida';
}

// Configurar evento do botão de sorteio
function setupRandomizeButton() {
    const randomizeBtn = document.getElementById('randomize-btn');
    
    // Evento de clique
    randomizeBtn.addEventListener('click', () => {
        if (!randomizeBtn.disabled) {
            randomizeChampion();
        }
    });
}

// Função para sortear um campeão
function randomizeChampion() {
    if (!selectedLane || !champions) return;
    
    // Obter lista de campeões da lane selecionada
    const laneChampions = champions[selectedLane];
    
    if (!laneChampions || laneChampions.length === 0) {
        console.error(`Nenhum campeão encontrado para a lane ${selectedLane}`);
        return;
    }
    
    // Sortear um campeão aleatório
    const randomIndex = Math.floor(Math.random() * laneChampions.length);
    const champion = laneChampions[randomIndex];
    
    // Iniciar animação de sorteio
    startRandomizeAnimation(champion);
}

// Função para iniciar a animação de sorteio
function startRandomizeAnimation(champion) {
    // Mostrar o card do campeão
    const championCard = document.getElementById('champion-card');
    
    // Iniciar o efeito de exibição do campeão
    displayChampion(champion);
}

// Função para exibir o campeão sorteado
async function displayChampion(champion) {
    // Atualizar imagem do campeão
    const championImage = document.getElementById('champion-image');
    championImage.src = champion.image;
    championImage.alt = champion.name;
    
    // Atualizar nome do campeão
    document.getElementById('champion-name').textContent = champion.name;
    
    // Buscar dados reais das habilidades da API Data Dragon
    let abilities = null;
    
    // Verificar se já temos os dados no cache
    if (abilitiesCache[champion.name]) {
        console.log(`Usando dados em cache para ${champion.name}`);
        abilities = abilitiesCache[champion.name];
    } else {
        console.log(`Buscando dados da API para ${champion.name}`);
        // Buscar dados da API
        abilities = await window.DataDragonAPI.getChampionAbilities(champion.name);
        
        // Armazenar no cache se encontrou
        if (abilities) {
            abilitiesCache[champion.name] = abilities;
        }
    }
    
    // Atualizar ícones de habilidades e descrições
    updateAbilityWithRealData('passive', champion.abilities.passive, champion.name, 'passive', abilities);
    updateAbilityWithRealData('q-skill', champion.abilities.q, champion.name, 'q', abilities);
    updateAbilityWithRealData('w-skill', champion.abilities.w, champion.name, 'w', abilities);
    updateAbilityWithRealData('e-skill', champion.abilities.e, champion.name, 'e', abilities);
    updateAbilityWithRealData('r-skill', champion.abilities.r, champion.name, 'r', abilities);
    
    // Atualizar link para a página oficial
    const championLink = document.getElementById('champion-link');
    championLink.href = champion.link;
    
    // Mostrar o card
    const championCard = document.getElementById('champion-card');
    championCard.classList.add('visible');
    championCard.classList.remove('hidden');
}

// Função para atualizar uma habilidade
function updateAbilityWithRealData(elementId, imageUrl, championName, abilityType, apiAbilities) {
    const imgElement = document.getElementById(elementId);
    imgElement.src = imageUrl;
    imgElement.classList.remove('empty');
    imgElement.classList.remove('error');
    
    // Adicionar evento para tratar erros de carregamento
    imgElement.onerror = function() {
        this.classList.add('error');
        console.warn(`Erro ao carregar imagem da habilidade: ${imageUrl}`);
    };
    
    // Primeiro, tentar usar dados da API Data Dragon
    if (apiAbilities && apiAbilities[abilityType]) {
        const abilityData = apiAbilities[abilityType];
        
        // Atualizar nome da habilidade
        const nameElement = document.getElementById(`${abilityType}-name`);
        if (nameElement) {
            nameElement.textContent = abilityData.name;
        }
        
        // Atualizar descrição da habilidade
        const descElement = document.getElementById(`${abilityType}-desc`);
        if (descElement) {
            // Remover tags HTML da descrição
            const cleanDescription = abilityData.description.replace(/<[^>]*>/g, '');
            descElement.textContent = cleanDescription;
        }
        
        return;
    }
    
    // Fallback para dados do JSON local
    if (abilitiesData && abilitiesData.champions[championName] && abilitiesData.champions[championName][abilityType]) {
        const abilityData = abilitiesData.champions[championName][abilityType];
        
        // Atualizar nome da habilidade
        const nameElement = document.getElementById(`${abilityType}-name`);
        if (nameElement) {
            nameElement.textContent = abilityData.name || `Habilidade ${abilityType.toUpperCase()}`;
        }
        
        // Atualizar descrição da habilidade
        const descElement = document.getElementById(`${abilityType}-desc`);
        if (descElement) {
            descElement.textContent = abilityData.description || `Descrição da habilidade ${abilityType.toUpperCase()} do campeão.`;
        }
    } else {
        // Fallback para descrições genéricas
        console.warn(`Dados de habilidade não encontrados para ${championName} - ${abilityType}`);
        
        // Atualizar nome da habilidade com valor genérico
        const nameElement = document.getElementById(`${abilityType}-name`);
        if (nameElement) {
            const abilityNames = {
                'passive': 'Passiva',
                'q': 'Habilidade Q',
                'w': 'Habilidade W',
                'e': 'Habilidade E',
                'r': 'Ultimate (R)'
            };
            nameElement.textContent = abilityNames[abilityType] || `Habilidade ${abilityType.toUpperCase()}`;
        }
        
        // Atualizar descrição da habilidade com valor genérico
        const descElement = document.getElementById(`${abilityType}-desc`);
        if (descElement) {
            descElement.textContent = `Descrição da habilidade ${abilityType.toUpperCase()} de ${championName}.`;
        }
    }
}
