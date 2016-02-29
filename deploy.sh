#!/bin/bash
grunt

lftp -e "mirror -R /home/ubuntu/workspace/dist/public_html/ /public_html/cdown && exit" -u $FTP_USER,$FTP_PASS $FTP_SITE

#echo "export FTP_USER=xxxx" >> ~/.profile
#echo "export FTP_PASS=xxxx" >> ~/.profile
#echo "export FTP_SITE=xxxx" >> ~/.profile