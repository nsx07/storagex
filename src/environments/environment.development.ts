export const environment = {
    production: false,
    apiUrl: sessionStorage.getItem("apiUrl") ?? 'http://localhost:3000/'
}