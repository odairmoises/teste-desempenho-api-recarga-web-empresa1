import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

export let options = {
  stages: [
    { duration: '2m', target: 40 }, // até 40 VUs
    { duration: '1m', target: 20 }, // manter 40 VUs
    { duration: '2m', target: 0 },  // ramp down
  ],
};

let responseTime = new Trend('response_time');
let errorRate = new Rate('error_rate');
let callsUser1 = new Counter('calls_user1');
let callsUser2 = new Counter('calls_user2');

const tokenUser1 = 'cmV2ZW5kYSBlbXByZXNhMSBzdGc1RFNDYXJhcGljdWliYQ==';
const tokenUser2 = 'cmV2ZW5kYSBlbXByZXNhMSBzdGc1RFM=';

export default function () {
  // VUs 1 a 20 usam tokenUser1, VUs 21 a 40 usam tokenUser2
  let token = (__VU <= 20) ? tokenUser1 : tokenUser2;

  let urlUser1 = 'https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/36085510756931076';
  let urlUser2 = 'https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/466399166';

  let url = (token === tokenUser1) ? urlUser1 : urlUser2;

  let res = http.get(url, { headers: { 'Auth-Token': token } });

  let success = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  if (token === tokenUser1) callsUser1.add(1);
  else callsUser2.add(1);

  if (!success) errorRate.add(1);

  responseTime.add(res.timings.duration);
}
