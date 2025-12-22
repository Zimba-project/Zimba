const BASE_URL = process.env.EXPO_PUBLIC_API_BASE; 
const AI_SUMMARIZE_URL = `${BASE_URL}/ai/summarize`;

/**
 * Kutsuu backend-palvelua luodakseen tekoälytiivistelmän postaukselle.
 * @param {string} postText - Tiivistettävän postauksen koko teksti.
 * @returns {Promise<string|null>} - Palauttaa tiivistelmätekstin tai null virhetilanteessa.
 */
export const fetchSummary = async (postText,) => {
    if (!postText) {
        console.error("fetchSummary: Postausteksti puuttuu.");
        return null;
    }
    
    console.log("Kutsutaan AI-tiivistystä URL:stä:", AI_SUMMARIZE_URL);

    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        const response = await fetch(AI_SUMMARIZE_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                postText: postText, 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            return data.summary;
        } else if (response.status === 429) {
            // Rate limit ylittyi (HTTP 429 Too Many Requests)
            console.warn("Rajoitus ylittyi:", data.message);
            return "Olet tehnyt liian monta tiivistyspyyntöä. Kokeile myöhemmin.";
        } else {
            // Muut virheet (esim. 401 Unauthorized, 500 Internal Server Error)
            console.error('API-virhe:', data.message);
            return 'Tiivistelmän luomisessa tapahtui virhe.';
        }
    } catch (error) {
        console.error('Verkko- tai palvelinvirhe:', error);
        return 'Yhteyden muodostaminen palvelimeen epäonnistui.';
    }
};