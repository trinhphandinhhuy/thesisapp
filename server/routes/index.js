var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/*', function (req, res) {
  console.log(path.join(__dirname, '/../../client/index.html'));
    res.sendFile(path.join(__dirname, '/../../client/index.html'));
    
});

module.exports = router;
