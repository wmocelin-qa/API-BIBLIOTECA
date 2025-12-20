import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { sleep, check } from 'k6';
import { getBaseUrl } from './helpers/baseUrl.js';
import { Trend } from 'k6/metrics';

const postLoanDurationTrend = new Trend('post_loan_duration');

export const options = {
    vus: 15,
    duration: "30s",
    thresholds: {
        http_req_duration: ['p(90)<=55', 'p(95)<=65'],
        http_req_failed: ['rate<0.01']
    }
}

const BASE_URL = getBaseUrl();

export default function() {
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
    
    //console.log(responseReturns.status)
    check(responseReturns, {
        'Devolução OK! Status Code 200': (r) => r.status == 200
    })
}