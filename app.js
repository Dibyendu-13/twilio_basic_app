const Fastify = require('fastify');
const Twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const WebSocket = require('ws'); // Import WebSocket
require('dotenv').config();

const PORT = process.env.PORT || 5050;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const fastify = Fastify();

// WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const { audioPayload, streamSid } = JSON.parse(message);
        await processAudio(audioPayload, streamSid, ws);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Upgrade Fastify server to support WebSocket
fastify.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Endpoint for Twilio to notify about media events
fastify.post('/twilio/events', (req, reply) => {
    const { streamSid } = req.body;

    // Handle incoming audio data from Twilio
    twilioClient.calls(streamSid).on('media', (media) => {
        // Send audio payload to WebSocket for real-time processing
        const wsClients = Array.from(wss.clients).filter(client => client.readyState === WebSocket.OPEN);
        wsClients.forEach(client => {
            client.send(JSON.stringify({ audioPayload: media.audioPayload, streamSid }));
        });
    });

    reply.send({ status: 'success' });
});

// Function to process audio and send back AI response in real-time
async function processAudio(audioPayload, streamSid, ws) {
    try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', {
            audio: audioPayload,
            model: 'whisper-1'
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.text;
        sendToTwilio(streamSid, aiResponse, ws);
    } catch (error) {
        console.error('Error processing audio:', error);
        ws.send(JSON.stringify({ error: 'Failed to process audio' }));
    }
}

// Function to send AI response back to Twilio
function sendToTwilio(streamSid, responseText, ws) {
    twilioClient.calls(streamSid).say(responseText)
        .then(() => {
            ws.send(JSON.stringify({ success: 'Response sent to Twilio' }));
        })
        .catch(error => {
            console.error('Error sending response to Twilio:', error);
        });
}

// Start the Fastify server
fastify.listen({ port: PORT }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is listening on port ${PORT}`);
});
