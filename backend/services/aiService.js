
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

    log('info', 'Aloitetaan AI-analyysin luonti...');

    // Tiivistelmäprompt tässä. Voidaan vielä hiota tarvittaessa erilaiseksi
    // Recap promt. Can be modified as needed.
    const prompt = `Analysoi annettu teksti. Sen pitäisi sisältää jokin esitys, projekti, tai vaihtoehto. Luo täydellinen analyysi, joka sisältää KAIKKI seuraavat 5 pakollista osaa:

    1. Tiivistelmä (recap): Lyhyt, 1-2 lauseen neutraali yhteenveto siitä, mistä tekstissä on kyse.
    2. Plussat (pros): Listaa 2-3 keskeistä neutraalia hyötyä tai positiivista seurausta.
    3. Miinukset (cons): Listaa 2-3 keskeistä neutraalia riskiä, epävarmuutta tai negatiivista näkökohtaa.
    4. Vaikutus (impact): Lyhyt lause siitä, miten tämä vaikuttaa ihmisten arkeen tai yhteiskuntaan.
    5. Kysymykset (suggestions): Listaa 2-3 tärkeää kysymystä keskustelua varten.

    Vastaa AINOASTAAN JSON-muodossa. KAIKKI kentät ovat PAKOLLISIA:
    {
      "recap": "Lyhyt yhteenveto",
      "pros": ["Hyöty 1", "Hyöty 2", "Hyöty 3"],
      "cons": ["Haitta 1", "Haitta 2", "Haitta 3"],
      "impact": "Lyhyt kuvaus vaikutuksesta arkeen",
      "suggestions": ["Kysymys 1?", "Kysymys 2?", "Kysymys 3?"]
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

        // Varmista että kaikki kentät ovat olemassa
        const validatedAnalysis = {
            recap: analysis.recap || 'Yhteenveto ei saatavilla',
            pros: Array.isArray(analysis.pros) ? analysis.pros : ['Ei plussoja saatavilla'],
            cons: Array.isArray(analysis.cons) ? analysis.cons : ['Ei miinuksia saatavilla'],
            impact: analysis.impact || 'Vaikutusta ei määritelty',
            suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : ['Ei kysymyksiä saatavilla']
        };

        log('info', `AI-analyysi saatu: recap=${!!validatedAnalysis.recap}, pros=${validatedAnalysis.pros.length}, cons=${validatedAnalysis.cons.length}, impact=${!!validatedAnalysis.impact}, suggestions=${validatedAnalysis.suggestions.length}`);

        return validatedAnalysis;

    } catch (error) {

        log('error', `Gemini API-virhe tai JSON-jäsentelyvirhe: ${error.message}`);

        if (response && response.text) {
            log('error', `Virheellinen raaka vastaus: ${response.text.substring(0, 100)}...`);
        }

        throw new Error('Virhe tekoälypalvelussa tiivistelmän luomisessa.');
    }
}

/**
 * @param {string} userMessage - Käyttäjän valitsema kysymyys
 * @param {string} contextText - Alkuperäinen postaus/uutinen
 * @returns {Promise<string>} - Tekoälyn vastaus tekstinä
 */

async function getChatAnswer(userMessage, contextText) {
    log('info', 'Aloitetaan chat-vastauksen luonti...');

    const prompt = `Olet Zimban AI-avustaja. Tehtäväsi on auttaa käyttäjää ymmärtämään seuraavaa aihetta. 
    Vastaa ystävällisesti, neutraalisti ja tiiviisti (max 3-4 lausetta). 
    Jos vastausta ei löydy tekstistä, sano se rehellisesti.

    AIHEEN KONTEKSTI:
    "${contextText}"

    KÄYTTÄJÄN KYSYMYS:
    "${userMessage}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: prompt,
            config: {
                temperature: 0.7, 
            },
        });

        return response.text.trim();
    } catch (error) {
        log('error', `Chat API-virhe: ${error.message}`);
        throw new Error('Virhe tekoälypalvelussa viestiin vastaamisessa.');
    }
}

module.exports = { getSummary, getChatAnswer };