import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { sleep, check, group } from 'k6';
import { getBaseUrl } from './helpers/baseUrl.js';
import { Trend } from 'k6/metrics';
import faker from "k6/x/faker"

const postLoanDurationTrend = new Trend('post_loan_duration');

export const options = {
    thresholds: {
        http_req_duration: ['p(90)<=1000', 'p(95)<=1300'],
        http_req_failed: ['rate<0.01']
    },
    stages: [
        { duration: '3s', target: 10 },
        { duration: '15s', target: 10 },
        { duration: '3s', target: 60 },
        { duration: '4s', target: 0 }
    ],
};

const BASE_URL = getBaseUrl();

export default function() {
    const uniqueSuffix = `${__VU}-${__ITER}-${Date.now() % 1000}`;
    const username = `${faker.person.firstName()}-${uniqueSuffix}`;
    const password = faker.internet.password();

    group('register', () => {
        const responseRegisterUser = http.post(
            `${BASE_URL}/api/register`,
            JSON.stringify({ username, password }),
            { headers: { 'Content-Type': 'application/json' } }
        );

        check(responseRegisterUser, {
            'Usuário cadastrado. Status Code 201': (r) => r.status == 201
        });
        //console.log('register status', responseRegisterUser.status);

        if (responseRegisterUser.status !== 201) {
            return;
        }
    });

    group('login', () => {
        const responseUserLogin = http.post(
            `${BASE_URL}/api/login`,
            JSON.stringify({ username, password }),
            { headers: { 'Content-Type': 'application/json' } }
        );

        check(responseUserLogin, {
            'Login OK. Status Code 200': (r) => r.status === 200,
            'Token present': (r) => r.status === 200 && !!r.json('token')
        });

        if (responseUserLogin.status !== 200) {
            return;
        }

        group('loan & return', () => {
            const responseLoans = http.post(
                `${BASE_URL}/api/loans`,
                JSON.stringify({ bookId: 3 }),
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${responseUserLogin.json('token')}` } }
            );

            check(responseLoans, {
                'Empréstimo realizado. Status Code 201': (r) => r.status == 201
            });

            postLoanDurationTrend.add(responseLoans.timings.duration);

            const loanId = responseLoans.json('loanId');
            if (!loanId) return;

            const responseReturns = http.post(
                `${BASE_URL}/api/returns`,
                JSON.stringify({ loanId }),
                { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${responseUserLogin.json('token')}` } }
            );

            check(responseReturns, {
                'Devolução OK! Status Code 200': (r) => r.status == 200
            });
        });
    });

    sleep(1);
}