<img src="https://github.com/97703/DockerLab3/blob/main/rysunki/loga_weii.png?raw=true" style="width: 40%; height: 40%" />

> **Programowanie Aplikacji w Chmurze Obliczeniowej**

      dr inż. Sławomir Wojciech Przyłucki

<br>
Termin zajęć:

      wtorek, godz. 14:15,

Numer na liście:

      9,

Imię i nazwisko:

      Paweł Pieczykolan,
      III rok studiów inżynierskich, IO 6.7.

# Metoda wieloetapowego budowania obrazów.<br>Integracja usług NPM i NGINX.

<br>

**1. [Informacje ogólne](#1-informacje-ogólne)**\
\
**2. [Rozwiązanie 1. (Wersja 1)](#2-rozwiązanie-1)**\
\
» **2.1 [Dockerfile — etap pierwszy](#21-dockerfile--etap-pierwszy)**\
\
» **2.2 [Dockerfile — etap drugi](#22-dockerfile--etap-drugi)**\
\
» **2.3 [Budowa obrazu](#23-budowa-obrazu)**\
\
» **2.4 [Uruchomienie serwera](#24-uruchomienie-serwera)**\
\
» **2.5 [Weryfikacja poprawności działania](#25-weryfikacja-poprawności-działania)**\
\
» **2.6 [Potwierdzenie zrealizowania funkcjonalności](#26-potwierdzenie-zrealizowania-funkcjonalności)**\
\
**3. [Rozwiązanie 2. (Wersja 2)](#3-rozwiązanie-2)**\
\
» **3.1 [Zmiany w pliku Dockerfile](#31-zmiany-w-pliku-dockerfile)**\
\
» **3.2 [Różnice w index.js](#32-różnice-w-indexjs)**\
\
» **3.3 [Różnice w nginx.conf](#33-różnice-w-nginxconf)**\
\
» **3.4 [Zbudowanie obrazu i uruchomienie serwera](#34-zbudowanie-obrazu-i-uruchomienie-serwera)**\
\
» **3.5 [Potwierdzenie zrealizowania funkcjonalności](#35-potwierdzenie-zrealizowania-funkcjonalności)**\
\
**4. [Podsumowanie](#4-podsumowanie)**

<br>

## 1. Informacje ogólne
*Podstawowe informacje dotyczące opracowania*
<br><br><br>
Opracowanie zawiera dwa własne rozwiązania zadania zbudowania obrazu i kontenera korzystającego z metody wieloetapowego budowania obrazów.<br>

Dla poprawnego zrealizowania zadania wykorzystano `Docker Desktop` w wersji 4.27.2 (137060) oraz obraz `Alpine` w wersji 3.19.1, który został przedstawiony na zajęciach.

Utworzone w obu rozwiązaniach obrazy korzystają z usług [NPM](https://www.npmjs.com/) oraz [Nginx](https://www.nginx.com/).

## 2. Rozwiązanie 1.
*Rozwiązanie pierwsze bazuje na wykorzystaniu aplikacji [NPM](https://www.npmjs.com/) do wygenerowania odpowiedniego pliku **« _HTML_ »**, który zostaje nastepne umieszczony na serwerze **« _HTTP_ »** usługi [Nginx](https://www.nginx.com/).*
<br><br><br>
### 2.1 Dockerfile — etap pierwszy
Utworzono etap pierwszy **« _first_ »** korzystając z archiwum [alpine-minirootfs-3.19.1-x86_64.tar](https://github.com/97703/DockerLab5/blob/main/Wersja1/alpine-minirootfs-3.19.1-x86_64.tar), instalując **« _Nodejs_ »** i **« _NPM_ »** z modułem **« _ip_ »**.
Ponadto skopiowano lokalne pliki [package.json](https://github.com/97703/DockerLab5/blob/main/Wersja1/package.json) oraz [index.js](https://github.com/97703/DockerLab5/blob/main/Wersja1/index.js) do tworzonego obrazu.
Zawarto również zmienne środowiskowe dotyczące wersji budowanej aplikacji.

```diff
#️⃣ Ustawienie bazowego obrazu jako pusta warstwa, aby zminimalizować rozmiar obrazu
FROM scratch AS first

#️⃣ Dodanie zawartości systemu plików Alpine Linux do obrazu

#️⃣ Dla architektury Intelowskiej
ADD alpine-minirootfs-3.19.1-x86_64.tar /

#️⃣ Dla architektury ARMowskiej
#️⃣ ADD alpine-minirootfs-3.19.1-aarch64.tar /

#️⃣ Ustawienie zmiennej srodowiskowej BASE_VERSION, z domyślną wartością v1
ARG BASE_VERSION
ENV APP_VERSION=${BASE_VERSION:-v1}

#️⃣ Instalacja Node.js oraz npm z pakietów apk i usunięcie cache
RUN apk add --update nodejs npm && rm -rf /var/cache/apk/*

#️⃣ Ustawienie katalogu roboczego na /usr/app
WORKDIR /usr/app

#️⃣ Kopiowanie pliku package.json i index.js do obrazu
COPY ./package.json ./index.js  ./

#️⃣ Instalacja npm z modułem ip
RUN npm install ip
```
<p align="center">
  <i>Rys. 1. Etap pierwszy, rozwiązanie pierwsze</i>
</p>

---

### 2.2 Dockerfile — etap drugi
Utworzono etap drugi korzystając z [nginx:alpine](https://hub.docker.com/_/nginx), instalując narzędzie [Curl](https://curl.se/) oraz [NPM](https://www.npmjs.com/).
Powtórzono ustawienie zmiennych środowiskowych. Następnie dodano kod wykonujący kopiowanie [pliku konfiguracyjnego](https://github.com/97703/DockerLab5/blob/main/Wersja1/nginx.conf) usługi [Nginx](https://www.nginx.com/) oraz kopiowanie aplikacji z etapu pierwszego na serwer tejże usługi.
Ustawiono katalog roboczy na katalog **« _html_ »** usługi [Nginx](https://www.nginx.com/), aby możliwe było poprawne uruchomienie wybranych usług oraz zawarto informację o używanym porcie za pomocą dyrektywy **« _EXPOSE_ »**.
Na koniec ustalono polecenie weryfikujące poprawne działanie aplikacji za pomocą dyrektyw **« _HEALTHCHECK_ »** oraz **« _CMD_ »**, a także ustawiono domyślne polecenie startowe kontenera.

```diff
#️⃣ Definicja drugiego etapu budowy obrazu korzystając z obrazu nginx:alpine
FROM nginx:alpine AS second

#️⃣ Ustawienie zmiennej srodowiskowej BASE_VERSION, z domyślną wartością v1
ARG BASE_VERSION
ENV APP_VERSION=${BASE_VERSION:-v1}

#️⃣ Instalacja narzędzia curl oraz Node.js i npm z pakietów apk i usunięcie cache
RUN apk add --update curl && apk add --update nodejs npm && rm -rf /var/cache/apk/*

#️⃣ Kopiowanie pliku konfiguracyjnego nginx do katalogu konfiguracyjnego nginx w obrazie
COPY nginx.conf /etc/nginx/conf.d/default.conf

#️⃣ Kopiowanie aplikacji z etapu pierwszego na serwer HTTP nginx
COPY --from=first /usr/app /usr/share/nginx/html

#️⃣ Ustawienie katalogu roboczego na /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

#️⃣ Informacje o używanym porcie 80
EXPOSE 80

#️⃣ Ustalenie polecenia sprawdzającego poprawne działanie aplikacji
HEALTHCHECK --interval=10s --timeout=1s \
 CMD curl -f http://localhost/ || exit 1

#️⃣ Ustawienie domyślnego polecenia startowego dla kontenera uruchamiającego aplikację
CMD ["sh", "-c", "npm start && nginx -g 'daemon off;'"]
```
<p align="center">
  <i>Rys. 2. Etap drugi, rozwiązanie pierwsze</i>
</p>

Weryfikacja poprawnego działania aplikacji korzysta z usług [Curl](https://curl.se/), narzędzia wiersza poleceń i biblioteka do przesyłania danych za pomocą adresów URL.

Domyślne polecenie startowe polega na uruchomieniu usługi [NPM](https://www.npmjs.com/), oczekiwaniu na jej zakończenie, a następnie uruchomieniu usługi [Nginx](https://www.nginx.com/).

---

### 2.3 Budowa obrazu
Zbudowano obraz za pomocą polecenia **« _Docker build_ »**. Ustalono wersję aplikacji opcją **« _--build-arg_ »**,  skrypt inicjalizujący Dockerfile opcją **« _-f_ »** oraz nazwę pliku i jego tag opcją **« _-t_ »**.

```
docker build --build-arg BASE_VERSION=v1.0 -f Dockerfile -t local/lab5-v1 .
```
<p align="center">
  <i>Rys. 3. Budowa obrazu</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_build_1.png" style="width: 70%; height: 70%" /></p>
<p align="center">
  <i>Rys. 4. Wynik budowy obrazu rozwiązania pierwszego</i>
</p>

---

### 2.4 Uruchomienie serwera
Uruchomiono serwer tworząc kontener za pomocą polecenia **« _Docker run_ »**. Skorzystano z opcji:
- -d – detached mode; kontener uruchamiany jest w tle
- -p – mapowanie portu **« _80_ »** kontenera na port **« _80_ »** hosta
- --hostname – ustawienie nazwy hosta kontenera
- --name – ustawienie nazwy kontenera

Do utworzenia kontenera wykorzystano wcześniej utworzony obraz **« _lab5 local/lab5-v1_ »**.

```
docker run -d -p 80:80 --hostname dockerlab5 --name lab5 local/lab5-v1
```
<p align="center">
  <i>Rys. 5. Utworzenie kontenera</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_run_1.png" style="width: 100%; height: 100%" /></p>
<p align="center">
  <i>Rys. 6. Wynik polecenia uruchamiającego serwer</i>
</p>

---

### 2.5 Weryfikacja poprawności działania
Za pomocą polecenia **« _docker ps_ »** z opcją **« _--filter name_ »** sprawdzono czy uruchomiony serwer otrzymał status **« _healthy_ »**.

Ponadto zwrócono się do Dockera o bardziej szczegółowe informacje poprzez polecenie **« _docker inspect_ »**.

```
docker ps --filter name="lab5"
```
<p align="center">
  <i>Rys. 7. Polecenie weryfikujące</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_ps_1.png" style="width: 100%; height: 100%" /></p>
<p align="center">
  <i>Rys. 8. Wynik działania polecenia weryfikującego</i>
</p>

```
docker inspect <<< id_kontenera >>>
```
<p align="center">
  <i>Rys. 9. Polecenie wyświetlające szczegółowe informacje o konterze</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_inspect_1.png" style="width: 80%; height: 80%" /></p>
<p align="center">
  <i>Rys. 10. Fragment wyniku działania polecenia inspekcyjnego</i>
</p>

---

### 2.6 Potwierdzenie zrealizowania funkcjonalności
Za pomocą przeglądarki wyświetlono stronę [http://localhost/](http://localhost/).
Domyślnie **« _localhost_ »** działa na porcie **« _80_ »**, stąd nie ma potrzeby wpisywania portu w pasku adresowym. Po wejściu na stronę, wyświetlone są wymagane informacje, w tym adres IP serwera, nazwa serwera oraz wersja aplikacji (rys. 10.).
> [!NOTE]
> Widoczny na stronie adres IP jest adresem kontenera.

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/strona_1.png" style="width: 40%; height: 40%" /></p>
<p align="center">
  <i>Rys. 11. Widok strony localhost rozwiązania pierwszego</i>
</p>

## 3. Rozwiązanie 2.
*Rozwiązanie drugie bazuje na jednoczesnym uruchomieniu aplikacji [NPM](https://www.npmjs.com/) i usługi [Nginx](https://www.nginx.com/).
Usługę skonfigurowano tak, aby lokalizacja **« _localhost/_ »** wskazywała na aktywny serwer aplikacji [NPM](https://www.npmjs.com/) nasłuchujący na porcie **« _8080_ »**.*
<br><br><br>
### 3.1 Zmiany w pliku Dockerfile
Plik [Dockerfile](https://github.com/97703/DockerLab5/blob/main/Wersja%202/Dockerfile) otrzymał dwie poprawki:
1. linia **« _RUN npm install ip_ »** została zamieniona na **« _RUN npm install_ »** — moduł ip nie jest już instalowany
2. linia **« _["sh", "-c", "npm start && nginx -g 'daemon off;'"]_ »** została zamieniona na **« _["sh", "-c", "npm start & nginx -g 'daemon off;'"]_ »** — terminal nie oczekuje na zakończenie procesu **« _npm start_ »**.

---

### 3.2 Różnice w index.js
W rozwiązaniu pierwszym, **« _index.js_ »** jest wykorzystywany do pobrania zmiennych i zapisu ich ze strukturą do pliku **« _index.html_ »**, który to plik jest następnie umieszczany na serwerze [Nginx](https://www.nginx.com/).

Drugie rozwiązanie korzysta z uruchomienia serwera na podstawie pliku **« _index.js_ »**, który to serwer wyświetla wymagane informacje i nasłuchuj na porcie **« _8080_ »**.

```diff
-const fs = require('fs');
const os = require('os');
-const ip = require('ip');

-const serverIp = ip.address();
const serverHostname = os.hostname();
const appVersion = process.env.APP_VERSION;

-const htmlContent = `
-  <!DOCTYPE html>
-  <html lang="pl">
-  <head>
-    <meta charset="UTF-8">
-    <meta name="viewport" content="width=device-width, initial-scale=1.0">
-    <title>Docker LAB5</title>
-  </head>
-  <body>
-    <h1>Docker LAB5</h1>
-    <p>Adres IP: ${serverIp}</p>
-    <p>Hostname: ${serverHostname}</p>
-    <p>Wersja aplikacji: ${appVersion}</p>
-  </body>
-  </html>
-`;
-
-fs.writeFileSync('index.html', htmlContent);
```
<p align="center">
  <i>Rys. 12. Index.js – rozwiązanie pierwsze</i>
</p>

```diff
+const express = require('express');
const os = require('os');

+const app = express();
const serverHostname = os.hostname();
const appVersion = process.env.APP_VERSION;

+app.get('/', (req, res) => {
+  res.send(`<h1>Docker LAB5</h1>
+            <p>Adres IP serwera: ${req.socket.localAddress}</p>
+            <p>Nazwa serwera (hostname): ${serverHostname}</p>
+            <p>Wersja aplikacji: ${appVersion}</p>`);
+});
+
+app.listen(8080, () => {
+  console.log('Nasłuchuje na porcie 8080');
+});
```
<p align="center">
  <i>Rys. 13. Index.js – rozwiązanie drugie</i>
</p>

---

### 3.3 Różnice w nginx.conf
W [Nginx](https://www.nginx.com/) dla pierwszego rozwiązania zrealizowano prostą obsługę żądania ścieżki.

W drugim rozwiązaniu zdecydowano się na przekierowanie żądania do serwera [NPM](https://www.npmjs.com/) nasłuchującego na porcie **« _8080_ »**.

```diff
server
{
    listen       80; #️⃣ nasłuchuj na porcie 80
    server_name  localhost; #️⃣ nazwa serwera

    location / # obsłuż żądanie '/'
    {
-        root   /usr/share/nginx/html; #️⃣ ścieżka do pliku index
-        index  index.html; #️⃣ nazwa pliku index
    }
}
```
<p align="center">
  <i>Rys. 14. Nginx.conf – rozwiązanie pierwsze</i>
</p>

```diff
server
{
    listen       80; #️⃣ nasłuchuj na porcie 80
    server_name  localhost; #️⃣ nazwa serwera

    location / #️⃣ obsłuż żądanie '/'
    {
+        proxy_pass http://localhost:8080; #️⃣ przekieruj na port 8080
    }
}
```
<p align="center">
  <i>Rys. 15. Nginx.conf – rozwiązanie drugie</i>
</p>

---

### 3.4 Zbudowanie obrazu i uruchomienie serwera
Zbudowano obraz, uruchomiono kontener i sprawdzono jego status.

> [!WARNING]
> Budowanie drugiego obrazu zostało wykonane po wyczyszczeniu cache Dockera. Bez wyczyszczenia procedura trwałaby znacznie krócej.

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_build_2.png" style="width: 70%; height: 70%" /></p>
<p align="center">
  <i>Rys. 16. Wynik budowy obrazu rozwiązania drugiego</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_run_2.png" style="width: 100%; height: 100%" /></p>
<p align="center">
  <i>Rys. 17. Wynik polecenia uruchamiającego serwer rozwiązania drugiego</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_ps_2.png" style="width: 100%; height: 100%" /></p>
<p align="center">
  <i>Rys. 18. Wynik działania polecenia weryfikującego dla serwera drugiego rozwiązania</i>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/docker_inspect_2.png" style="width: 80%; height: 80%" /></p>
<p align="center">
  <i>Rys. 19. Fragment inspekcji serwera drugiego rozwiązania</i>
</p>

---

### 3.5 Potwierdzenie zrealizowania funkcjonalności
Ponownie otworzono stronę znajdującą się pod adresem http://localhost/. Wynik tej operacji znajduje się poniżej (Rys. 20.).

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/DockerLab5/main/rysunki/strona_2.png" style="width: 40%; height: 40%" /></p>
<p align="center">
  <i>Rys. 20. Widok strony localhost rozwiązania drugiego</i>
</p>

## 4. Podsumowanie
*Wnioski*
<br><br><br>
Celem zadania było zbudowanie obrazu za pomocą metody wieloetapowego budowania obrazów, a następnie uruchomienie kontenera w oparciu o taki obraz.
Zadanie zostało zrealizowane na dwa sposoby. Potwierdzono zrealizowanie wymaganej funkcjonalności dla każdego ze sposobów.

Budowanie obrazów w oparciu o metodę wieloetapowego budowania obrazów pozwala między innymi na redukcję rozmiaru obrazu i zwiększenie wydajności budowania dzięki podzieleniu procesu budowania na poszczególne etapy.
