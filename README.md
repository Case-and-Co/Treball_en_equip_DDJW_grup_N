# INFORME DE PROJECTE: DEEPFAKE TRUTH

**Organització:** Case & Co  
**Desenvolupadors:** Gerard Casellas Bosch i Arià Casellas Bosch  
**Assignatura:** Disseny i Desenvolupament de Jocs Web (DDJW)  
**Motor Gràfic:** Phaser 3 (v3.60.0)  

---

## i. Introducció

El projecte **Deepfake Truth** és un minijoc web desenvolupat pel grup de treball **Case & Co**. El rerefons narratiu del joc situa l'usuari en el paper d'un investigador tecnològic que ha d'enfrontar-se a una intel·ligència artificial (IA) central que intenta escapar i propagar desinformació mitjançant la seva habilitat de modificar la realitat.

---

## ii. Descripció del disseny del joc

El disseny de *Deepfake Truth* combina dos gèneres clàssics de l'arcade: el **runner de carrils verticals** i el **shoot 'em up**. 

### A. Estructura de l'Estat del Joc
El joc manté un objecte global descentralitzat denominat `gameState` que preserva les variables fonamentals al llarg de la partida:
* `vida`: Control de la integritat del jugador.
* `temps`: Un temporitzador de compte enrere de 30 segons que actua com a límit de joc.
* `bossVida`: Els punts de salut de l'enemic principal, configurats inicialment en 100.

### B. Mecàniques de Joc
1. **Moviment del Jugador:** L'usuari controla un avatar posicionat a la zona inferior de la pantalla. El moviment està restringit a tres carrils verticals fixos (Esquerra, Centre, Dreta). El canvi de carril es realitza mitjançant desplaçaments horitzontals fluids guiats per animacions interpolades (*tweens*).
2. **Intel·ligència de l'Enemic Principal:** A la part superior, presideix el Boss. El Boss no és estàtic; cada 800 mil·lisegons tria automàticament i de forma aleatòria un dels tres carrils per moure's lliscant lateralment.
3. **Generació d'Obstacles:** El Boss genera de forma contínua (cada 1.2 segons) brossa de dades o obstacles que neixen directament de la seva posició i cauen verticalment cap avall a una velocitat constant, actuant com una barrera que el jugador ha d'esquivar.
4. **Sistema d'Atac:** El jugador disposa de la capacitat de llançar projectils verticals cap amunt des del seu carril actual per contraatacar el Boss, però aquests no podran travessar els obstacles. El jugador s'haurà de col·locar a davant del boss per poder-l'ho disparar el qual el posa en risc, ja que els obstacles aniran directament cap a ell.

### C. Condicions de Finalització
* **Condició de Victòria:** El jugador aconsegueix reduir la vida de la IA a 0 mitjançant els seus trets directes.
* **Condició de Derrota per Col·lisió:** Xocar contra qualsevol obstacle llançat pel Boss acaba instantàniament la partida.
* **Condició de Derrota per Temps:** Si el compte enrere global arriba a 0 segons abans de destruir el Boss, la IA aconsegueix escapar i l'usuari perd la partida.

### D. Flux d'Escenes del Videojoc
El flux d'escenes està dissenyat de manera circular i infinita, evitant trencar o reiniciar la instància de Phaser en cap moment:
[ MainMenu ]  <=======> [ CreditsScene ]
|
v (Començar Partida)
[ SceneMJ2 ] <------->  [ PauseMenu ] (Prement ESC) ---> (Tornar al Menú / Reprendre la partida)
|
+---> (Si guanya)  ==> [ VictoryMenu ]  ---> (Tornar al Menú / Reintentar)
|
+---> (Si perd)   ==> [ GameOverMenu ] ---> (Tornar al Menú / Reintentar)


---

## iii. Descripció de les parts més rellevants de la implementació

L'arquitectura del programari està dividida de manera modular en dos fitxers core (`game.js` i `menu.js`) que cooperen gràcies a la càrrega global de scripts realitzada per l'arxiu central `index.html`.

### 1. Sistema Modular de Múltiples Escenes
Dins del projecte, l'objecte de configuració de Phaser recopila i registra de forma centralitzada les 6 classes d'escenes independents desenvolupades (el Menú Principal, la Pantalla de Crèdits, el Joc Principal, el Menú de Pausa i les pantalles de Game Over i Victòria). El motor arrenca per defecte la pantalla principal i els salts cap a les escenes secundàries es gestionen de manera nativa mitjançant crides al sistema de control de flux de Phaser.

### 2. Gestió Avançada de Col·lisions i Físiques de Grups
Hem fet servir l'**Arcade Physics Manager** de Phaser per controlar entitats en moviment sense penalitzar el rendiment de la memòria. Els obstacles i els projectils es gestionen com a col·leccions dinàmiques (Grups de Físiques). S'han configurat detectors de superposició asíncrons per avaluar tres situacions crítiques:
* **Jugador vs Obstacle:** Gestiona l'impacte i la mort immediata.
* **Bala vs Obstacle:** Destrueix el projectil del jugador en xocar amb la defensa, impedint que les bales travessin les línies de protecció de la IA.
* **Bala vs Boss:** Detecta l'impacte contra l'enemic, restant punts a la seva barra de salut i actualitzant els indicadors visuals de la pantalla.

### 3. Sistema de Pausa
La pausa es llança mitjançant la tecla `ESC`. Per evitar destruir l'estat visual o perdre la posició dels elements enemics, utilitzem la interrupció no destructiva de Phaser. El mètode de pausa congela instantàniament els vectors de velocitat de les físiques i deté els temporitzadors actius del joc. Paral·lelament, es llança una escena superposada per al Menú de Pausa que dibuixa un fons amb opacitat reduïda, permetent al jugador continuar veient l'estat del joc congelat de fons mentre interactua amb les opcions de reprendre o sortir.

### 4. Reciclador d'Entitats
Per evitar que el joc pateixi ralentitzacions o problemes de memòria per l'acumulació infinita d'objectes invisibles un cop surten de la pantalla, el mètode d'actualització cíclica del joc inspecciona contínuament les coordenades de les entitats. Si un obstacle o un projectil supera els llindars inferiors o superiors establerts, s'elimina totalment de la memòria del navegador.

### 5. Poliment Visual
S'han incorporat diversos elements visuals per potenciar l'experiència immersiva:
* **Efecte de Velocitat de Fons:** Un conjunt de línies verticals es desplacen contínuament cap avall. En superar el límit inferior es reposicionen dalt de tot de manera automàtica, simulant una carretera de velocitat infinita.
* **Sistemes de Partícules:** Es genera una textura dinàmica de brillantor que mitjançant un emissor lligat a l'avatar del jugador genera un rastre amb mode de fusió additiu per destacar el moviment.
* **Manipulació de Càmeres:** Apliquem de manera directa efectes de shake i flaix de llum en rebre danys o destruir l'enemic, aportant un gran impacte òptic a l'acció.

---

## iv. Conclusions i problemes trobats

### Problemes Trobats i Resolucions

1. **Reset de propietats de Físiques en Grups Dinàmics:**
   * *Problema:* Al principi del disseny de la lluita contra el Boss, els obstacles es creaven correctament però es quedaven flotant de manera estàtica a la part superior de la pantalla sense desplaçar-se cap al jugador.
   * *Solució:* Vam descobrir que s'assignava la velocitat de caiguda a l'obstacle just abans d'afegir-lo al grup de físiques de Phaser. El motor, en introduir un element en un grup regulat, sobreescriu i reinicia les propietats de velocitat per defecte. Es va solucionar reordenant la lògica per aplicar la velocitat de desplaçament exclusivament després d'haver vinculat l'entitat al grup.

2. **Congelació de Físiques després del reinici d'escena:**
   * *Problema:* Quan el jugador perdia la partida i premia el botó de reintentar, l'escena es tornava a carregar correctament però cap obstacle ni bala es movia, quedant el joc bloquejat.
   * *Solució:* L'estat de pausa general de les físiques invocat durant la pantalla de derrota persistia en la memòria interna del motor a pesar d'efectuar un reinici d'escena. Es va solucionar implementant una reactivació explícita i forçada de la represa de les físiques a la primera línia del mètode de creació del joc.
  
3. **Duplicació de motors Phaser:**
   * *Problema:* Al principi la base del joc no estava feta amb Phaser, ens vam dividir les tasques i en diferents branques cadascú va crear el seu motor Phaser.
   * *Solució:* Vam haver de reescriure bona part del codi i centralitzar el motor en un sol script.

### Conclusions
El desenvolupament de **Deepfake Truth** ha mostrat la importància de comptar amb un entorn de treball altament modular i predictible. L'adopció d'una arquitectura orientada a objectes i basada en esdeveniments, mitjançant les funcions natives de Phaser, ha permès separar per complet la interfície visual del flux operatiu de les dades bàsiques. Treballar sota un motor gràfic ha optimitzat la col·laboració en equip al repositori de GitHub, dividint el desenvolupament de pantalles i garantint un control de cicle de vida transparent, lliure de dependències creuades i amb un rendiment de memòria impecable.

---

## v. Manual d’usuari

### A. Controls Operatius de la Interfície
* **Moure's lateralment:** Prem la `Fletxa Esquerra` o la `Fletxa Dreta` del teu teclat per fer saltar instantàniament el teu personatge entre els tres carrils verticals de la pantalla per esquivar la informació brossa.
* **Disparar bales d'energia:** Prem la `Barra Espaiadora` per llançar projectils cap amunt per impactar contra la IA i danyar la seva barra de salut.
* **Menú de Pausa:** Prem la tecla `ESC` enmig de la partida per congelar l'acció. Dins d'aquest menú conceptual es pot clicar en *Reprendre Partida* per continuar jugant o *Sortir al Menú* per finalitzar de forma anticipada.

### B. Guia Visual de la Interfície (HUD)
Durant la confrontació contra la IA, la pantalla mostra de manera directa dos indicadors vitals integrats en les cantonades superiors:
1. **Temps (Top-Esquerra):** Un temporitzador que realitza un compte enrere començant en 30 segons. Si el comptador arriba a zero abans d'eliminar el cap enemic, la IA s'escaparà i finalitzarà la partida en derrota.
2. **Boss HP (Top-Dreta):** Mostra la barra de vida de la Intel·ligència Artificial. Inicia amb 100
