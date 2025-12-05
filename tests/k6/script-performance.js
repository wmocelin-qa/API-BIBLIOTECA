import http from 'k6/http';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";
import { sleep, check } from 'k6';

export const options = {
    vus: 15,
    duration: "10s",
    thresholds: {
        http_req_duration: ['p(90)<=55', 'p(95)<=65'],
        http_req_failed: ['rate<0.01']
    }
}

export default function() {
    let responseUserLogin = http.post(
        'http://localhost:3000/api/login',
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
        'http://localhost:3000/api/loans',
        JSON.stringify({
            bookId: 2
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

    const loanId = responseLoans.json('loanId');

    let responseReturns = http.post(
        'http://localhost:3000/api/returns',
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