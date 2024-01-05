// const axios = require('axios');

// async function fetchModelName(url) {
//     return axios.get(url, {
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(response => {
//         return response.data.data[0].id; 
//     })
//     .catch(error => {
//         console.error('Error fetching model name:', error);
//         return null; // Return null or any default value in case of error
//     });
// }

// module.exports = {
//     fetchModelName
// };

const request = require('sync-request');

function fetchModelName(url) {
    try {
        const response = request('GET', url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const data = JSON.parse(response.getBody('utf8'));
        return data.data[0].id;
    } catch (error) {
        console.error('Error fetching model name:', error);
        return null; // Return null or any default value in case of error
    }
}

module.exports = {
    fetchModelName
};
