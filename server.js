const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());

app.get('/search/:searchValue', async (req, res) => {
   console.log(req.params.searchValue)
  const searchValue = req.params.searchValue.replace(/\+/g, '%20'); // Replace all '+' with space

  console.log(searchValue);
  try {
    // Make a request to Solr server
    const options = {
      hostname: 'localhost',
      port: 8983,
      path: `/solr/final_core/select?q=Title%3A${searchValue}&rows=15`,
      method: 'GET'
    };

    const request = http.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(jsonData);
          res.json(jsonData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(500).json({ error: 'Error parsing JSON response' });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Error making request:', error);
      res.status(500).json({ error: 'Error making request' });
    });

    request.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/suggested/:suggestedValue', async (req, res) => {
  const originalString = req.params.suggestedValue
  const modifiedString = originalString.substring(1, originalString.length - 1);
  const words = modifiedString.split("+AND+");
  const extractedWord = words[0];
  console.log(extractedWord)

  try {
    // Make a request to Solr server
    const options = {
      hostname: 'localhost',
      port: 8983,
      path: `/solr/final_core/spell?spellcheck=true&spellcheck.q=${extractedWord}`,
      method: 'GET'
    };

    const request = http.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(jsonData.spellcheck);
          res.json(jsonData.spellcheck)
     
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(500).json({ error: 'Error parsing JSON response' });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Error making request:', error);
      res.status(500).json({ error: 'Error making request' });
    });

    request.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

