export const environment = {
  production: true,
  get apiUrl(): string {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.__API_URL__) return win.__API_URL__;

      const host = window.location.hostname;
      const protocol = window.location.protocol;

      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3000/api';
      }

      // Tratamento para www.organizadorfinan.com.br -> api.organizadorfinan.com.br
      if (host.startsWith('www.')) {
        return `${protocol}//api.${host.replace('www.', '')}/api`;
      }

      // Tratamento para app.organizadorfinan.com.br -> api.organizadorfinan.com.br
      if (host.startsWith('app.')) {
        return `${protocol}//${host.replace('app.', 'api.')}/api`;
      }

      // Tratamento para domínio raiz: organizadorfinan.com.br -> api.organizadorfinan.com.br
      if (host === 'organizadorfinan.com.br') {
        return `${protocol}//api.organizadorfinan.com.br/api`;
      }

      // Qualquer outro domínio com subdomínio api
      if (host.includes('.')) {
        return `${protocol}//api.${host}/api`;
      }

      return `${protocol}//${host}:3000/api`;
    }
    return 'http://localhost:3000/api';
  },
};
