import axios from 'axios';
import type {
  Persona,
  Capilla,
  Parroquia,
  LibroSacramental,
  PartidaBase,
  PartidaBautismo,
  PartidaMatrimonio,
  NotaMarginal
} from '../domain/types';

const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Aviso: Sesión no autorizada o expirada (401). Redirigiendo al login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/token/', { username, password });
    return res.data;
  },

  // Capillas & Parroquias
  getParroquias: async (): Promise<Parroquia[]> => {
    const res = await apiClient.get('/sacramentos/parroquias/');
    return res.data.results || res.data;
  },
  getCapillas: async (): Promise<Capilla[]> => {
    const res = await apiClient.get('/sacramentos/capillas/');
    return res.data.results || res.data;
  },

  // Personas
  getPersonas: async (search?: string): Promise<Persona[]> => {
    const params = search ? { search } : {};
    const res = await apiClient.get('/sacramentos/personas/', { params });
    return res.data.results || res.data;
  },
  createPersona: async (persona: Persona): Promise<Persona> => {
    const upperData = {
      ...persona,
      nombres: persona.nombres.toUpperCase(),
      apellido_paterno: persona.apellido_paterno.toUpperCase(),
      apellido_materno: persona.apellido_materno?.toUpperCase(),
      lugar_nacimiento: persona.lugar_nacimiento?.toUpperCase(),
      domicilio: persona.domicilio?.toUpperCase(),
    };
    const res = await apiClient.post('/sacramentos/personas/', upperData);
    return res.data;
  },

  // Libros & Partidas
  getLibros: async (): Promise<LibroSacramental[]> => {
    const res = await apiClient.get('/sacramentos/libros/');
    return res.data.results || res.data;
  },
  getPartidasBase: async (search?: string): Promise<PartidaBase[]> => {
    const params = search ? { search } : {};
    const res = await apiClient.get('/sacramentos/partidas/', { params });
    return res.data.results || res.data;
  },
  getBautismos: async (): Promise<PartidaBautismo[]> => {
    const res = await apiClient.get('/sacramentos/bautismos/');
    return res.data.results || res.data;
  },
  getMatrimonios: async (): Promise<PartidaMatrimonio[]> => {
    const res = await apiClient.get('/sacramentos/matrimonios/');
    return res.data.results || res.data;
  },

  // Notas Marginales
  getNotasMarginales: async (): Promise<NotaMarginal[]> => {
    const res = await apiClient.get('/sacramentos/notas-marginales/');
    return res.data.results || res.data;
  },
  createNotaMarginal: async (nota: NotaMarginal): Promise<NotaMarginal> => {
    const upperNota = {
      ...nota,
      descripcion: nota.descripcion.toUpperCase(),
      parroquia_externa_nombre: nota.parroquia_externa_nombre?.toUpperCase(),
      ciudad_externa: nota.ciudad_externa?.toUpperCase(),
    };
    const res = await apiClient.post('/sacramentos/notas-marginales/', upperNota);
    return res.data;
  }
};
