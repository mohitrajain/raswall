#!/bin/bash

echo "WELCOME !! THIS SCRIPT WILL LET YOU INSTALL THE FOLLOWING TOOLS:-
1)C_ICAP
2)CLAMAV
3)SQUID
4)NODEJS
5)MONGODB"
sleep 1
echo "################STARTING#############"
sleep 2

#:CLAMAV
wget http://www.clamav.net/downloads/production/clamav-0.99.3.tar.gz 
tar -xvf clamav-0.99.3.tar.gz
rm clamav-0.99.3.tar.gz
cd clamav-0.99.3/
./configure --prefix=/usr/local/clamav --without-openssl && make && make install
#:   ------testing-----
/usr/local/clamav/bin/clamscan ~ > info 2>/dev/null
if [[ -s info ]];
then
echo "#################################"
echo "#################################"
echo "#################################"
echo "CLAMAV SUCCESSFULLY INSTALLED ;) "
echo "#################################"
echo "#################################"
echo "#################################"
sleep 3
rm info
cd ../
else
echo "#################################"
echo "#################################"
echo "#################################"
echo "  CLAMAV INSTALLATION FAILED ;/  "
echo "#################################"
echo "#################################"
echo "#################################"

read -p "Are you sure you want to continue? <y/N> " prompt
if [[ $prompt =~ [yY](es)* ]]
then
        echo "Continuing installation of other tools"
	cd ../
else
  cd ../
  exit 0
fi

fi

#:C-ICAP
wget https://sourceforge.net/projects/c-icap/files/c-icap/0.5.x/c_icap-0.5.2.tar.gz/download
tar -xvf download
cd c_icap-0.5.2/
./configure --prefix=/usr/local/c-icap && make && make install
/usr/local/c-icap/bin/c-icap
#:   -----testing-----
if [[ -s /usr/local/c-icap/bin/c-icap-client ]];
then
echo "#################################"
echo "#################################"
echo "#################################"
echo "C_ICAP SUCCESSFULLY INSTALLED ;) "
echo "#################################"
echo "#################################"
echo "#################################"

sleep 3
cd ../
else
echo "#################################"
echo "#################################"
echo "#################################"
echo "   C_ICAP INSTALLATION FAILED ;/ "
echo "#################################"
echo "#################################"
echo "#################################"
read -p "Are you sure you want to continue? <y/N> " prompt
if [[ $prompt =~ [yY](es)* ]]
then
        echo "Continuing installation of other tools"
	cd ../
else
  cd ../
  exit 0
fi

fi

#:SQUID
wget http://www.squid-cache.org/Versions/v3/3.5/squid-3.5.27.tar.gz
tar -xvf squid-3.5.27.tar.gz
cd squid-3.5.27/
./configure '--prefix=/usr/local/squid' '--with-logdir=/var/log/squid' 
'--with-pidfile=/var/run/squid.pid' '--disable-dependency-tracking' '--enable-eui' '--enable-follow-x-forwarded-for' '--enable-auth' '--enable-auth-basic=DB,fake,getpwnam,LDAP,NCSA,NIS,PAM,POP3,RADIUS,SASL,SMB,SMB_LM' '--enable-auth-ntlm=SMB_LM,fake' '--enable-auth-digest=file,LDAP' '--enable-auth-negotiate=kerberos' '--enable-external-acl-helpers=LDAP_group,time_quota,session,unix_group,wbinfo_group' '--enable-storeid-rewrite-helpers=file' '--enable-cache-digests' '--enable-cachemgr-hostname=localhost' '--enable-delay-pools' '--enable-epoll' '--enable-icap-client' '--enable-ident-lookups' '--with-large-files' '--enable-linux-netfilter' '--enable-removal-policies=heap,lru' '--enable-snmp' '--enable-ssl' '--enable-ssl-crtd' '--enable-storeio=aufs,diskd,ufs,rock' '--enable-diskio' '--enable-wccpv2' '--enable-esi' '--enable-ecap' '--with-aio' '--with-default-user=squid' '--with-dl' '--with-openssl' '--with-pthreads' '--disable-arch-native' '--with-pic'
make && make install
#:    ------testing-----
squid -v > info 2>/dev/null
if [[ -s info ]];
then
echo "#################################"
echo "#################################"
echo "#################################"
echo "SQUID SUCCESSFULLY INSTALLED ;) "
echo "#################################"
echo "#################################"
echo "#################################"
sleep 3
rm info
cd ../
else
echo "#################################"
echo "#################################"
echo "#################################"
echo "   SQUID INSTALLATION FAILED ;/  "
echo "#################################"
echo "#################################"
echo "#################################"

read -p "Are you sure you want to continue? <y/N> " prompt
if [[ $prompt =~ [yY](es)* ]]
then
        echo "Continuing installation of other tools"
	cd ../
else
  cd ../
  exit 0
fi

fi

#:SQUID-CLAMAV
wget https://sourceforge.net/projects/squidclamav/files/latest/download
tar -xvf download
cd squidclamav-6.16/
./configure --with-c-icap=/usr/local/c-icap/
make && make install

#:NODEJS
wget https://nodejs.org/dist/v6.11.2/node-v6.11.2.tar.gz
tar -xvf node-v6.11.2.tar.gz
cd node-v6.11.2/
./configure --prefix=~/.local && make && make install
ln -s ~/.local/lib/node_modules ~/.node_modules
#:     -------testing-------
node -v > info 2>/dev/null
if [[ -s info ]];
then
echo "#################################"
echo "#################################"
echo "#################################"
echo "SUCCESSFULLY INSTALLED ;) "
echo "#################################"
echo "#################################"
echo "#################################"
rm info
cd ../
else
echo "#################################"
echo "#################################"
echo "#################################"
echo "  NODEJS INSTALLATION FAILED ;/  "
echo "#################################"
echo "#################################"
echo "#################################"

read -p "Are you sure you want to continue? <y/N> " prompt
if [[ $prompt =~ [yY](es)* ]]
then
        echo "Continuing installation of other tools"
	cd ../
else
  cd ../
  exit 0
fi

fi

#:MONGODB
wget https://www.mongodb.com/dr/fastdl.mongodb.org/linux/mongodb-linux-x86_64-amazon-3.4.7.tgz/download
tar -xvf download
cd mongodb-linux-x86_64-amazon-3.4.7/bin 
mkdir -p /data/db
touch test
nohup ./mongod < test > /dev/null
retval=$?
if [ ! retval -eq 0 ]; then
	echo "#################################"
	echo "#################################"
	echo "#################################"
	echo "  MONGODB INSTALLATION FAILED ;/ "
	echo "#################################"
	echo "#################################"
	echo "#################################"
	sleep 3
	echo "EXCEPT MONGODB EVERYTHING INSTALLED SUCCESFULLY XD....EXITING !"
	cd ../../
	exit 0
else
	echo "#################################"
	echo "#################################"
	echo "#################################"
	echo "MONGODB SUCCESSFULLY INSTALLED ;)"
	echo "#################################"
	echo "#################################"
	echo "#################################"
	rm test
	cd ../../
	echo "ALL THE TOOLS ARE INSTALLED SUCCESSFULLY ...ENJOY !!"
fi
