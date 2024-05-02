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

# Budowanie, uruchamianie i publikowanie obrazu z użyciem silnika Buildkit w oparciu o usługi GitHub i GitHub Container Registry

**1. [Informacje ogólne](#1-informacje-ogólne)**\
\
**2. [Utworzenie repozytorium](#2-utworzenie-repozytorium)**\
\
**3. [Modyfikacja pliku Dockerfile](#3-modyfikacja-pliku-dockerfile)**\
\
**4. [Instalacja i konfiguracja usługi BuildKit](#4-instalacja-i-konfiguracja-usługi-buildkit)**\
\
**5. [Usługa ghcr.io](#5-usługa-ghcrio)**\
\
**6. [Budowa obrazu](#6-budowa-obrazu)**\
\
**7. [Udostępnienie obrazu](#7-udostępnienie-obrazu)**\
\
**8. [Uruchomienie kontenera](#8-uruchomienie-kontenera)**\
\
**9. [Potwierdzenie poprawności działania](#9-potwierdzenie-poprawności-działania)**\
\
**10. [Podsumowanie](#10-podsumowanie)**

<br>

## 1. Informacje ogólne
*Podstawowe informacje dotyczące opracowania*
<br><br><br>

Należało utworzyć publiczne repozytorium na platformie [GitHub](https://github.com/) za pomocą klienta **« _CLI_ »**, połączyć je (klonując) z katalogiem zawierającym rozwiązanie zadania obowiązkowego z laboratorium 5., zmodyfikować istniejący plik Dockerfile tak, by pełnił rolę frontendu dla **« _Buildkit_ »**, zdefiniować pobieranie repozytorium przez **« _SSH_ »**, zbudować obraz w kontenerze z użyciem narzędzia [BuildKit](https://github.com/moby/buildkit), nadać mu tag ```lab6``` i przesłać do publicznego repozytorium na [GitHubie](https://github.com/).

Opracowanie zawiera rozwiązanie bazujące na informacjach zawartych w wykładach 5 oraz 6, a także na stronie [medium.com](https://medium.com/@tonistiigi/build-secrets-and-ssh-forwarding-in-docker-18-09-ae8161d066).
Wykorzystano wcześniej utworzone repozytorium [DockerLab5](https://github.com/97703/DockerLab5) oraz silnik [BuildKit](https://github.com/moby/buildkit/releases/tag/v0.13.2) w wersji 0.13.2.
Do przeprowadzenia budowania obrazu wykorzystanu plik Dockerfile z folderu [Wersja 2](https://github.com/97703/pawcho6/tree/main/DockerLab5/Wersja%202) sklonowanego repozytorium [DockerLab5](https://github.com/97703/pawcho6/tree/main/DockerLab5).

Ćwiczenie wykonano na maszynie wirtualnej [VM VirtualBox](https://www.virtualbox.org/), na systemie Ubuntu w wersji [20.04 LTS](https://ubuntu.com/download/desktop).

---

## 2. Utworzenie repozytorium
*Zalogowanie do usługi GitHub CLI, utworzonie nowego repozytorium i skolonowanie do niego repozytorium DockerLab5*
<br><br><br>
Zalogowano się do usługi [GitHub CLI](https://cli.github.com/) za pomocą usług **« _SSH_ »** oraz tokena **« _CLI_ »**. Skorzystano z utworzonego na laboratorium klucza **« _SSH_ »**.
Wykorzystano polecenie:

```
gh auth login
```

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/logowanie_cli.png" style="width: 50%; height: 50%" /></p>
<p align="center">
  <i>Rys. 1. Logowanie do usługi GitHub CLI</i>
</p>

Utworzono nowe publiczne repozytorium **« _pawcho6_ »** za pomocą polecenia:

```
gh repo create
```

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/utworzenie_repo.png" style="width: 50%; height: 50%" /></p>
<p align="center">
  <i>Rys. 2. Utworzenie publicznego repozytorium</i>
</p>

Sklonowano repozytorium **« _DockerLab5_ »** w katalogu repozytorium **« _pawcho6_ »** za pomocą:

```diff
cd pawcho
gh repo clone 97703/DocklerLab5
```

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/sklonowanie_repo.png" style="width: 60%; height: 60%" /></p>
<p align="center">
  <i>Rys. 3. Sklonowanie repozytorium DockerLab5</i>
</p>

---

## 3. Modyfikacja pliku Dockerfile
*Modyfikacja pliku Dockerfile zgodnie z wytycznymi zadania*
<br><br><br>
Zmodyfikowano plik Dockerfile Wersji 2.

Dodano:
- ```syntax=docker/dockerfile:1.4``` – odwołanie do oficjalnej i stabilnej wersji obrazu dla rozszerzonych frontend-ów
- do instrukcji **« _RUN_ »** ```apk --nocache openssh-client git``` – instalacja klienta **« _OpenSSH_ »** oraz **« _Git_ »** w kontenerze **« _Docker_ »**
- do instrukcji **« _RUN_ »** ```mkdir -p -m 0700 ~/.ssh``` – tworzy folder **« _.ssh_ »** w katalogu domowym z uprawnieniami 700 (pełne uprawnienia dla właściciela katalogu), o ile taki katalog nie istnieje
- do instrukcji **« _RUN_ »** ```ssh-keyscan github.com >> ~/.ssh/known_hosts``` – wykonuje zapytanie do serwera [GitHub](github.com) w celu uzyskania klucza hosta **« _SSH_ »** i dodaje go do pliku
- do instrukcji **« _RUN_ »** ```eval $(ssh-agent)``` – uruchamia agenta **« _SSH_ »**
- ```RUN --mount=type=ssh git clone git@github.com:97703/pawcho6.git pawcho6``` – klonowanie prywatnego repozytorium **« _Git_ »**, przy wykorzystaniu bezpiecznego dostępu **« _SSH_ »**

```diff
+# syntax=docker/dockerfile:1.4

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
+#️⃣ Instalacja klienta Open-SSH i GIT bez cache
+#️⃣ Pobranie klucza publicznego dla GitHuba, uruchomienie usługi SSH
+RUN apk add --update nodejs npm && rm -rf /var/cache/apk/* && apk add --no-cache openssh-client git \
+&& mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts && eval $(ssh-agent)

#️⃣ Ustawienie katalogu roboczego na /usr/app
WORKDIR /usr/app

+#️⃣ Sklonowanie repozytorium
+RUN --mount=type=ssh git clone git@github.com:97703/pawcho6.git pawcho6

#️⃣ Kopiowanie pliku package.json i index.js do obrazu
COPY ./package.json ./index.js  ./

#️⃣ Instalacja npm
RUN npm install

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
CMD ["sh", "-c", "npm start & nginx -g 'daemon off;'"]
```
<p align="center">
  <i>Rys. 4. Zmiany w pliku Dockerfile</i>
</p>

---

## 4. Instalacja i konfiguracja usługi BuildKit
*Pobranie, instalacja i konfiguracja usługi BuildKit*
<br><br><br>
Pobrano narzędzie ```BuildKit``` w postaci archwium z repozytorium [moby/buildkit](https://github.com/moby/buildkit) i zainstalowano je w folderze systemowym ```/bin```.
Zainstalowano usługę za pomocą polecenia
```
sudo docker run -d --rm --name buildkitd --privileged moby/buildkit:latest
```
w oparciu o oficjalny obraz oraz dodano zmienną środowiskową **« _BUILDKIT_HOST_ »** wymaganą dla narzędzia **« _buildctl_ »** za pomocą
```
export BUILDKIT_HOST=docker-container://buildkitd
```

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/instalacja_dockerkit.png" style="width: 50%; height: 50%" /></p>
<p align="center">
  <i>Rys. 5. Instalacja narzędzia BuildKit</i>
</p>

Tę część zrealizowano przy wykorzystaniu instrukcji autorstwa [medium.com](https://medium.com/@tonistiigi/build-secrets-and-ssh-forwarding-in-docker-18-09-ae8161d066).

---

## 5. Usługa ghcr.io
*W celu poprawnego eksportu obrazu potrzeba zalogować się do usługi ghcr.io z poziomu konsoli*
<br><br><br>
Zalogowano się do usługi [ghcr.io](https://ghcr.io) za pomocą nazwy użytkownika [GitHub](https://github.com/) oraz zapisanemu w zmiennej systemowej tokenowi.

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/logowanie_do_ghcr_io.png" style="width: 50%; height: 50%" /></p>
<p align="center">
  <i>Rys. 6. Logowanie do usługi ghcr.io</i>
</p>

---

## 6. Budowa obrazu
*Budowa obrazu za pomocą polecenia buildctl ze zmodyfikowanego pliku Dockerfile*
<br><br><br>
W celu zbudowanio obrazu użyto gotowego polecenia, które zostało umieszczone na prezentacji wykładowej nr 5.

```
buildctl build --frontend=dockerfile.v0 --sh default=$SSH_AUTH_SOCK --local context=. --local dockerfile=. --opt build-arg:VERSION=1.0 --output type=image,name=ghcr.io/97703/pawcho6:lab6,push=true
```

, gdzie:
- ```buildctl build``` – rozpoczyna proces budowania za pomocą narzędzia ```BuildKit```
- ```--frontend=dockerfile.v0``` – określa format i wersję dla frontend-u
- ```--ssh default=$SSH_AUTH_SOCK``` – ustawia wartość dla klucza SSH, który jest wykorzystywany do pobrania plików GitHub, za pomocą zmiennej systemowej $SSH_AUTH_SOCK tworzonej przy użyciu polecenia ```ssh-add <ścieżka-do-klucza>```
- ```--local context=.``` – określa kontekst dla procesu budowania; **« _._ »** oznacza bieżący katalog
- ```--local dockerfile=.``` – określa lokalizację pliku Dockerfile; **« _._ »** oznacza bieżący katalog
- ```--opt build-arg:VERSION=1.0``` – określa wartość zmiennej środowiskowej ARG
- ```--output type=image,name=ghcr.io/97703/pawcho6:lab6,push=true``` – definiuje lokalizację, w której ma być przechowywany obraz; w tym przypadku obraz zostanie przesłany do **« _GitHub Container Registry_ »** z nazwą ```pawcho6``` i tagiem ```lab6```

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/budowanie_obrazu.png" style="width: 50%; height: 50%" /></p>
<p align="center">
  <i>Rys. 7. Budowanie obrazu za pomocą narzędzie DockerKit</i>
</p>

---

## 7. Udostępnienie obrazu
*Zmiana ustawień przesłanego obrazu na platformie GitHub*
<br><br><br>
Zmieniono właściwości przesłanego obrazu [pawcho6:lab6](https://github.com/97703/pawcho6/pkgs/container/pawcho6) za pomocą ustawień [packages](https://github.com/) w zakładce z nazwą obrazu. Obraz upubliczniono i podpięto pod repozytorium [97703/pawcho6](https://github.com/97703/pawcho6).

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/github_package.png" style="width: 100%; height: 100%" /></p>
<p align="center">
  <i>Rys. 8. Widok obrazu w zakładce Packages konta GitHub</i>
</p>

---

## 8. Uruchomienie kontenera
*Uruchomienie kontenera na bazie wcześniej przesłanego obrazu*
<br><br><br>
Uruchomiono kontener za pomocą polecenia

```
docker run -d --rm -p 80:80 --hostname dockerlab6 --name lab6 ghcr.io/97703/pawcho6:lab6
```

, gdzie:
- ```docker run``` – rozpoczyna proces uruchamiania kontenera na bazie obrazu
- ```-d``` – uruchomienie w postaci daemon-a; uruchomienie w tle
- ```--rm``` – usunięcie kontenera po zatrzymaniu
- ```-p 80:80``` – mapowanie portu **« _80_ »** hosta na port **« _80_ »** kontenera
- ```--hostname dockerlab6``` – ustawienie nazwy hosta
- ```--name lab6``` – nadanie nazwy kontenerowi
- ```ghcr.io/97703/pawcho6:lab6``` – określenie obrazu na bazie którego ma zostać uruchomiony kontener; w tym przypadku kontener zostanie uruchomiony na podstawie wcześniej przesłanego do **« _GitHub Container Registry_ »** obrazu

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/uruchomienie_kontenera.png" style="width: 50%; height: 50%" /></p>
<p align="center">
  <i>Rys. 9. Uruchomienie kontenera na bazie przesłanego obrazu</i>
</p>

---

## 9. Potwierdzenie poprawności działania
*Weryfikacja poprawności działania kontenera*
<br><br><br>
W przeglądarce została wpisana fraza ```localhost/```. Po chwili uzyskano odpowiedź z serwera **« _NGINX_ »** działającego na konterze **« _lab6_ »** (patrz *Rys. 10.*).
Przeglądarka otrzymała i wyświetliła poprawne dane. Nazwa hosta jest tożsama z nazwą podaną przy uruchomieniu kontenera. Kontener działa więc poprawnie. 

<p align="center">
  <img src="https://raw.githubusercontent.com/97703/pawcho6/main/Rysunki/odpowiedz_nginx.png" style="width: 30%; height: 30%" /></p>
<p align="center">
  <i>Rys. 10. Odpowiedź z serwera NGINX</i>
</p>

---

## 10. Podsumowanie
*Wnioski*
<br><br><br>

Zadanie zostało zrealizowane pomyślnie.

Do utworzenia repozytorium użyto usługi [CLI](https://cli.github.com/), która pozwala na efektywne zarządzanie repozytoriami [GitHub](https://github.com/) z poziomu konsoli.
Zainstalowano narzędzie [BuildKit](https://github.com/moby/buildkit) pozwalające na alternatywne budowanie obrazów i przesyłanie ich do serwisu **« _GitHub Container Registry_ »**, który umożliwia komfortowe administrowanie obrazami typu **« _Docker_ »**.
Uruchomiono kontener na podstawie przesłanego obrazu i przetestowano jego działanie.

Podczas procesu realizacji zadanie nie napotkano błędów.

Budowanie obrazów oraz uruchamianie kontenerów w ramach tego rozwiązania przekłada się na znaczną efektywność i wygodę w porównaniu z tradycyjnym podejściem.
