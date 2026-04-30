const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Rota principal - serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rota de teste da API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});

// Rota para verificar usuário (simulada, sem banco)
app.get('/api/user/:email', (req, res) => {
  res.json({ exists: false, plan: 'free', credits: 10 });
});

// Rota para criar assinatura (simulada)
app.post('/api/asaas/create-subscription', (req, res) => {
  res.json({
    success: true,
    checkoutUrl: 'https://sandbox.asaas.com/payment/teste',
    subscriptionId: 'sub_' + Date.now()
  });
});

// Rota para registrar usuário (simulada)
app.post('/api/user/register', (req, res) => {
  const { name, email } = req.body;
  res.json({
    success: true,
    user: { id: Date.now(), name, email, plan: 'free', credits: 10 }
  });
});

// Para qualquer outra rota, enviar o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});