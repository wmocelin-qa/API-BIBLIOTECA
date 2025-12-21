import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { sleep, check } from 'k6';
import { getBaseUrl } from './helpers/baseUrl.js';
import { Trend } from 'k6/metrics';
import faker from "k6/x/faker"

const postLoanDurationTrend = new Trend('post_loan_duration');

export const options = {
    thresholds: {
        http_req_duration: ['p(90)<=1000', 'p(95)<=1200'],
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
    let responseRegisterUser = http.post(
        `${BASE_URL}/api/register`,
        JSON.stringify({
            username: `${faker.person.firstName()} ${faker.person.lastName()}`,
            password: faker.internet.password()
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        check(responseRegisterUser, {
        'Usuário cadastrado. Status Code 201': (r) => r.status == 201
        })
        console.log(responseRegisterUser.status)

        sleep(1);

    let responseUserLogin = http.post(
        `${BASE_URL}/api/login`,
        JSON.stringify({
            username: "juninho",
            password: "1234"
    }),
    {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    //console.log(responseUserLogin.json('token'))
    sleep(1);

    let responseLoans = http.post(
        `${BASE_URL}/api/loans`,
        JSON.stringify({
            bookId: 3
        }),
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${responseUserLogin.json('token')}`
        }
    });

    //console.log(responseLoans.status)
    check(responseLoans, {
        'Empréstimo realizado. Status Code 201': (r) => r.status == 201
    })

    postLoanDurationTrend.add(responseLoans.timings.duration);

    const loanId = responseLoans.json('loanId');

    let responseReturns = http.post(
        `${BASE_URL}/api/returns`,
        JSON.stringify({
            loanId: loanId
        }),
    {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${responseUserLogin.json('token')}`
        }
    });
    
    console.log(responseReturns.status)
    check(responseReturns, {
        'Devolução OK! Status Code 200': (r) => r.status == 200
    })
}