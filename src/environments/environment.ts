export const environment = {
    production: true,
    apiUrl: sessionStorage.getItem('apiUrl') ?? 'https://storage-production.up.railway.app/'
}