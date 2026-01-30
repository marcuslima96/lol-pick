// data-dragon-api.js - Versão Otimizada

const DataDragonAPI = {
    version: null,
    baseUrl: 'https://ddragon.leagueoflegends.com',

    async getVersion() {
        if (this.version) return this.version;
        try {
            const response = await fetch(`${this.baseUrl}/api/versions.json`);
            const versions = await response.json();
            this.version = versions[0];
            return this.version;
        } catch (error) {
            console.error('Erro ao buscar versão:', error);
            return '14.1.1'; // Fallback de segurança
        }
    },

    async fetchChampionsList() {
        try {
            const ver = await this.getVersion();
            const response = await fetch(`${this.baseUrl}/cdn/${ver}/data/pt_BR/champion.json`);
            const data = await response.json();
            return data.data; 
        } catch (error) {
            console.error('Erro lista de campeões:', error);
            return null;
        }
    },

    async fetchChampionDetails(championId) {
        try {
            const ver = await this.getVersion();
            const response = await fetch(`${this.baseUrl}/cdn/${ver}/data/pt_BR/champion/${championId}.json`);
            const data = await response.json();
            return data.data[championId]; 
        } catch (error) {
            console.error(`Erro detalhes do campeão ${championId}:`, error);
            return null;
        }
    },

    getImageUrl(type, filename) {
        if (!this.version) return '';
        const path = type === 'champion' ? 'img/champion/loading' : `img/${type}`;
        return `${this.baseUrl}/cdn/${this.version}/${path}/${filename}`;
    }
};

window.DataDragonAPI = DataDragonAPI;
