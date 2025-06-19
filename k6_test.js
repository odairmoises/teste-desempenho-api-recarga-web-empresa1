import http from 'k6/http';
import { check, sleep } from 'k6';

const url = 'https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/';
const token_carapicuiba = __ENV.TOKEN_CARAPICUIBA;
const token_pinhais = __ENV.TOKEN_PINHAIS;
const usuario_carapicuiba = __ENV.CARTAO_CARAPICUIBA;
const usuario_pinhais = __ENV.CARTAO_PINHAIS;

export const options = {
  scenarios: {
    user1: {
      executor: 'ramping-vus',
      exec: 'user1Scenario',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 6 },
        { duration: '2m', target: 6 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    user2: {
      executor: 'ramping-vus',
      exec: 'user2Scenario',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 6 },
        { duration: '2m', target: 6 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    }
  },
};

export function user1Scenario() {
  const res = http.get(`${url}${usuario_carapicuiba}`, {
    headers: {
      'Auth-Token': token_carapicuiba,
      // 'Cookie': 'JSESSIONID=...' // se necessário
    },
  });

  check(res, {
    'status eh 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function user2Scenario() {
  const res = http.get(`${url}${usuario_pinhais}`, {
    headers: {
      'Auth-Token': token_pinhais,
      // 'Cookie': 'JSESSIONID=...' // se necessário
    },
  });

  check(res, {
    'status eh 200': (r) => r.status === 200,
  });

  sleep(1);
}
