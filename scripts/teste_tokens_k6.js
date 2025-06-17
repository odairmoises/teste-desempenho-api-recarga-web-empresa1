import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '5m', target: 5 }, // 5 usuários
    { duration: '5m', target: 7 }, // 7 usuários
    { duration: '2m', target: 0 },  // ramp down
  ],
};

const urls = [
  'https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/36085510756931076',
  'https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/466399166'
];

const tokens = [
  'cmV2ZW5kYSBlbXByZXNhMSBzdGc1RFNDYXJhcGljdWliYQ==',
  'cmV2ZW5kYSBlbXByZXNhMSBzdGc1RFM='
];

export default function () {
  let idx = __VU % 2; // alterna entre 0 e 1 para escolher usuário/token
  let url = urls[idx];
  let headers = {
    'Auth-Token': tokens[idx],
    'Cookie': 'JSESSIONID=w6OMy2Wa1DZaVYkG8ad95wB4dy8dSsy2SlMcblIo.gde-aut12'
  };

  let res = http.get(url, { headers: headers });

  check(res, {
    'status 200': (r) => r.status === 200,
    'body exists': (r) => r.body.length > 0,
  });

  sleep(1);
}