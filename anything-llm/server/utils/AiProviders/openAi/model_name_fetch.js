const axios = require('axios');

async function fetchModelName(url) {
    return axios.get(url, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        return response.data.data[0].id; 
    })
    .catch(error => {
        console.error('Error fetching model name:', error);
        return null; // Return null or any default value in case of error
    });
}

module.exports = {
    fetchModelName
};
