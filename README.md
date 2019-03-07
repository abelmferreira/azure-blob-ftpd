azure-blob-ftpd
===============

A simple FTP server template for Azure Storage Blob.

This server is built on top of [`ftpd`](https://www.npmjs.com/package/ftpd) and [`azure-storage-fs`](https://www.npmjs.com/package/azure-storage-fs) modules.

## Update in this Fork

1. Fixes bugs in ftp_node and ftpd modules (manual replace files in ./modules_update to node_modules folder)
2. Add extra configs to env variables
3. Add option to replace username for $web folter, when activating Azure Static Website
4. Add pass port options to passive ftp
5. Add nginx config example to reverse proxy https access

## Bugs not fixed and next
1. Tests with FTP TLS Failed, no dir list after login, not in use
2. Better code


## How to use

1. Create a Azure Storage account on [Azure Portal](https://portal.azure.com/)
2. Write down the account name and secret
3. Set environment variables
  * `BLOB_ACCOUNT_NAME` to your Azure Storage account name
  * `BLOB_SECRET` to your Azure Storage secret
  * (Optional) `NODE_ENV` to `production`
4. Create a user account, assume username is `johndoe` and password is `P@ssw0rd`
  * Create a new container, named `johndoe`
  * Add a new metadata to the container, `password` set to `P@ssw0rd`
5. Run `node index.js`

## What's next

Feel free to extend the FTP server, some ideas you can work on:

* Use SHA1 for salted password hash
* Secure with TLS ([example](https://github.com/sstur/nodeftpd/blob/master/test.js))
* Trigger webhook when a file is uploaded
  * Start an [Azure WebJobs](https://azure.microsoft.com/en-us/documentation/articles/web-sites-create-web-jobs/)
  * Send a message to [Azure Service Bus](https://azure.microsoft.com/en-us/documentation/articles/service-bus-nodejs-how-to-use-queues/) queue
  * [Slack](https://api.slack.com/) it
* Learn more about [`ftpd`](https://www.npmjs.com/package/ftpd)
  * Build a new `fs` provider for [Amazon S3](https://aws.amazon.com/s3/) or [OneDrive](https://onedrive.com/)
* Learn more about [`azure-storage-fs`](https://www.npmjs.com/package/azure-storage-fs)
  * Use it with your own project
