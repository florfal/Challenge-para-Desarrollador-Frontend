import axios from 'axios';

const mockApiPokemon = axios.create({
  baseURL: 'https://67d81f029d5e3a10152d7c98.mockapi.io/api/v1/pokemon',
});

export default mockApiPokemon;