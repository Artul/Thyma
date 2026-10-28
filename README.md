# Thyma – Foundry VTT Modul

Offizielles [Foundry VTT](https://foundryvtt.com/)-Modul für die Welt **Thyma**. Es erweitert das System **D&D 5e** um Thyma-spezifische Inhalte wie eine eigene Blüten-Währung, Spezies und Zauber und bringt Werkzeuge für gestreamte Runden mit: eine automatische **Zuschauerkamera** und eine ausblendbare Benutzeroberfläche.

![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v13-orange)
![System](https://img.shields.io/badge/System-dnd5e-red)
![Release](https://img.shields.io/github/v/release/Artul/Thyma)

---

## Inhalt

- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Features](#features)
  - [Zuschauerkamera](#zuschauerkamera)
  - [Stream-Modus (UI ausblenden)](#stream-modus-ui-ausblenden)
  - [Währung](#währung)
  - [Sprachen](#sprachen)
- [Einstellungen](#einstellungen)
- [Tastenkürzel](#tastenkürzel)
- [Kompendien](#kompendien)
- [Projektstruktur](#projektstruktur)
- [Entwicklung & Releases](#entwicklung--releases)
- [Autor](#autor)

---

## Voraussetzungen

| Komponente   | Version                      |
|--------------|------------------------------|
| Foundry VTT  | v13 (Minimum & verifiziert)  |
| Spielsystem  | `dnd5e`                      |

## Installation

1. Foundry VTT öffnen und zu **Add-on Modules → Install Module** wechseln.
2. Unten im Feld **Manifest URL** folgende Adresse einfügen:
   ```
   https://github.com/Artul/Thyma/releases/latest/download/module.json
   ```
3. Auf **Install** klicken.
4. In der gewünschten Welt unter **Game Settings → Manage Modules** das Modul **Thyma** aktivieren.

Das Modul ist auf Englisch und Deutsch verfügbar.

---

## Features

### Zuschauerkamera

Die Zuschauerkamera macht aus einem eigenen Foundry-Benutzer eine automatische Kamera, z. B. für einen Stream oder einen zweiten Bildschirm am Spieltisch. Der Client dieses Benutzers schwenkt und zoomt selbstständig, sodass immer das Relevante im Bild ist.

**Außerhalb des Kampfes**
- Die Kamera hält alle sichtbaren Spielercharaktere gleichzeitig im Bild.
- Bewegt sich ein Spielertoken, folgt die Kamera und passt den Zoom so an, dass die Gruppe sichtbar bleibt.
- Beim Szenenwechsel richtet sich die Kamera automatisch auf die Gruppe aus.

**Im Kampf**
- Bei jedem Zugwechsel springt die Kamera zum aktiven Kampfteilnehmer.
- Markiert der Spieler am Zug (bzw. der GM bei NSCs) Ziele, werden diese mit ins Bild genommen.
- Bewegungen sichtbarer Tokens werden verfolgt, auch die von Gegnern.
- Endet der Kampf, kehrt die Kamera zur Gruppenansicht zurück.

**Weitere Auslöser**
- **Pings:** Pingt jemand auf der Karte, schwenkt die Kamera schnell dorthin und behält dabei die Gruppe im Bild.
- **Flächenvorlagen:** Wird eine Vorlage (Kreis, Rechteck, Kegel, Linie) erstellt oder verändert, zoomt die Kamera so, dass die gesamte Fläche sichtbar ist.
- **Bild-Popups:** Geteilte Bilder werden beim Zuschauer nach einer einstellbaren Zeit automatisch geschlossen; ein neues Bild ersetzt das vorherige.

Kleine Bewegungen werden ignoriert, damit das Bild ruhig bleibt. Unsichtbare oder im Nebel verborgene Tokens lösen keine Kamerafahrt aus.

**Einrichtung**
1. Einen eigenen Benutzer für die Kamera anlegen (z. B. „Zuschauer“) und mit ihm in einem separaten Browser bzw. einer OBS-Browserquelle einloggen.
2. Als GM in den Moduleinstellungen **Zuschauerkamera aktivieren** einschalten.
3. Unter **Zuschauer-Nutzer** diesen Benutzer auswählen.
4. Die Welt neu laden.

Damit die Kamera Spielertokens erkennt, muss jedem Spieler in seiner Benutzerkonfiguration sein Charakter zugewiesen sein.

### Stream-Modus (UI ausblenden)

Mit <kbd>H</kbd> lässt sich die komplette Foundry-Oberfläche (Seitenleiste, Steuerelemente, Hotbar, Spielerliste, Navigation) ein- und ausblenden. Übrig bleibt nur die Karte, ideal für die Kamera-Ansicht im Stream. Die Einstellung gilt nur für den eigenen Client.

### Währung

Thyma verwendet statt Elektrum (EP), das entfernt wird, ein Blütensystem aus drei Familien mit je drei Stufen. Die neuen Währungen erscheinen mit eigenen Symbolen auf dem Charakterbogen; die Währungsleiste wird dafür zweizeilig dargestellt.

| Familie | Bright | Glimmer | Dull |
|---------|--------|---------|------|
| **Dark Blossom** | Dark Bright Blossom (`dbb`) | Dark Glimmer Blossom (`dgb`) | Dark Dull Blossom (`ddb`) |
| **Sun Blossom**  | Sun Bright Blossom (`sbb`)  | Sun Glimmer Blossom (`sgb`)  | Sun Dull Blossom (`sdb`)  |
| **Moon Blossom** | Moon Bright Blossom (`mbb`) | Moon Glimmer Blossom (`mgb`) | Moon Dull Blossom (`mdb`) |

Die Umrechnungskurse sind in `scripts/currencies.js` hinterlegt.

### Sprachen

Neue Sprachkategorie *Thyma* mit der Sprache **Sylthari**, auswählbar auf dem Charakterbogen.

---

## Einstellungen

Alle Einstellungen gelten weltweit und sind nur für den GM änderbar.

| Einstellung | Standard | Beschreibung |
|-------------|----------|--------------|
| Zuschauerkamera aktivieren | aus | Schaltet die automatische Zuschauerkamera ein (erfordert Neuladen). |
| Zuschauer-Nutzer | – | Benutzer, dessen Client als Kamera dient (erfordert Neuladen). |
| Automatische Schließzeit für Bild-Popups | 15 s | Wie lange geteilte Bilder beim Zuschauer sichtbar bleiben. `0` deaktiviert das automatische Schließen. |

## Tastenkürzel

Beide Tastenkürzel können unter **Configure Controls** geändert werden.

| Taste | Aktion |
|-------|--------|
| <kbd>H</kbd> | Foundry-Oberfläche ein-/ausblenden (Stream-Modus) |
| <kbd>K</kbd> | Kampfmodus der Zuschauerkamera umschalten. Drückt der GM die Taste, wird der Befehl per Socket an den Zuschauer-Client gesendet. Praktisch, wenn die Kamera ohne Kampftracker in den Kampfmodus wechseln soll oder zurück zur Gruppenansicht. |

---

## Kompendien

Die Kompendien erscheinen im Kompendium-Tab gesammelt im Ordner **Thyma**. Spieler haben Leserechte (Observer), Assistenz-GMs Besitzrechte (Owner).

| Kompendium | Inhalt |
|------------|--------|
| **Species** | Achnyx, Kurjupu – inklusive ihrer Merkmale und natürlichen Waffen |
| **Spells** | Storm Bolt, Telekinetic Grip (Zaubertricks), Lightning Lance (3. Grad) |
| **Backgrounds** | Balance Keeper |
| **Items** | Balance Keeper Abzeichen, Undertaker Tools |
| **Classes** | *noch leer* |
| **Feats** | *noch leer* |

---

## Projektstruktur

```
Thyma/
├── module.json            # Modul-Manifest (Platzhalter werden beim Release ersetzt)
├── lang/
│   ├── de.json            # Deutsch
│   └── en.json            # Englisch
├── packs/                 # Kompendien (LevelDB)
├── icons/                 # Bilder für Währung, Spezies, Zauber, Items
├── styles/
│   └── thyma.css          # Stream-Modus & Währungslayout
└── scripts/
    ├── main.js            # Einstiegspunkt, registriert Hooks und Socket
    ├── settings.js        # Moduleinstellungen
    ├── keybinds.js        # Tastenkürzel
    ├── spectatorCamera.js # Zuschauerkamera
    ├── currencies.js      # Blüten-Währung
    ├── languages.js       # Thyma-Sprachen
    └── utils.js           # Hilfsfunktionen (Eckpunkte von Flächenvorlagen)
```

---

## Entwicklung & Releases

### Lokal entwickeln

Repository direkt in den Modulordner der Foundry-Installation klonen:

```bash
cd <FoundryData>/Data/modules
git clone https://github.com/Artul/Thyma.git thyma
```

Der Ordnername muss der Modul-ID **`thyma`** entsprechen (kleingeschrieben), da Pfade wie `modules/thyma/icons/...` darauf verweisen. Während Git die Kompendien verändert (z. B. beim Branch-Wechsel), sollte Foundry nicht laufen.

### Branches & Labels

Pull Requests werden anhand des Branch-Namens automatisch gelabelt:

| Branch-Präfix | Label | Kategorie in den Release Notes |
|---------------|-------|--------------------------------|
| `feature/`, `enhancement/` | feature / enhancement | 🚀 Features |
| `fix/`, `bugfix/`, `bug/` | fix / bugfix / bug | 🐛 Bug Fixes |
| `documentation/` | documentation | 📝 Documentation |
| `chore/` | chore | 🧰 Maintenance |
| `dependency-upgrade/` | dependency-upgrade | 📦 Dependency Management |

### Release erstellen

1. Release Drafter pflegt automatisch einen Entwurf mit der nächsten Patch-Version (`vX.Y.Z`) und den gesammelten Änderungen.
2. Den Entwurf auf GitHub prüfen und **veröffentlichen**.
3. Die GitHub Action ersetzt die Platzhalter in `module.json` (Version, URL, Manifest, Download), packt `icons/`, `lang/`, `packs/`, `scripts/`, `styles/` und `module.json` in eine `module.zip` und hängt beide Dateien an das Release an.

Foundry erkennt neue Versionen anschließend automatisch über die Manifest-URL.

---

## Autor

- **Artul**
