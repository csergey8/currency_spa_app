require('dotenv').config(); // read .env files

const { getRates, getSymbols } = require('./lib/fixer-service');
const { convertCurrency } = require('./lib/free-currency-service');

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;


//Set public folder as a root

app.use(express.static('public'));

//Allow front-end access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

// Fetch Lates Currency Rates
app.get('/api/rates', async (req, res) => {
  try {
    const data = await getRates();
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

//Fetch Symbols 
app.get('/api/symbols', async (req, res) => {
  try {
    const data = await getSymbols();
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

//Covert Currency
app.get('/api/convert', async (req, res) => {
  try {
    const { val, to } = req.body;
    const data = await convertCurrency(from, to);
    res.setHeader('Content-Type', 'application/json');
    res.send(data)
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Redirect all traffic to index.html
app.use((req, res)=> res.sendFile(`${__dirname}/public/index.html`));

//Liset http requests on port 3000
app.listen(port, ()=> {
  console.log(`Listen on port ${port}`);
});


// Testing get reuest
// const test = async () => {
//   const data = await getRates();
//   console.log(data);
// }

// test();

// Express Error Handler
const errorHandler = (err, req, res) => {
  if(err.response) {
    // The request was made and the server responded with a status code that falls out of the range of 2XX
    res.status(403).send({
      title: 'Server responded with an error',
      message: err.message
    });
  } else if(err.request) {
    // The request was made but no response was received 
    res.status(503).send({
      title: 'Unable to communicate with server',
      message: err.message
    })
  } else {
    //Something happened in setting up the request that triggered an Error
    res.status(500).send({
      title: 'An unexpected error occured',
      message: err.message
    })
  }
}


