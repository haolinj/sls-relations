const jsyaml = require('js-yaml');
const express = require('express');
const fileUpload = require('express-fileupload');
const fp = require('lodash/fp');
const app = express();
const server = app.listen(process.env.PORT || 8001, listen);

function listen() {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Started at http://' + host + ':' + port);
}

app.use(fileUpload());
app.use(function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const services = (req, res) => {
  const services = fp.map(sf => jsyaml.safeLoad(sf.data))(req.files);
  res.send(services);
};

app.post('/services', services);
