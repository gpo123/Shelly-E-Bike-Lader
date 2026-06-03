// ================================================================
// Shelly Plug M Gen3 - Intelligente Akku-Ladebegrenzung (v2)
// Schaltet ab, wenn der Ladestrom in der CV-Phase auf einen
// Bruchteil seines Spitzenwerts gefallen ist. Trifft dadurch
// jedes Mal etwa denselben Ladestand (~80-90%), egal wie voll
// der Akku gestartet ist.
// Zusaetzlich: Wh-Sicherheitslimit als Fallback.
// Original-Skript von Olaf von fahrradblog.de
// ergänzt um Energiemenge mit Akku-Iststand von gpo123 
// ================================================================

// ---------- EINSTELLUNGEN ----------

// Ziel Ladezstand in Prozent, aktueller Akku Stand wird über virtuelle Komponente als Eingabe vom Skript übernommen
// die nächsetn 3 Werte regel das Laden über Energiemenge
let target = 80;

// Akku Kapazität in Wh
let KAPA_WH = 750;

// Laden Wirkungsgrad als Faktor 
let eff = 0.9;

// Abschalten, wenn die Leistung auf diesen Anteil des Spitzenwerts faellt.
// 0.5 = bei 50% des Peaks. HOEHER = frueher aus = niedrigerer SoC.
// NIEDRIGER = spaeter aus = hoeherer SoC. Einmal kalibrieren (s. Anleitung).
// funktioniert beim Bosch Smart-System mit 4A-Lader nicht wirklich (Umschaltung erst bei ca 95%)
let DROP_THRESHOLD = 0.85;

// Sicherheitslimit: spaetestens nach so vielen Wh aus der Steckdose
// wird abgeschaltet, falls die Stromabfall-Logik nie ausloest.
let TARGET_WH = 500;

// Ab dieser Leistung (W) gilt der Ladevorgang als gestartet.
let MIN_CHARGE_W = 15;

// Erst nach so vielen geladenen Wh wird die Stromabfall-Logik scharf.
// Verhindert Fehlausloesung beim Einschwingen / fast vollem Start.
let ARM_AFTER_WH = 10.0;

// So viele Messungen in Folge muessen unter der Schwelle liegen,
// bevor abgeschaltet wird (Entprellung gegen kurze Schwankungen).
let CONSECUTIVE = 3;

// Pruefintervall in Millisekunden (10000 = alle 10 Sekunden).
let POLL_MS = 10000;

// Ausgabe ins Log
let LOG = true;

// ---------- AB HIER NICHTS AENDERN ----------

let charging = false;
let startEnergy = 0;
let peakPower = 0;
let belowCount = 0;

function reset() {
charging = false;
startEnergy = 0;
peakPower = 0;
belowCount = 0;
}

function shutdown(grund) {
Shelly.call("Switch.Set", { id: 0, on: false });
if (LOG) { print("Abschaltung:", grund); }
reset();
}

function check() {  
let st = Shelly.getComponentStatus("switch:0");
if (st === undefined || st === null) { return; }

let on = st.output;
let power = st.apower;
let total = st.aenergy.ttotal;

// Steckdose aus -> zuruecksetzen
if (on !== true) { reset(); return; }

// Laden noch nicht gestartet
if (charging === false) {
if (power >= MIN_CHARGE_W) {
let TARGET_WH = ((target-Shelly.getComponentStatus("number:200").value)/100*KAPA_WH/eff);
if (TARGET_WH <= ARM_AFTER_WH) {
TARGET_WH = ARM_AFTER_WH;
}
charging = true;
startEnergy = total;
peakPower = power;
belowCount = 0;
if (LOG) { print("Ladebeginn erkannt. Zu ladende Kapazität: " +  JSON.stringify(TARGET_WH) + "Wh"); }
}
return;
}

let geladen = total - startEnergy;

// Spitzenwert (CC-CV-Knie) laufend nachfuehren
if (power > peakPower) { peakPower = power; }

//aktuelle Wrte ausgeben
if (LOG) {print ("Geladen:" + JSON.stringify(geladen) + "Wh Akt.:" + JSON.stringify(power) +"W Peak:"+ JSON.stringify(peakPower) +"W" );}

// Lademenge zuerst prüfen
if (geladen >= TARGET_WH) {
shutdown("Wh-Ziel erreicht (" + JSON.stringify(geladen) + " Wh).");
return;
}

// Stromabfall-Logik erst nach Mindestladung scharf schalten
if  (geladen < ARM_AFTER_WH) { return; }

// Ist die Leistung weit genug unter den Spitzenwert gefallen?
if (power <= peakPower * DROP_THRESHOLD) {
belowCount = belowCount + 1;
if (belowCount >= CONSECUTIVE) {
shutdown("CV-Phase: Leistung auf " + JSON.stringify(DROP_THRESHOLD * 100) + "% des Peaks gefallen. Akku ~80-90%.");
}
} else {
belowCount = 0;
}
}

// Beim Start pruefen, ob bereits geladen wird
let initSt = Shelly.getComponentStatus("switch:0");
if (initSt !== undefined && initSt !== null && initSt.output === true && initSt.apower >= MIN_CHARGE_W) {
charging = true;
startEnergy = initSt.aenergy.total;
peakPower = initSt.apower;
//zu ladende Lademenge aus virtueller Komponente einstellen 
let TARGET_WH = ((target-Shelly.getComponentStatus("number:200").value)/100*KAPA_WH/eff);
if (TARGET_WH <= ARM_AFTER_WH) {
TARGET_WH = ARM_AFTER_WH;
}
if (LOG) { print("Script gestartet, Ladevorgang laeuft bereits. Zu ladende Kapazität: " +  JSON.stringify(TARGET_WH) + "Wh"); }
}

Timer.set(POLL_MS, true, check);;
if (LOG) { print("Intelligente Ladebegrenzung aktiv. Schwelle:", DROP_THRESHOLD); }