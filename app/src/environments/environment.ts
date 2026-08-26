export const environment = {
  production: false,
  get apiUrl(): string {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__API_URL__) return win.__API_URL__;

      const host = window.location.hostname;
      const protocol = window.location.protocol;

      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3000/api';
      }

      // Se o frontend estiver rodando em app.dominio.com, a API geralmente roda em api.dominio.com/api
      if (host.startsWith('app.')) {
        return `${protocol}//${host.replace('app.', 'api.')}/api`;
      }

      // Se estiver em um subdomínio qualquer ou domínio principal com api no mesmo host
      if (host.includes('.')) {
        return `${protocol}//api.${host}/api`;
      }

      return `${protocol}//${host}:3000/api`;
    }
    return 'http://localhost:3000/api';
  },
};
