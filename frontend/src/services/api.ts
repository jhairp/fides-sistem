import axios from 'axios';
import { getToken } from '../utils/auth';
import type {
  Persona,
  Capilla,
  Parroquia,
  LibroSacramental,
  PartidaBase,
  PartidaBautismo,
  PartidaMatrimonio,
  NotaMarginal,
  Rol,
  Permiso,
} from '../domain/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if present
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Alias api to apiClient
export const api = apiClient;

// ---------- Parroquias ----------
export const fetchParroquias = () => apiClient.get('/sacramentos/parroquias/');
export const createParroquia = (data: any) => apiClient.post('/sacramentos/parroquias/', data);
export const updateParroquia = (id: string, data: any) =>
  apiClient.patch(`/sacramentos/parroquias/${id}/`, data);
export const fetchCapillasByParroquia = (parroquiaId: string) =>
  apiClient.get(`/sacramentos/capillas/?parroquia_id=${parroquiaId}`);

// ---------- Capillas ----------
export const createCapilla = (data: any) => apiClient.post('/sacramentos/capillas/', data);
export const updateCapilla = (id: string, data: any) =>
  apiClient.patch(`/sacramentos/capillas/${id}/`, data);
export const fetchCapilla = (id: string) => apiClient.get(`/sacramentos/capillas/${id}/`);
export const fetchCapillas = () => apiClient.get('/sacramentos/capillas/');

export const apiService = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await apiClient.post('/auth/token/', { username, password });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/users/me/');
    return res.data;
  },

  // Capillas & Parroquias
  getParroquias: async (): Promise<Parroquia[]> => {
    const res = await apiClient.get('/sacramentos/parroquias/');
    return res.data.results || res.data;
  },
  getCapillas: async (): Promise<Capilla[]> => {
    const res = await apiClient.get('/sacramentos/capillas/?all=true');
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
  },

  // ======= Usuarios =======
  getUsers: async (search?: string) => {
    const params = search ? { search } : {};
    const res = await apiClient.get('/auth/users/', { params });
    return res.data.results || res.data;
  },
  createUser: async (data: Record<string, unknown>) => {
    const res = await apiClient.post('/auth/users/', data);
    return res.data;
  },
  updateUser: async (id: string, data: Record<string, unknown>) => {
    const res = await apiClient.patch(`/auth/users/${id}/`, data);
    return res.data;
  },
  toggleUserActive: async (id: string) => {
    const res = await apiClient.post(`/auth/users/${id}/toggle_active/`);
    return res.data;
  },
  changePassword: async (current_password: string, new_password: string) => {
    const res = await apiClient.post('/auth/users/change_password/', { current_password, new_password });
    return res.data;
  },

  // ======= Roles y Permisos =======
  getRoles: async (): Promise<Rol[]> => {
    const res = await apiClient.get('/roles/');
    return res.data;
  },
  getPermisos: async (): Promise<Permiso[]> => {
    const res = await apiClient.get('/roles/permisos/');
    return res.data;
  },
  getRol: async (id: number): Promise<Rol> => {
    const res = await apiClient.get(`/roles/${id}/`);
    return res.data;
  },
  createRol: async (rol: Omit<Rol, 'id'>): Promise<Rol> => {
    const upperRol = {
      ...rol,
      codigo: rol.codigo.toUpperCase(),
      nombre: rol.nombre.toUpperCase(),
      descripcion: rol.descripcion.toUpperCase(),
    };
    const res = await apiClient.post('/roles/', upperRol);
    return res.data;
  },
  updateRol: async (id: number, rol: Partial<Rol>): Promise<Rol> => {
    const upperRol = {
      ...rol,
      ...(rol.codigo ? { codigo: rol.codigo.toUpperCase() } : {}),
      ...(rol.nombre ? { nombre: rol.nombre.toUpperCase() } : {}),
      ...(rol.descripcion ? { descripcion: rol.descripcion.toUpperCase() } : {}),
    };
    const res = await apiClient.put(`/roles/${id}/`, upperRol);
    return res.data;
  },
};

export default apiClient;
