// Importa o módulo HTTP do k6 para realizar requisições
import http from 'k6/http';

// Importa funções úteis para checagem de respostas e pausas entre execuções
import { check, sleep } from 'k6';

// Importa gerador de relatório HTML externo
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Importa o tipo de métrica Counter para contadores personalizados
import { Counter } from 'k6/metrics';

// Criação dos contadores para status HTTP específicos
export const status_200 = new Counter('respostas_200');
export const status_401 = new Counter('respostas_401');
export const status_500 = new Counter('respostas_500');
export const outros_status = new Counter('respostas_outros');

// Define as configurações do teste de carga
export const options = {
  vus: 2,               // Número de usuários virtuais simultâneos
  duration: '1m',       // Tempo total do teste
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% das requisições devem ter duração < 1000ms
    http_req_failed: ['rate<0.01'],     // Menos de 1% das requisições devem falhar
  },
};

// Lista de usuários (token e número do cartão) passados por variáveis de ambiente
const users = [
  {
    token: __ENV.TOKEN_CARAPICUIBA,
    cardNumber: __ENV.CARTAO_CARAPICUIBA,
  },
  {
    token: __ENV.TOKEN_PINHAIS,
    cardNumber: __ENV.CARTAO_PINHAIS,
  }
];

// Função principal executada por cada VU durante o teste
export default function () {
  // Seleciona o usuário de forma cíclica com base no número da VU
  const user = users[(__VU - 1) % users.length];

  // Monta a URL com o número do cartão
  const url = `https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/${user.cardNumber}`;

  // Cabeçalhos da requisição, incluindo token
  const headers = {
    'Auth-Token': user.token,
  };

  // Envia a requisição GET com os cabeçalhos definidos
  const res = http.get(url, { headers });

  // Se a resposta não for 200, exibe detalhes no console para análise
  if (res.status !== 200) {
    console.log(`>>> VU ${__VU} recebeu status HTTP ${res.status}`);
    console.log(`URL chamada: ${url}`);
    console.log(`Token usado: ${user.token}`);
    console.log(`Resposta body: ${res.body}`);
  }

  // Atualiza os contadores com base no status da resposta
  switch (res.status) {
    case 200:
      status_200.add(1);
      break;
    case 401:
      status_401.add(1);
      break;
    case 500:
      status_500.add(1);
      break;
    default:
      outros_status.add(1);
  }

  // Validações básicas da resposta
  check(res, {
    'status 200': (r) => r.status === 200,                  // Verifica se o status é 200
    '<=1000ms': (r) => r.timings.duration < 1000,           // Verifica se a duração foi menor que 1000ms
  });

  // Espera 1 segundo antes de repetir a execução
  sleep(1);
}

// Gera o resumo do teste após a execução
export function handleSummary(data) {
  // Obtém os valores dos contadores manualmente (sem usar ?. que não é suportado no K6)
  const total200 = data.metrics['respostas_200'] && data.metrics['respostas_200'].values && data.metrics['respostas_200'].values.count
    ? data.metrics['respostas_200'].values.count : 0;

  const total401 = data.metrics['respostas_401'] && data.metrics['respostas_401'].values && data.metrics['respostas_401'].values.count
    ? data.metrics['respostas_401'].values.count : 0;

  const total500 = data.metrics['respostas_500'] && data.metrics['respostas_500'].values && data.metrics['respostas_500'].values.count
    ? data.metrics['respostas_500'].values.count : 0;

  const totalOutros = data.metrics['respostas_outros'] && data.metrics['respostas_outros'].values && data.metrics['respostas_outros'].values.count
    ? data.metrics['respostas_outros'].values.count : 0;

  // Exibe um resumo personalizado no terminal
  console.log('\n========== RESUMO PERSONALIZADO ==========');
  console.log(`Total de respostas 200: ${total200}`);
  console.log(`Total de respostas 401: ${total401}`);
  console.log(`Total de respostas 500: ${total500}`);
  console.log(`Total de outros status: ${totalOutros}`);
  console.log('==========================================\n');

  // Gera relatório HTML e retorna para exportação
  return {
    'summary.html': htmlReport(data),  // Gera o arquivo summary.html com gráfico e métricas
    stdout: '',                         // Oculta o resumo padrão do K6
  };
}
