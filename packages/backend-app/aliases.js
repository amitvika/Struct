const moduleAlias = require('module-alias');

moduleAlias.addAlias('@model', __dirname + '/models');
moduleAlias.addAlias('@controller', __dirname + '/controller');
moduleAlias.addAlias('@middleware', __dirname + '/middleware');