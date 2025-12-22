
require('dotenv').config(); 


const { getSummary } = require('./services/aiService'); 

// Test data.

const articlePost = `
Household expenses are rising across Europe. At IKEA, we want to find solutions that make 
everyday life easier — without compromising on quality or sustainability. 
For example, simple changes like using energy-efficient LED bulbs 
and planning meals in advance can dramatically cut down costs. Our new sustainability 
report highlights that up to 40% of household energy consumption comes from heating 
and cooling, meaning proper insulation and smart thermostats are key areas for 
long-term savings. We plan to launch a new line of smart home products focusing on 
energy conservation in Q3 2026.
`;

const pollPost = `
Should the wolf population be increased or decreased? According to the most recent 
population estimate, in March 2025 there were approximately 430 wolves in Finland 
and around 76 wolf territories. The wolf population grew by as much as 46 percent 
compared to the previous year. Participate and have your say.
`;

// Test datas summary.

async function runTests() {
    
    
    // Testi 1: Pitkä Artikkeli (IKEA)
    console.log("\n### 1. Testi: Pitkän artikkelin tiivistys (IKEA)");
    try {
        const summary1 = await getSummary(articlePost);
        console.log(" ONNISTUI. Tiivistelmä:");
        console.log("-----------------------------------------");
        console.log(summary1);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error(" EPÄONNISTUI (IKEA):", error.message);
    }

    // Testi 2: Lyhyt Kysely/Keskustelu (Susi)
    console.log("\n### 2. Testi: Kyselyn taustatekstin tiivistys (Susi)");
    try {
        const summary2 = await getSummary(pollPost);
        console.log("ONNISTUI. Tiivistelmä:");
        console.log("-----------------------------------------");
        console.log(summary2);
        console.log("-----------------------------------------");
    } catch (error) {
        console.error(" EPÄONNISTUI (Susi):", error.message);
    }

}

runTests();