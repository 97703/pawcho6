# Ustawienie bazowego obrazu jako pusta warstwa, aby zminimalizować rozmiar obrazu
FROM scratch AS first

# Dodanie zawartości systemu plików Alpine Linux do obrazu

# Dla architektury Intelowskiej
ADD alpine-minirootfs-3.19.1-x86_64.tar /

# Dla architektury ARMowskiej
# ADD alpine-minirootfs-3.19.1-aarch64.tar /

# Ustawienie zmiennej srodowiskowej BASE_VERSION, z domyślną wartością v1
ARG BASE_VERSION
ENV APP_VERSION=${BASE_VERSION:-v1}

# Instalacja Node.js oraz npm z pakietów apk i usunięcie cache
RUN apk add --update nodejs npm && rm -rf /var/cache/apk/*

# Ustawienie katalogu roboczego na /usr/app
WORKDIR /usr/app

# Kopiowanie pliku package.json i index.js do obrazu
COPY ./package.json ./index.js  ./

# Instalacja npm z modułem ip
RUN npm install ip

# Definicja drugiego etapu budowy obrazu korzystając z obrazu nginx:alpine
FROM nginx:alpine AS second

# Ustawienie zmiennej srodowiskowej BASE_VERSION, z domyślną wartością v1
ARG BASE_VERSION
ENV APP_VERSION=${BASE_VERSION:-v1}

# Instalacja narzędzia curl oraz Node.js i npm z pakietów apk i usunięcie cache
RUN apk add --update curl && apk add --update nodejs npm && rm -rf /var/cache/apk/*

# Kopiowanie pliku konfiguracyjnego nginx do katalogu konfiguracyjnego nginx w obrazie
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiowanie aplikacji z etapu pierwszego na serwer HTTP nginx
COPY --from=first /usr/app /usr/share/nginx/html

# Ustawienie katalogu roboczego na /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Informacje o używanym porcie 80
EXPOSE 80

# Ustalenie polecenia sprawdzającego poprawne działanie aplikacji
HEALTHCHECK --interval=10s --timeout=1s \
 CMD curl -f http://localhost/ || exit 1

# Ustawienie domyślnego polecenia startowego dla kontenera uruchamiającego aplikację
CMD ["sh", "-c", "npm start && nginx -g 'daemon off;'"]
