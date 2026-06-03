# Shelly-E-Bike-Lader
Skript zur Begrenzung des Ladens eines E-Bike Akkus auf ca 80%. Funktioniert über zugefügte Lademenge bzw. CC/CV-Ladeknick-Erkennung mittels einen Shelly Plug M gen3 oder Plug S gen3

Der Inhalt von E-Bike_Loader.shelly.ts muss als Skript auf den Plug geladen werden.

Original stammt von Olaf vom fahrradblog.de

Anzupassende Variablen im Skript:

target: Zielwert der Akkuladung in Prozent (default 80)

KAPA_WH: Kapazität des Akkus in %

eff: Wirkungsgrad des Ladevorgangs. Stellt den Gesamt-Wirkungsgrad von Ladegerät und des Ladens selber dar. Muss entsprechend angepasst werden wenn man über Lademenge läd.

DROP_THRESHOLD: Üblicherweise werden LiIon-Akkus zuerst mit hohem konstante Strom geladen um irgendwann auf Konstant-Spnannung um zuschalten. Dadurch nimmt der Lader entsprechen weniger Leistung auf. Mittels dieses Werts kann man diese Umschaltung früher (=höherer Wert) oder später (=kleinerer Wert) erkennen.

MIN_CHARGE_W: ab diesem Wert, der vom Shelly Plug gemessen wird, gilt der Ladevorgang als gestartet. So kann erkannt werden das der Lader am Akku eingesteckt und gestartet ist.

ARM_AFTER_WH: Mindestlademenge die in den Akku geflosen sein muß um die Abschaltlogiken scharf zu schalten. Dient zum Entprellen beim Ladestart.

CONSECUTIVE: Anzahl an Messungen bei denen der aktuelle gemessene Leistungswert unter die gemessene Spitzenleistung gefallen sein muss um über die Erkennung  der CC/CV-Schwelle abzuschalten. Dient der Entprellung.

POLL_MS: Püfintervall für die Abschaltkriterien Lademenge oder CC/CV-Schwelle

LOG: Ausgabe ins LOG aktivieren

Um den aktuellen Akkustand an das Skript übertragen zu können muß eine virtuelle Komponente so angelegt werden:
<img width="1233" height="549" alt="virtuelleKomponente" src="https://github.com/user-attachments/assets/d48ebe2f-cac3-48e0-ab94-c6ccd2bc78e2" />

Vor dem Ladevorgang ist dann jedes Mal der aktuelle Akku-Ladestand dort ein zutragen. Alternativ, wenn man sich auf CC/CV Umschaltung verlassen kann/will lässt man den Default-Wert bei 10-20%.
Wichtig: die virtuelle Komponente wird als number:200 im Skript verarbeitet und ist entsprechend anzulegen. Wen man bereits weitere Komponenten angelegt hat muß das Skript entsprechend angepasst werden.

Coming next: Alle 10 Ladungen auf 100% laden um ein Balancing zu erzwingen

VERWENDUNG NUR UNTER VOLLSTÄNDIGEM HAFTUNGSASSCHLUSS MEINERSEITS ! 

FÜR SCHÄDEN AN AKKU ODER E-BIKE IST DER NUTZER SELBST VERANWORTLICH! 
