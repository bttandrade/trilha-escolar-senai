import express from 'express';
import cors from 'cors'; // Importe o pacote cors
import stripe from 'stripe';

const app = express();
const stripeInstance = stripe('sk_test_51QEbBwJJV2N8fWL1DgT2E50jaTGCKDn0Juafr1OvzkawMKPwEH1POmcww5kkx38dOT1knStd4ppjs3W4yyftUoa300MmCE6hBb');

// Habilite o CORS
app.use(cors()); // Isso permitirá requisições de qualquer origem

app.use(express.json()); // Para analisar requisições JSON

app.post('/create-checkout-session', async (req, res) => {
    const { planName, planPrice } = req.body;

    const session = await stripeInstance.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'brl',
                product_data: {
                    name: planName
                },
                unit_amount: planPrice * 100
            },
            quantity: 1
        }],
        mode: 'payment',
        success_url: 'https://your-site.com/success',
        cancel_url: 'https://your-site.com/cancel'
    });

    res.json({ id: session.id });
});

app.listen(3000, () => console.log('Server running on port 3000'));
