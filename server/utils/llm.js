const axios = require('axios');

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY; 

const togetherGenerateInsight = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.together.xyz/inference',
      {
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        prompt,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        stop: ["</s>", "\n\n"],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Together API response:', response.data.choices[0].text);
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Together API error:', error.response?.data || error.message);
    return null;
  }
};


module.exports = togetherGenerateInsight;
