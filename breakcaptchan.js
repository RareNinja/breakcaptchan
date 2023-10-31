import request from 'axios';
import { stringify } from 'qs';
import perfil from './keycaptcha.js';

const quebraCaptcha = async (googleKey) => {
    // O googleKey é a src do recaptcha v2 que naturalmente é um pedaço da url do captcha ex.:
    // url do captch: https://www.google.com/recaptcha/api2/anchor?ar=1&k=6LfA-z8UAAAAABccXImPL5eQjvW-vkEXxh5UCs_3&co=aHR0cHM6Ly9wb3J0YWx1bmljby5zaXNjb21leC5nb3YuYnI6NDQz&hl=pt-BR&v=vm_YDiq1BiI3a8zfbIPZjtF2&size=normal&cb=buh8ockisb24
    // googleKey.: 6LfA-z8UAAAAABccXImPL5eQjvW-vkEXxh5UCs_3
    // inicia "1&k=" e termina "&co=" da url, costumo obter com REGEX - Expressão regular.
    try {
        const url = 'https://portalunico.siscomex.gov.br/portal'; // Url do site onde esta o capchan
        const baseuri = 'http://api.dbcapi.me/'; // URI base do deathbycaptcha usando nas requisições
        let numeroCaptcha = ''; // retorno da primeira requisição numero do captchan
        let textValue = ''; // hesh da segunda requisição do captcha já quebrado 

        const data = stringify({
            'username': perfil.login, // login do deathbycaptcha
            'password': perfil.password, // senha do deathbycaptcha
            'type': '4',
            'token_params': `{ "proxy": "", "proxytype": "", "googlekey": "${googleKey}", "pageurl": "${url}"}`
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${baseuri}api/captcha?username=${perfil.login}&password=${perfil.password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': 'BACKEND=E|ZT8Gd|ZT8D/'
            },
            data: data
        };

        request(config)
            .then((response) => {
                const result = response.data;

                numeroCaptcha = result.captcha; // Com o retorno da API obtenha a chave do capcha solitado para quebra.

                console.log(numeroCaptcha);
            })
            .catch((error) => {
                console.log(error);
            });

        do {
            // dowhile é responsavel por fazer requisições GET para saber se retornou o hesh da quebra do captcha.
            const configf = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${baseuri}api/captcha/${numeroCaptcha}`,
                headers: {
                    'Cookie': 'BACKEND=E|ZT+3B|ZT+0q'
                },
            };

            request(configf)
                .then((responsef) => {
                    const result = responsef.data;

                    textValue = result.text;

                    console.log(textValue);

                })
                .catch((error) => {
                    console.log(error);
                });

            if (!textValue) {
                await new Promise(resolve => setTimeout(resolve, 10000));
            }

        } while (!textValue);
        return textValue;
        // O retorno de hesh é para colocar no g-recaptcha-response exemplo document.querySelector("#g-recaptcha-response").innerHTML = textValue
        // Normalmente tem que procurar o callback do captcha para resolve-lo. 

    } catch (error) {
        console.log(error);
        return `${error}`;
    }
}

export default { quebraCaptcha };