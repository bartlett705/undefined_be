#!/bin/bash

rm -rf ~/temp_backup
mkdir ~/temp_backup

tar -czf ~/temp_backup/config.tar.gz /etc/nginx/nginx.conf /etc/letsencrypt/ ~/.ssh/. ~/src/undefined_be/.env
aws s3 cp ./temp_backup/ s3://mosey.systems/droplet_backup --recursive --metadata type=backup