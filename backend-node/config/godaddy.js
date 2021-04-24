exports.addNewSubdomain = ({ name }) => {

    return new Promise((resolve, reject) => {

        if (!name) {
            reject()
        }

        const payload = [
            {
                "data": "54.211.178.127",
                "name": name,
                "ttl": 1000,
                "type": "A"
            }
        ];

        const url = `https://api.godaddy.com/v1/domains/struct.services/records`;
        APIHelper({ url, method: "PATCH", payload })
            .then(data => resolve('New domain created successfully'))
            .catch(error => {
                console.log('Error at the time of creating subdomain', error);
                reject(error);
            })
    })
}

exports.isDomainAlreadyExist = ({ name }) => {
    return new Promise((resolve, reject) => {
        const url = `https://api.godaddy.com/v1/domains/struct.services/records/A/${name}`;
        APIHelper({ url, method: "GET", data })
            .then(data => data.json())
            .then(data => {
                if (data.length > 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            })
            .catch(error => {
                reject(error);
            })
    })
}


exports.updateSubDomainName = ({ name }) => {
    return new Promise((resolve, reject) => {
        const payload = [
            {
                "data": "54.211.178.127",
                "name": name,
                "ttl": 1000,
                "type": "A"
            }
        ];

        const url = `https://api.godaddy.com/v1/domains/struct.services/records/A/${name}`;
        APIHelper({ url, method: "PUT", payload })
            .then(data => resolve('Subdomain updated sucessfully'))
            .catch(error => {
                reject(error);
            })
    })
}

const APIHelper = ({ url, method, payload = {} }) => {
    return fetch(url, {
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": "sso-key eoWr8zUBfscJ_S2obcNwns1usSR5TyKqkj9:X2MVbJexRRJcWZ3Qn2v16e"
        },
        body: JSON.stringify(payload)
    })
}