const stripe = Stripe('pk_test_51QEbBwJJV2N8fWL1zG2QtGGq5AfwxWeIataXmcYS7Gcvkq97PpxvgHYPTfaIQFZr5E0gjR4psg41XC5fBzBcc9Bl00PwKF7T9h'); // Substitua com sua chave pública do Stripe

function redirectToCheckout(planName, planPrice) {
    fetch('/create-checkout-session', { // Sua rota de backend para criar a sessão
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planName, planPrice })
    })
    .then(response => response.json())
    .then(session => {
        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(result => {
        if (result.error) {
            alert(result.error.message);
        }
    });
}
