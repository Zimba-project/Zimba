const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit'); 
const { getSummary } = require('../services/aiService'); 


const summaryLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minuuttia millisekunteina
    max: 10, // Salli 10 pyyntöä / 10 min
    message: {
        status: 'error',
        message: 'Olet ylittänyt tiivistyspyyntöjen enimmäismäärän (10 kpl / 10 min). Kokeile myöhemmin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post(
    '/summarize',      
    summaryLimiter,     
    async (req, res) => {
       
        const { postText } = req.body; 

        if (!postText) {
            return res.status(400).json({ message: 'Postaus-teksti (postText) puuttuu pyynnöstä.' });
        }

        try {
            
            const summary = await getSummary(postText); 
            
            
            res.json({
                status: 'success',
                summary: summary 
            });

        } catch (error) {
            console.error(`AI Error for user ${req.userId}:`, error.message);
            
            res.status(500).json({ message: 'Tekoälypalveluun liittynyt virhe. Kokeile uudelleen.' });
        }
    }
);

module.exports = router;