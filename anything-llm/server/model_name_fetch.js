const axios = require('axios');
const express = require('express');
const app = express();

const base_url = process.env.COMPLETION_MODEL_ENDPOINT;
const url = base_url + '/v1/models';

// Placeholder for the value
let COMPLETION_MODEL_NAME = null;

// Function to fetch the value
async function fetchCompletionModelName() {
    try {
        const response = await axios.get('http://your-api-endpoint.com');
        COMPLETION_MODEL_NAME = response.data.modelName; // Assuming the response contains the model name
        console.log('Model Name Set:', COMPLETION_MODEL_NAME);
    } catch (error) {
        console.error('Error fetching model name:', error);
        // Handle the error (e.g., set a default value or retry)
        COMPLETION_MODEL_NAME = 'defaultModelName';
    }
}

// Fetch the value at startup
fetchCompletionModelName();

// Your application routes
app.get('/', (req, res) => {
    res.send(`Model Name is: ${COMPLETION_MODEL_NAME}`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
