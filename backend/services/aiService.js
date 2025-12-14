
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({}); 


const log = (level, message) => {
    const timestamp = new Date().toISOString(); 
    console.log(`[${timestamp}] [${level.toUpperCase()}]: ${message}`);
};

/**
 * @param {string} postText 
 * @returns {Promise<Object>} 
 */
async function getSummary(postText) {
    
    log('info', 'Aloitetaan kolmiosaisen AI-analyysin luonti...');

    // Tiivistelmäprompt tässä. Voidaan vielä hiota tarvittaessa erilaiseksi
    // Recap promt. Can be modified as needed.
    const prompt = `Analysoi annettu teksti. Sen pitäisi sisältää jokin esitys, projekti, tai vaihtoehto. Luo tiivistelmä, joka sisältää tasan kolme (3) erillistä osaa:
    1. Tiivistelmä (Context Recap): Lyhyt, 1-2 lauseen neutraali yhteenveto siitä, mistä tekstissä on kyse.
    2. Plussat (Pros): Listaa 2-3 keskeistä neutraalia hyötyä tai positiivista seurausta, jotka mainitaan tai viitataan tekstissä.
    3. Miinukset (Cons): Listaa 2-3 keskeistä neutraalia riskiä, epävarmuutta tai negatiivista näkökohtaa, jotka mainitaan tai viitataan tekstissä.

    Vastaa AINOASTAAN JSON-muodossa, jossa on seuraavat kentät:
    {
      "recap": "[Lyhyt yhteenveto]",
      "pros": ["[Hyöty 1]", "[Hyöty 2]", "..."],
      "cons": ["[Haitta 1]", "[Haitta 2]", "..."]
    }

    Teksti analysoitavaksi: "${postText}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: prompt,
            config: {
                 temperature: 0.2, 
                 responseMimeType: "application/json", 
            },
        });

        
        let jsonString = response.text.trim();
        
        
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.lastIndexOf('```')).trim();
        } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.substring(3, jsonString.lastIndexOf('```')).trim();
        }

       
        const analysis = JSON.parse(jsonString); 
        
        log('info', 'Kolmiosainen AI-analyysi saatu onnistuneesti ja jäsennetty.');

        return analysis; 
        
    } catch (error) {
        
        log('error', `Gemini API-virhe tai JSON-jäsentelyvirhe: ${error.message}`);
        
        if (response && response.text) {
             log('error', `Virheellinen raaka vastaus: ${response.text.substring(0, 100)}...`);
        }
        
        throw new Error('Virhe tekoälypalvelussa tiivistelmän luomisessa.');
    }
}

module.exports = { getSummary };