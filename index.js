const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
const axios = require('axios');
const fs = require('fs');

const envInfo = require('../env');

const textToSpeech = new TextToSpeechV1({
    iam_apikey: envInfo.env.watsonKey,
    url: 'https://stream.watsonplatform.net/text-to-speech/api'
});

const NAME = 'Rider';


axios.get('https://api.adviceslip.com/advice').then(resp => {
    return resp;
}).then(resp => {
    let advice = resp.data.slip.advice;

    axios.get(`https://api.airvisual.com/v2/nearest_city?lat=40.235119&lon=-111.662193&key=${envInfo.env.airvisualKey}`).then(airResp => {
        const temp = (airResp.data.data.current.weather.tp * 1.8) + 32;
        const iconNumber = airResp.data.data.current.weather.ic;
        const pollutionNumber = airResp.data.data.current.pollution.aqius;

        let weather;

        switch (iconNumber) {
            case '01d':
                weather = 'clear sky';
                break;
            case '01n':
                weather = 'clear sky';
                break;
            case '02d':
                weather = 'few clouds';
                break;
            case '02n':
                weather = 'few clouds';
                break;
            case '03d':
                weather = 'scattered clouds';
                break;
            case '04d':
                weather = 'mostly cloudy';
                break;
            case '09d':
                weather = 'rain showers';
                break;
            case '10d':
                weather = 'rain';
                break;
            case '11d':
                weather = 'thunderstorms';
                break;
            case '13d':
                weather = 'snow';
                break;
            case '50d':
                weather = 'misty';
                break;
            default:
                weather = 'unknown';
        }

        let pollutionConcern;

        if (pollutionNumber <= 50) {
            pollutionConcern = 'good';
        } else if (pollutionNumber <= 100) {
            pollutionConcern = 'moderate';
        } else if (pollutionNumber <= 150) {
            pollutionConcern = 'unhealthy for sensitive groups';
        } else if (pollutionNumber <= 200) {
            pollutionConcern = 'unhealthy';
        } else if (pollutionNumber <= 300) {
            pollutionConcern = 'very unhealthy';
        } else if (pollutionNumber <= 500) {
            pollutionConcern = 'hazardous';
        } else {
            pollutionConcern = 'unknown';
        }

        axios.get('https://api.sunrise-sunset.org/json?lat=36.7201600&lng=-4.4203400&date=today').then(sunriseResp => {
            const sunriseArray = sunriseResp.data.results.sunrise.split(':');

            const synthesizeParams = {
                text: `
                Good morning ${NAME}. 
                The weather will be ${weather} and the temperature is ${temp} fahrenheit.
                Sunrise is at ${parseInt(sunriseArray[0]) +1}:${parseInt(sunriseArray[1])} A.M.
                The air today is ${pollutionConcern}. 
                Today's advice: ${advice}`,
                accept: 'audio/wav',
                voice: 'en-US_AllisonVoice'
            };

            textToSpeech.synthesize(synthesizeParams, function (err, buffer) {
                if (err) {
                    console.log(err);
                } else {
                    const d = new Date();
                    fs.writeFile(`./audio/audio-${d.getSeconds()}-${d.getMinutes()}-${d.getHours()}.wav`, buffer, () => {
                        console.log('File is written')
                    })
                }
            });
        })
    })
}).catch(err => console.log(err));