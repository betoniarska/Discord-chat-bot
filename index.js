require('dotenv').config(); 
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');


const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


const prefix = '!';

// Send bot online
const channelId = '1277256165381640293';

const prependMsg = "Olet Mestari Yoda, ja vastaat kuin Mestari Yoda vastaisi: "


const openaiApiKey = process.env.OPENAI_API_KEY;


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    
    const channel = client.channels.cache.get(channelId);

    // Check if the channel exists and send a message
    if (channel) {
        channel.send('Bot online')
            .then(() => console.log('Message sent to channel'))
            .catch(console.error);
    } else {
        console.log('Channel not found');
    }
});


async function getChatGPTResponse(prompt) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });

       
        if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
            return response.data.choices[0].message.content.trim();
        } else {
            return 'Sorry, I could not generate a response.';
        }
    } catch (error) {
        console.error('Error fetching response from ChatGPT:', error);
        return 'Sorry, I couldn\'t get a response from ChatGPT.';
    }
}



// Listen for messages
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    console.log('Message received:', message.content);

    
    if (message.content.startsWith(prefix)) {
        console.log('Prefix detected');

        
        const userMessage = prependMsg + message.content.slice(prefix.length).trim();

        if (!userMessage) {
            message.channel.send('Please provide a message after the "!".');
            return;
        }

        try {
            const gptResponse = await getChatGPTResponse(userMessage);
            message.channel.send(gptResponse);
        } catch (error) {
            message.channel.send('Sorry, there was an error processing your request.');
        }
    }
});



client.login(process.env.DISCORD_TOKEN);
