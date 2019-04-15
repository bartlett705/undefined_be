#!/bin/bash

rm -rf ~/temp_backup
mkdir ~/temp_backup

tar -hczf ~/temp_backup/config.tar.gz /etc/nginx/nginx.conf /etc/letsencrypt/live ~/.ssh/. ~/src/undefined_be/.env /var/www/undefined/src/config.ts ~/.aws/.
aws s3 cp ~/temp_backup/ s3://mosey.systems/beloved_darkorange__backup --recursive --metadata type=backup
