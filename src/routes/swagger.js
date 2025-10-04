const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const router = express.Router();

const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Employee Management API Documentation",
  customfavIcon: "/assets/favicon.ico"
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, options));

module.exports = router;
