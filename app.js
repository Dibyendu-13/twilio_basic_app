const Fastify = require('fastify');
const Twilio = require('twilio');
const { v4: uuidv4 } = require('uuid'); // Import uuid package
require('dotenv').config(); // Load environment variables
const axios = require('axios'); // Import Axios for HTTP requests

// Define constants
const PORT = process.env.PORT || 5050;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Your OpenAI API Key
const SYSTEM_MESSAGE = 'You are an AI assistant.'; // Define your system message
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token
const twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Initialize Fastify server
const fastify = Fastify();

// Proxy function to handle Twilio media events
fastify.post('/twilio/events', async (req, reply) => {
    const { streamSid } = req.body; // Get the stream SID from the request

    // Handle audio data from Twilio
    twilioClient.calls(streamSid).on('media', (media) => {
        processAudio(media.audioPayload, streamSid);
    });

    reply.send({ status: 'success' });
});

async function processAudio(audioPayload, streamSid) {
    try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', {
            audio: audioPayload,
            model: 'whisper-1' // Replace with the appropriate model if needed
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data; // Get the AI response
        sendToTwilio(streamSid, aiResponse.text); // Send the response back to Twilio
    } catch (error) {
        console.error('Error processing audio:', error);
    }
}

function sendToTwilio(streamSid, responseText) {
    // Send AI text response back to Twilio (customize as needed)
    twilioClient.calls(streamSid).say(responseText);
}

// Start the Fastify server
fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on port ${PORT}`);
});
