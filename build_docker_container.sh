# openssl req -x509 -newkey rsa:4096 -keyout www.kasaneteto.ru.key -out www.kasaneteto.ru.crt -sha256 -days 3650 -nodes -subj "/C=ND/ST=Netherlands/L=Amsterdam/O=ironkrendel/OU=kasaneteto.ru/CN=kasaneteto.ru"
openssl req -x509 -newkey rsa:4096 -sha512 -days 3650 -noenc -keyout www.kasaneteto.ru.key -out www.kasaneteto.ru.crt -subj "/CN=kasaneteto.ru"
docker build ./ -t year1_practice