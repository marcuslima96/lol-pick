// Arquivo para integração com a API Data Dragon

// Função para obter a versão mais recente do jogo
async function getLatestVersion() {
    try {
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await response.json();
        return versions[0]; // Pega a versão mais atual (primeira da lista)
    } catch (error) {
        console.error('Erro ao buscar versão mais recente:', error);
        return null;
    }
}

// Função para obter a lista de campeões
async function fetchChampionsList() {
    try {
        const version = await getLatestVersion();
        if (!version) return null;

        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Erro ao buscar lista de campeões:', error);
        return null;
    }
}
async function showChampions() {
    const champions = await fetchChampionsList();
    console.log(champions);
}

showChampions();


// Função para obter detalhes de um campeão específico
async function fetchChampionDetails(championId) {
    try {
        const version = await getLatestVersion();
        if (!version) return null;

        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion/${championId}.json`);
        const data = await response.json();
        return data.data[championId];
    } catch (error) {
        console.error(`Erro ao buscar detalhes do campeão ${championId}:`, error);
        return null;
    }
}

// Função para obter as descrições das habilidades de um campeão
async function getChampionAbilities(championName) {
    try {
        const version = await getLatestVersion();
        if (!version) return null;

        // Primeiro, precisamos encontrar o ID correto do campeão
        const championsList = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion.json`)
            .then(res => res.json())
            .then(data => data.data);

        if (!championsList) return null;

        // Encontrar o campeão na lista
        let championId = null;
        for (const id in championsList) {
            if (championsList[id].name === championName) {
                championId = id;
                break;
            }
        }

        if (!championId) {
            console.error(`Campeão "${championName}" não encontrado na lista.`);
            return null;
        }

        // Buscar detalhes do campeão
        const championDetails = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/champion/${championId}.json`)
            .then(res => res.json())
            .then(data => data.data[championId]);

        if (!championDetails) return null;

        // Extrair informações das habilidades
        const abilities = {
            passive: {
                name: championDetails.passive.name,
                description: championDetails.passive.description,
                image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${championDetails.passive.image.full}`
            },
            q: {
                name: championDetails.spells[0].name,
                description: championDetails.spells[0].description,
                image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${championDetails.spells[0].image.full}`
            },
            w: {
                name: championDetails.spells[1].name,
                description: championDetails.spells[1].description,
                image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${championDetails.spells[1].image.full}`
            },
            e: {
                name: championDetails.spells[2].name,
                description: championDetails.spells[2].description,
                image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${championDetails.spells[2].image.full}`
            },
            r: {
                name: championDetails.spells[3].name,
                description: championDetails.spells[3].description,
                image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${championDetails.spells[3].image.full}`
            }
        };

        return abilities;
    } catch (error) {
        console.error(`Erro ao obter habilidades do campeão ${championName}:`, error);
        return null;
    }
}

// Exportar as funções para uso no arquivo principal
window.DataDragonAPI = {
    fetchChampionsList,
    fetchChampionDetails,
    getChampionAbilities
};
