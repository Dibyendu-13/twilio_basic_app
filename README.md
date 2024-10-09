# Real-Time Audio Processing with Fastify, Twilio, and OpenAI

This project implements a real-time audio processing application using Fastify, Twilio, and the OpenAI API. The application receives audio streams from Twilio, processes them with OpenAI's Whisper model for transcription, and sends the transcribed text back to Twilio.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [WebSocket Connection](#websocket-connection)
- [Configuration](#configuration)
- [License](#license)

## Features

- Real-time audio transcription using OpenAI's Whisper model.
- Integration with Twilio for handling audio streams.
- WebSocket support for immediate audio data processing and response.

## Requirements

- Node.js (version 14 or higher)
- npm (Node package manager)
- A Twilio account with a configured phone number.
- An OpenAI API key.

## Installation

1. Clone the repository:

```
git clone https://github.com/Dibyendu-13/twilio_basic_app
cd twilio_basic_app
```
Install dependencies:
```
npm install
```
Create a .env file in the root directory and add your configuration:
```
PORT=5050
OPENAI_API_KEY=your_openai_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```
Usage
Start the Fastify server:
```
npm start
```
The server will listen on the configured port (default is 5050).
Use a service like ngrok to expose your local server to the internet:
```
ngrok http 5050
```
This will provide you with a public URL that Twilio can use to send media events.
Configure Twilio to send audio events to the /twilio/events endpoint of your ngrok URL.
