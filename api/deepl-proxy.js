// API proxy para DeepL
// Este arquivo deve ser executado como um servidor Node.js separado
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3031; // Mudando a porta para evitar conflitos
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Mapeamento de nomes de idiomas para códigos ISO da DeepL
const languageMap = {
  // Português
  'português': 'PT',
  'portugues': 'PT',
  'portuguese': 'PT',
  'pt': 'PT',
  
  // Inglês
  'inglês': 'EN',
  'ingles': 'EN',
  'english': 'EN',
  'en': 'EN',
  
  // Espanhol
  'espanhol': 'ES',
  'spanish': 'ES',
  'es': 'ES',
  
  // Francês
  'francês': 'FR',
  'frances': 'FR',
  'french': 'FR',
  'fr': 'FR',
  
  // Alemão
  'alemão': 'DE',
  'alemao': 'DE',
  'german': 'DE',
  'de': 'DE',
  
  // Italiano
  'italiano': 'IT',
  'italian': 'IT',
  'it': 'IT',
  
  // Japonês
  'japonês': 'JA',
  'japones': 'JA',
  'japanese': 'JA',
  'ja': 'JA',
  
  // Chinês
  'chinês': 'ZH',
  'chines': 'ZH',
  'chinese': 'ZH',
  'zh': 'ZH',
  
  // Mais idiomas podem ser adicionados conforme necessário
};

// Função para converter nome do idioma para código ISO
function getLanguageCode(language) {
  if (!language) return null;
  
  // Normalizar: converter para minúsculas e remover acentos
  const normalized = language.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Verificar se o código já está correto
  if (normalized.length === 2 && normalized === normalized.toUpperCase()) {
    return normalized;
  }
  
  // Buscar no mapeamento
  return languageMap[normalized] || null;
}

// Configurações
const DEEPL_API_KEY = process.env.DEEPL_AUTH_KEY;
const DEEPL_BASE_URL = 'https://api.deepl.com/v2';

if (!DEEPL_API_KEY) {
  console.error('ERRO: Variável de ambiente DEEPL_AUTH_KEY não está definida!');
}

// Endpoint para tradução de texto
app.post('/translate-text', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, formality } = req.body;
    
    const formData = new FormData();
    formData.append('text', text);
    
    // Converter nomes de idiomas para códigos ISO
    const targetLang = getLanguageCode(targetLanguage);
    if (!targetLang) {
      return res.status(400).json({
        error: `Idioma de destino '${targetLanguage}' não reconhecido`
      });
    }
    formData.append('target_lang', targetLang);
    
    if (sourceLanguage) {
      const sourceLang = getLanguageCode(sourceLanguage);
      if (sourceLang) {
        formData.append('source_lang', sourceLang);
      }
    }
    
    if (formality) {
      formData.append('formality', formality);
    }
    
    console.log(`Traduzindo texto de ${sourceLanguage} (${getLanguageCode(sourceLanguage)}) para ${targetLanguage} (${targetLang})`);
    
    const response = await axios.post(`${DEEPL_BASE_URL}/translate`, formData, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    res.json({
      translatedText: response.data.translations[0].text,
      detectedSourceLanguage: response.data.translations[0].detected_source_language
    });
  } catch (error) {
    console.error('Erro na tradução de texto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Endpoint para upload do documento
app.post('/document', upload.single('file'), async (req, res) => {
  try {
    const { targetLanguage, sourceLanguage, formality } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).send({ error: 'Nenhum arquivo enviado' });
    }
    
    // Converter nomes de idiomas para códigos ISO
    const targetLang = getLanguageCode(targetLanguage);
    if (!targetLang) {
      return res.status(400).json({
        error: `Idioma de destino '${targetLanguage}' não reconhecido`
      });
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), { filename: file.originalname });
    formData.append('target_lang', targetLang);
    
    let sourceLang = null;
    if (sourceLanguage) {
      sourceLang = getLanguageCode(sourceLanguage);
      if (sourceLang) {
        formData.append('source_lang', sourceLang);
      }
    }
    
    if (formality) {
      formData.append('formality', formality);
    }
    
    console.log(`Traduzindo documento de ${sourceLanguage} (${sourceLang}) para ${targetLanguage} (${targetLang})`);
    console.log(`Nome do arquivo: ${file.originalname}, tamanho: ${file.size} bytes`);
    
    const response = await axios.post(`${DEEPL_BASE_URL}/document`, formData, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    console.log("Resposta do DeepL para upload:", response.data);
    
    // Limpar o arquivo temporário após o envio
    fs.unlinkSync(file.path);
    
    // Devolver os campos com nomes ajustados para o frontend
    res.json({
      documentId: response.data.document_id,
      documentKey: response.data.document_key
    });
  } catch (error) {
    console.error('Erro no upload do documento:', error.response?.data || error.message);
    // Limpar o arquivo temporário em caso de erro
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
      status: "error",
      errorMessage: error.message
    });
  }
});

// Endpoint para verificar status do documento
app.post('/document-status', async (req, res) => {
  try {
    const { documentId, documentKey } = req.body;
    
    if (!documentId || !documentKey) {
      return res.status(400).json({
        error: "Parâmetros documentId e documentKey são obrigatórios"
      });
    }
    
    const formData = new FormData();
    formData.append('document_key', documentKey);
    
    console.log(`Verificando status do documento ${documentId}`);
    
    const response = await axios.post(`${DEEPL_BASE_URL}/document/${documentId}`, formData, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    console.log(`Status do documento ${documentId}:`, response.data);
    
    // Devolver exatamente com os nomes de campos esperados pelo frontend
    res.json({
      documentId,
      status: response.data.status,
      secondsRemaining: response.data.seconds_remaining,
      billedCharacters: response.data.billed_characters,
      errorMessage: response.data.message
    });
  } catch (error) {
    console.error('Erro ao verificar status do documento:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
      status: "error",
      errorMessage: error.message
    });
  }
});

// Endpoint para download do documento traduzido
app.post('/document-download', async (req, res) => {
  try {
    const { documentId, documentKey } = req.body;
    
    if (!documentId || !documentKey) {
      return res.status(400).json({
        error: "Parâmetros documentId e documentKey são obrigatórios"
      });
    }
    
    const formData = new FormData();
    formData.append('document_key', documentKey);
    
    console.log(`Baixando documento traduzido ${documentId}`);
    
    // Fazer a requisição para obter o documento traduzido
    const response = await axios.post(`${DEEPL_BASE_URL}/document/${documentId}/result`, formData, {
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    });
    
    // Log do tamanho do documento traduzido recebido
    console.log(`Documento traduzido ${documentId} baixado com sucesso - Tamanho: ${response.data.length} bytes`);
    console.log('Content-Type:', response.headers['content-type']);
    
    // Enviar o documento traduzido para o cliente
    res.set('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.set('Content-Disposition', response.headers['content-disposition'] || 'attachment');
    res.send(response.data);
  } catch (error) {
    console.error('Erro ao baixar documento traduzido:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
      status: "error", 
      errorMessage: error.message
    });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor proxy DeepL rodando em http://localhost:${port}`);
  console.log(`API Key configurada: ${DEEPL_API_KEY ? 'Sim' : 'NÃO - CONFIGURE A VARIÁVEL DEEPL_AUTH_KEY'}`);
});
