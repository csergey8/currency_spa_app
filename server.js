require('dotenv').config(); // read .env files

const express = require('express');

const app = express();
const port = process.env.PORT || 3000;


//Set public folder as a root

app.use(express.static('public'));

//Allow front-end access to node_modules folder
app.use('/scripts', express.static(`${__dirname}/node_modules/`));

//Liset http requests on port 3000
app.listen(port, ()=> {
  console.log(`Listen on port ${port}`);
});
