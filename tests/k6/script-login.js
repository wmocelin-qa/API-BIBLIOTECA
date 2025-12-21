import http from 'k6/http';
import { check, sleep } from 'k6';
import { getBaseUrl } from './helpers/baseUrl.js';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

const users = new SharedArray('users', function () {
    return JSON.parse(open('./data/login.test.data.json'));
})
const loginDuration = new Trend('login_duration');

export let options = {
    vus: 3,
    iterations: 3,
    thresholds: {
        http_req_duration: ['p(95)<2000'], 
    },
}

const BASE_URL = getBaseUrl();

export default function() {
    const user = users[(__VU - 1)];
    const username = user.username;
    const password = user.password;

    const res = http.post(
        `${BASE_URL}/api/login`,
        JSON.stringify({ 
            username: username, 
            password: password 
    }),
    { 
        headers: { 'Content-Type': 'application/json' } 
    });

  check(res, {
    'Login OK. Status Code 200': (r) => r.status === 200
  });

  loginDuration.add(res.timings.duration);
  sleep(1);
}
