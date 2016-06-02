#!/bin/bash

npm run build:dev

lftp -e "set ftp:ssl-allow no;mirror -R ./public/ /public_html/cdown && exit" -u $FTP_USER,$FTP_PASS $FTP_SITE

#echo "export FTP_USER=xxxx" >> ~/.profile
#echo "export FTP_PASS=xxxx" >> ~/.profile
#echo "export FTP_SITE=xxxx" >> ~/.profile