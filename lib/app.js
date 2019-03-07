'use strict';

require('dotenv').config();
const config = require('./config');

const
  AzureStorageFS = require('azure-storage-fs'),
  debug = require('debug')('ftpd'),
  ftpd = require('ftpd'),
  fs = require('fs'),
  promisifyObject = require('./util/promisifyObject'),
  { ERR_ACCESS_DENIED } = require('./errors');

const tls = {
    key: fs.readFileSync(config.CERT_KEY_PATH),
    cert: fs.readFileSync(config.CERT_FULL_PATH),
    caaa: fs.readFileSync(config.CERT_FULL_PATH)
  };

const
  server = new ftpd.FtpServer(config.HOST, {
    getInitialCwd: () => '/',
    getRoot: () => '/',
    pasvPortRangeStart: config.PASSVPORTMIN,
    pasvPortRangeEnd: config.PASSVPORTMAX,
    tlsOptions: null,
    allowUnauthorizedTls: true
  });

const blobService = promisifyObject(
  require('azure-storage').createBlobService(config.BLOB_ACCOUNT_NAME, config.BLOB_SECRET),
  [
    'doesContainerExist',
    'getContainerMetadata'
  ]
);

server.on('client:connected', connection => {
  connection.on('command:user', (username, success, failure) => {
    debug(`user "${ username }" is connected`);
    if (username === config.USERNAME_WEB_REPLACE) username = '$web';

    blobService.doesContainerExist(username, {})
      .delay(config.CREDENTIAL_CHECK_PAUSE)
      .then(result => !result.exists && Promise.reject(ERR_ACCESS_DENIED))
      .then(() => {
        connection.username = username;
        success();
      }, err => {
	console.error('Erro na validação do usuario/conteiner', err);
        failure(err);
      });
  });

  connection.on('command:pass', (actualPassword, success, failure) => {
    debug(`checking password for user "${ connection.username }"`);
    

    blobService.getContainerMetadata(connection.username, {})
      .delay(config.CREDENTIAL_CHECK_PAUSE)
      .then(result => {
        const expectedPassword = decodeURIComponent(result.metadata[config.CONTAINER_PASSWORD_METADATA_NAME]);

        if (actualPassword !== expectedPassword) {
          return Promise.reject(ERR_ACCESS_DENIED);
        }
      })
      .then(
        () => {
          success(
            connection.username,
            AzureStorageFS.blob(
              config.BLOB_ACCOUNT_NAME,
              config.BLOB_SECRET,
              connection.username
            )
          );
        },
        err => {
	  console.error('Erro na validação do password', err);
	  failure(err)
	}
      );
  });
});

server.debugging = 4;
server.on('error', function(error) {
	  console.error('FTP Server error:', error);
});

server.listen(config.PORT);
console.log('Listening on port ' + config.PORT);
