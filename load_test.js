// Importa os módulos necessários do K6
import http from 'k6/http';
import { check, sleep } from 'k6';

// Importa a função para gerar o relatório HTML no final da execução
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Define as configurações de execução do teste
export const options = {
  vus: 2, // Número de usuários virtuais simultâneos
  duration: '5m', // Duração total do teste (5 minutos)
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições devem durar menos de 1000ms
    http_req_failed: ['rate<0.01'],    // No máximo 1% de falhas permitidas
  },
};

// URL base da API que será testada
const url = 'https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/';

// Lista de usuários com seus respectivos tokens e números de cartão, passados via variáveis de ambiente
const users = [
  { token: __ENV.TOKEN_CARAPICUIBA, cardNumber: __ENV.CARTAO_CARAPICUIBA },
  { token: __ENV.TOKEN_PINHAIS, cardNumber: __ENV.CARTAO_PINHAIS }
];

// Função principal executada por cada usuário virtual durante o teste
export default function () {
  // Seleciona o usuário com base no número do VU (usuário virtual)
  // O uso de módulo (%) garante que o índice fique dentro do tamanho da lista, mesmo com mais VUs
  const user = users[(__VU - 1) % users.length];

  // Define os cabeçalhos da requisição, incluindo o token do usuário
  const headers = {
    'Auth-Token': user.token,
    'Content-Type': 'application/json'
  };

  // Monta o corpo da requisição com o número do cartão do usuário
  const payload = JSON.stringify({ cardNumber: user.cardNumber });

  // Envia a requisição HTTP POST para a API
  const res = http.post(url, payload, { headers });

  // Validações da resposta da API
  check(res, {
    'status 200': (r) => r.status === 200,                    // Verifica se o status HTTP é 200
    '<=1000ms': (r) => r.timings.duration < 1000,            // Verifica se a resposta chegou em até 1000ms
  });

  // Aguarda 1 segundo antes de enviar a próxima requisição
  sleep(1);
}

// Função executada automaticamente ao final do teste
// Gera o relatório HTML com os resultados do teste
export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data), // Salva o relatório como summary.html
    stdout: '', // Não imprime nada no terminal (opcional)
  };
}
