#!/bin/bash

rm -rf ~/temp_backup
mkdir ~/temp_backup

# needs sudo :/
#tar -czf ~/temp_backup/config.tar.gz /etc/nginx/nginx.conf /etc/letsencrypt/ ~/.ssh/. ~/src/undefined_be/.env /var/www/undefined/src/config.ts
tar -czf ~/temp_backup/config.tar.gz  ~/.ssh/. ~/src/undefined_be/.env /var/www/undefined/src/config.ts ~/.aws
aws s3 cp ~/temp_backup/ s3://mosey.systems/beloved_darkorange__backup --recursive --metadata type=backup
