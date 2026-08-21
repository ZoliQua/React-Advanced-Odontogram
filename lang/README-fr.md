# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-2.4.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md)

---

## 📑 Sommaire

- [📋 Aperçu général](#-aperçu-général)
- [📦 Utilisation comme paquet npm](#-utilisation-comme-paquet-npm)
- [✨ Fonctionnalités clés](#-fonctionnalités-clés)
- [📦 Modules](#-modules)
- [🛠️ Contrôles de l'interface](#-contrôles-de-linterface)
- [🦷 Types et états de dents](#-types-et-états-de-dents)
- [⚙️ Paramètres](#-paramètres)
- [🖼️ Système de modèles SVG](#-système-de-modèles-svg)
- [🔢 Systèmes de numérotation](#-systèmes-de-numérotation)
- [🚀 Utilisation](#-utilisation)
- [🔗 Intégration](#-intégration)
- [🧪 Tests](#-tests)
- [📖 Documentation d'API](#-documentation-dapi)
- [📡 API publique](#-api-publique)
- [💾 Persistance de l'état (localStorage)](#-persistance-de-létat-localstorage)
- [💾 Format d'export/import de l'état](#-format-dexportimport-de-létat)
- [🖨️ Export](#-export)
- [📁 Structure des dossiers](#-structure-des-dossiers)
- [⚙️ Pile technique](#-pile-technique)
- [📝 Notes](#-notes)
- [🔒 Notes de sécurité](#-notes-de-sécurité)
- [📖 Comment citer](#-comment-citer)

## 🇫🇷 Français

> ℹ️ Cette version française est une traduction de la source anglaise (EN). En cas de divergence, la version anglaise fait foi.

### 📋 Aperçu général
Ce projet est un éditeur d'odontogramme interactif fonctionnant dans le navigateur, qui prend en charge une saisie rapide du schéma dentaire au moyen d'une interface épurée. Il génère des modèles de dents SVG superposés pour représenter les restaurations, les caries, le statut endodontique, la mobilité et d'autres détails cliniques, tout en offrant la sélection multiple, des filtres de sélection et des préréglages d'état prédéfinis.

---
![Éditeur d'odontogramme — aperçu en anglais](screenshot_en_odontogram.png)

🔗 **URL de test :** https://react-odontogram-modul.vercel.app/

---

### 📦 Utilisation comme paquet npm

L'odontogramme est fourni sous forme de bibliothèque de composants React autonome sur npm :
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Prérequis
- **React 18 ou 19** (déclaré comme dépendance de pair — fournie par votre application).
- Un **bundler** comprenant le champ `exports` et ESM : Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. Le paquet est **ESM uniquement**.
- Node **≥ 18** pour les outils de développement.

#### Installation

```bash
npm install react-advanced-odontogram react react-dom
```

#### Utilisation de base

Affichez `OdontogramShell` et importez la feuille de style **une seule fois** n'importe où dans votre application :

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="en"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Props du composant

`OdontogramShell` est un composant contrôlé. Les props les plus courantes :

| Prop | Type | Par défaut | Description |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Langue de l'interface (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Système de numérotation dentaire. |
| `darkMode` | `boolean` | `false` | Bascule du thème sombre. |
| `readOnly` | `boolean` | `false` | Désactive toute modification (lecture seule). |
| `themeConfig` | `OdontogramThemeConfig` | — | Surcharge des variables CSS du thème (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Enregistre des plugins d'état personnalisés / des calques supplémentaires. |
| `enableNotes` | `boolean` | `false` | Active les notes par dent. |
| `enableIcdas` | `boolean` | `false` | Active le système d'évaluation des caries ICDAS II. |
| `fillingComplexity` | `"complex" \| "simple"` | `"complex"` | Complexité de l'obturation : `"simple"` (un matériau par dent) ou `"complex"` (matériaux par surface). |
| `fillingDefectEnabled` | `boolean` | `true` | Active les constats de défaut d'obturation sur la carte Obturations. |
| `fillingMaterialAvailability` | `Record<string, boolean>` | tous disponibles | Matériaux d'obturation disponibles sous forme de mappage booléen sur `amalgam`/`composite`/`gic`/`temporary` (les clés inconnues sont ignorées). |
| `fissureSealingEnabled` | `boolean` | `true` | Active le scellement des sillons sur la carte Obturations. |
| `onFillingComplexityChange` / `onFillingDefectEnabledChange` / `onFillingMaterialAvailabilityChange` / `onFissureSealingEnabledChange` | `(...) => void` | — | Déclenché lorsque l'utilisateur modifie le paramètre correspondant depuis Paramètres → Obturations. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Déclenché lorsque l'utilisateur modifie le paramètre depuis l'interface. |

Des props de niveau de détail plus fines (`pulpDetailLevel`, `secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`, `wearDetailLevel`, `discolorationDetailLevel`, `surfaceNotation`, `showStatusCard`, `showOrthoCard`) sont également acceptées — voir les types `.d.ts` fournis pour la liste complète et typée.

Les quatre props d'obturation ci-dessus sont de type **« restauration uniquement »** : une prop omise n'écrit jamais dans le moteur (un appel impératif à `setFillingComplexity()` avant le montage est préservé et le mode autonome est inchangé), tandis qu'une prop fournie écrit le moteur et l'état du modal Paramètres ensemble, de sorte que le modal n'affiche jamais de valeur obsolète. `fillingMaterialAvailability` est appliquée par diff via une clé sérialisée canonique — un re-rendu avec un littéral inline de contenu identique ne réécrit jamais le moteur. Les callbacks `on*Change` se déclenchent depuis Paramètres → Obturations : le chemin d'écriture pour les hôtes qui persistent les préférences.

#### API publique (exports nommés)

`OdontogramShell` est à la fois l'export par défaut et un export nommé. L'API d'état impérative, le composant `PerioChart` autonome, la visite guidée et tous les types publics sont des exports nommés depuis le même point d'entrée :

```ts
import {
  OdontogramShell,           // also the default export
  PerioChart,                // standalone periodontal chart component
  // read state
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // subscribe to state changes
  // export / import
  exportFhir,                // HL7 FHIR R4 bundle
  exportSvg, exportImage,    // vector / raster chart export
  setImportFormat,
  // control
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // launch the onboarding tour
  // …and many more setX/getX settings functions
} from "react-advanced-odontogram";
```

La surface complète (≈ 44 fonctions + des types tels que `OdontogramSummary`, `OdontogramThemeConfig`, `OdontogramPlugin`, `FhirExportOptions`, `PerioViewMode`, …) est entièrement typée dans les déclarations fournies.

#### Surfaces composables (avancé)

`OdontogramShell` est le composant tout-en-un pris en charge et ne nécessite aucune configuration supplémentaire. Si vous devez placer les régions de l'odontogramme à différents endroits de votre propre mise en page, les quatre surfaces d'interface de la shell sont également exportées et peuvent être composées sous un unique `OdontogramProvider`, partageant toutes une seule session gérée par le paquet :

```tsx
import {
  OdontogramProvider,
  OdontogramTopbar,
  OdontogramChartSurface,
  ToothInfoSurface,
  ToothControlsSurface,
} from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

function Workspace() {
  return (
    <OdontogramProvider language="en" numberingSystem="FDI">
      <MyHeaderArea><OdontogramTopbar /></MyHeaderArea>
      <MyMainArea>
        <OdontogramChartSurface />
        <ToothInfoSurface />
      </MyMainArea>
      <MySidePanel><ToothControlsSurface /></MySidePanel>
    </OdontogramProvider>
  );
}
```

`OdontogramProvider` accepte les mêmes props que `OdontogramShell`. Un hook `useOdontogramUi()` (et le type `OdontogramUiContextValue`) est disponible pour créer vos propres surfaces. Contrainte actuelle : utilisez un seul provider par page. Les surfaces peuvent être montées et démontées à la demande — elles se relient automatiquement au remontage. `OdontogramShell` lui-même est inchangé — il s'agit exactement de cette composition dans la disposition par défaut.

Pour une composition encore plus fine, les cartes de contrôle individuelles sont également exportées — `OrthodonticsCard`, `StatusesCard`, `CariesCard`, `FillingsCard`, `RootPeriodontiumCard` et `ToothDetailsCard` —, chacune un composant déclaratif autonome qui lit et écrit la session partagée via l'API du moteur (un hook `useEngineState()` est exporté pour créer les vôtres). Ne montez que les cartes dont une mise en page donnée a besoin, dans n'importe quel agencement, sous un seul `OdontogramProvider`.

#### Utilisation avec Next.js (App Router)

Le composant fonctionne uniquement côté client ; affichez-le donc depuis un Client Component :

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="en" numberingSystem="FDI" />;
}
```

Ou chargez-le via un import dynamique côté client uniquement : `dynamic(() => import("./OdontogramClient"), { ssr: false })`.

#### Remarques importantes et limitations actuelles
- **ESM uniquement** — le paquet publie un unique module ES (`dist/odontogram.js`) ainsi qu'un point d'entrée de déclarations de types (`dist/index.d.ts`). Il cible la résolution de modules par bundler ; il n'existe pas de build CommonJS.
- **La feuille de style est séparée** — vous **devez** importer `react-advanced-odontogram/style.css` une seule fois ; elle n'est pas injectée automatiquement. La mise en forme est du CSS global délimité sous `.odontogram-root` et pilotée par les variables CSS `--odon-*`.
- **SSR / côté client uniquement** — le composant lit le DOM au montage (`document`), il doit donc s'exécuter dans le navigateur. Dans les frameworks SSR, affichez-le dans un Client Component (`"use client"`) ou via un import dynamique côté client uniquement.
- **Les ressources sont autonomes** — les SVG des dents et des icônes sont incorporés dans le bundle JavaScript au moment du build ; il n'y a **aucune récupération de ressource à l'exécution** à configurer et rien de plus à copier dans votre dossier public.
- **Une seule instance par page** — l'état du moteur est actuellement un singleton au niveau du module, donc afficher deux instances `<OdontogramShell>` sur la même page les ferait partager l'état d'un même schéma. La prise en charge multi-instances est prévue pour une version future.

---

### ✨ Fonctionnalités clés
- 🖱️ Sélection rapide et multi-sélection (CMD/CTRL + clic)
- 🦷 Types de dents : permanente, temporaire (lactéale), implant, sous-gingivale, absente
- 🦷 Substrat dentaire (orthogonal à toute restauration) : naturel, radix (reste radiculaire), fracturé, préparé pour couronne
- 👑 Restaurations par type × matériau : couronne / inlay / onlay / facette / pont en e.max, or, gradia, zircone, métal, céramo-métallique, télescope ou temporaire (l'onlay n'existe qu'en vue occlusale) — choisi à partir d'un unique sélecteur combiné à faible nombre de clics « Fix : Couronne – … » ; les couronnes `metal` héritées migrent vers `metal-ceramic` (PFM) ; les implants utilisent le même modèle type × matériau, composé avec un calque de connecteur d'implant. Le sélecteur est délimité par le type de dent : un implant ne propose que couronne/pont (plus ses cinq options d'attachement, ci-dessous) ; une dent absente/édentée ne propose qu'un intermédiaire de pont (plus prothèse amovible partielle/complète) ; un substrat `radix` masque entièrement le contrôle de restauration (aucune restauration ne peut être saisie sur un reste radiculaire)
- 🦿 Prothèses amovibles/à attachements sur l'axe dédié `prosthesis` (entrées « Kivehető : » dans le sélecteur combiné) : pilier de cicatrisation d'implant, locator, locator avec prothèse supra-implantaire, barre, barre avec prothèse supra-implantaire ; prothèse amovible partielle ou complète dento-portée
- 🌉 Les dents d'un pont affichent à la fois la coiffe de la couronne et le connecteur de selle ; une superposition d'étendue de pont multi-dents génère un connecteur continu et adapté à l'arcade sur les dents de pont consécutives (intermédiaires + piliers) et les espaces inter-dentaires entre elles (les arcades supérieure et inférieure utilisent une géométrie de selle en miroir, ce qui maintient le connecteur aligné sur les deux arcades), inclus dans l'export PNG/JPG/SVG ; appliquer un pont via un préréglage d'états recalcule immédiatement la superposition
- 🔍 Détection des caries sur 6 surfaces : mésiale, distale, vestibulaire, linguale, occlusale, sous-coronaire
- 🪥 Matériaux d'obturation par surface : amalgame, composite, CVI, temporaire
- 🏥 Un unique sélecteur fusionné « Statut pulpe / endo » (regroupé : pulpe vitale vs traitée/endo) : les états endodontiques (obturation médicamenteuse, obturation canalaire, obturation canalaire incomplète, tenon fibre de verre, tenon métallique) et le diagnostic pulpaire AAE (`pulpDx` : normal / pulpite réversible / irréversible / nécrose) sont mutuellement exclusifs — une dent traitée endodontiquement (`endo` renseigné) ne peut pas porter en plus un diagnostic de pulpe vitale ; lors du traitement, `pulpDx` est normalisé à `normal` et le symbole de pulpe pathologique est supprimé. La pulpite réversible affiche un symbole de pulpe réduit. Un paramètre optionnel de niveau de détail pulpaire à 3 niveaux (`pulpDetailLevel` : simple / AAE / latin pratique) fait apparaître 9 sous-types pulpaires en latin pratique (pulpa sana … gangraena pulpae) via `pulpLatin` ; la résection et le tenon parapulpaire restent des indicateurs spéciaux distincts
- 🦴 Le diagnostic apical (`apicalDx` : parodontite apicale symptomatique/asymptomatique, abcès apical aigu/chronique, ostéite condensante) pilote directement le symbole périapical ; un qualificatif de sous-type de lésion granulome/kyste n'est affiché que sous parodontite apicale symptomatique/asymptomatique (le sous-type redondant « abcès » a été retiré — il est déjà couvert par le diagnostic apical)
- 🩹 Carte fusionnée « Racine et parodonte » (une seule section repliable pour les observations radiculaires/périapicales et parodontales)
- ⚕️ Modifications : inflammation périapicale (affichée uniquement sur les dents absentes/alvéole d'extraction ; masquée sur les dents présentes, où `apicalDx` seul pilote le symbole périapical, et sur les implants, où `periImplant` la couvre), maladie parodontale, degrés de mobilité (M1/M2/M3, masqués sur les implants)
- 🦷🔩 Statut péri-implantaire (`periImplant` : aucun / mucosite / péri-implantite légère / modérée / sévère) — classification du World Workshop 2018, présenté comme un sélecteur dédié sur les implants ; la mucosite réutilise le symbole gingival parodontal, la péri-implantite ajoute un calque `peri-implant-bone-loss` gradué (opacité 0,4/0,7/1,0). Les implants n'affichent plus le symbole de lésion périapicale — leur inflammation s'exprime par cet axe à la place — et les cases à cocher de modificateurs parodontaux sont masquées sur les implants (le renommage ad hoc de la case « Péri-implantite » est abandonné)
- 🏷️ Indicateurs spéciaux : couronne à réaliser, remplacement de couronne nécessaire, espace fermé (dent absente), plan d'extraction, scellement de sillon, perte de point de contact
- 👁️ Vue occlusale, dents de sagesse, bascules de visibilité de l'os et de la pulpe
- 🔢 12 filtres de sélection (toutes, présentes, permanentes, lactéales, implants, absentes, supérieures/inférieures, antérieures/molaires)
- 📊 Préréglages d'état prédéfinis (réinitialiser, denture temporaire, denture mixte, édenté)
- 📦 34 modèles de restauration prédéfinis (ponts, prothèses amovibles, prothèses sur barre avec implants)
- 💾 Export/import de l'état en JSON (version 2.22 ; les imports acceptent encore les formats hérités 1.4 et 2.0 à 2.21 et migrent automatiquement, avec les états personnalisés des plugins et les notes par dent)
- 💽 Persistance localStorage optionnelle (`enablePersistence`/`disablePersistence`/`clearPersistedState`/`isPersistenceEnabled`) — désactivée par défaut ; sauvegarde automatiquement le schéma d'état (et, optionnellement, le schéma de plan) à chaque changement d'état et le restaure au montage suivant du composant, avec une protection de taille de 4 Mo et les erreurs de stockage/analyse dirigées vers un callback `onError` (ou `console.warn`) au lieu de lever une exception
- 🔗 Export HL7 FHIR R4 (Bundle de collection d'Observations par dent, codage dentaire ISO 3950 pour la dentition permanente **et** les dents temporaires (51-85, aller-retour sans perte à l'import), système de codes local, plus une surcouche SNOMED CT optionnelle (Paramètres → SNOMED CT)) ; un composant de carie porteur d'une sévérité renseignée porte aussi le codage d'un système d'évaluation — ICDAS sur une surface primaire (non obturée), CARS sur une surface récidivante (obturée)
- ✚ Interface de sélection de surface en croix/plus (V/M/O/D/L) pour les caries et les obturations
- 🧱 Matériaux de restauration par surface (obturations mixtes, p. ex. amalgame vestibulaire + composite distal)
- 🖼️ Export d'image PNG/JPG/SVG du schéma (téléchargeable ; PNG/JPG matricés à partir du SVG vectoriel)
- 🦷 La carie/sous-carie est une machine à états par surface : une surface cariée sans obturation s'affiche en carie primaire (opacité graduée ICDAS) ; dès qu'une obturation est présente sur cette surface, elle s'affiche en carie récidivante (le calque `subcaries-{surface}`, scoré CARS) — les deux ne sont jamais actives simultanément sur une même surface
- 🎯 Sévérité par surface unifiée (`cariesSeverity`, 0–6, remplaçant les anciens champs distincts profondeur ICDAS + CARS) : lue comme profondeur ICDAS sur une surface primaire, comme un score CARS nommé (Saine … Cavité étendue) sur une surface récidivante, via une fenêtre contextuelle qui n'affiche que l'échelle pertinente pour l'état actuel de la surface
- 🌱 Carie radiculaire (`rootCaries` : aucune / active / arrêtée / active-cavitaire), câblant le calque d'illustration dédié de carie radiculaire à une opacité pilotée par la sévérité (active 0,5 / arrêtée 0,7 / active-cavitaire pleine)
- 📡 Profondeur de carie radiographique (`radiographicDepth` : aucune / E1 / E2 / D1 / D2 / D3 par surface), indépendante de l'échelle visuelle de sévérité ICDAS/CARS, présentée comme un badge et transitant par sa propre Observation FHIR
- 🎚️ Trois paramètres de granularité des caries (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus une bascule `cariesDepthEnabled`, réduisant chaque échelle à une vue de sélecteur plus simple sans perdre la valeur stockée
- 🩹 Ligne de résumé sous-carie du panneau Obturations : liste toute dent sélectionnée présentant une carie récidivante et ses surfaces sous les contrôles d'obturation (p. ex. « 36 (O) présente une sous-carie sur son obturation. »)
- 🪛 Défauts d'obturation par surface (`fillingDefect` : aucun / marginal / fracture / usure) sur les restaurations directes, indépendants de la carie récidivante — saisis via un indicateur par surface sur la carte Obturations (reflétant l'indicateur de profondeur de carie, sa liste d'options empilée verticalement), affichés sur le schéma, et indiqués dans l'infobulle et le résumé bucco-dentaire des obturations avec une étiquette explicite (p. ex. « 36 (O) – Défaut d'obturation : O : marginal »), de la même manière que la carie récidivante est étiquetée sur la ligne Caries ; la carte Obturations affiche également une note d'indication pour toute dent sélectionnée présentant un défaut d'obturation enregistré (p. ex. « 36 présente un défaut d'obturation enregistré. »), en parallèle de la note d'indication de sous-carie existante
- 🦷💥 Usure dentaire typée par cause clinique et localisation (`wearEdge` : aucune / attrition / érosion, incisale/occlusale ; `wearCervical` : aucune / abrasion / abfraction / érosion, cervicale) — remplaçant les deux indicateurs on/off d'usure liée au bruxisme ; saisie via deux listes déroulantes sur la ligne usure, réutilise l'illustration d'usure existante, et affichée dans l'infobulle et une nouvelle section de résumé bucco-dentaire « Usure »
- 🎨 Coloration dentaire par cause (`discoloration` : aucune / tétracycline / fluorose / dent dévitalisée / extrinsèque / autre) sur les dents permanentes et temporaires — teinte la couronne naturelle affichée d'une couleur représentative lorsque la dent n'a aucune restauration et un substrat naturel ; affichée dans l'infobulle et une nouvelle section de résumé bucco-dentaire « Coloration » ; complète l'ensemble des affections de surface et structurelles aux côtés des défauts d'obturation et de l'usure
- ✏️ Les dents antérieures (incisives/canines) étiquettent leur surface occlusale « incisale » dans toute l'interface (sélecteur, fenêtre contextuelle, résumés) ; la clé de surface stockée reste `occlusal`
- 🔤 Notation de surface tenant compte de la position (Paramètres → Détails de la dent → « Notation de surface », simple/complète, complète par défaut) : en mode complet, la lettre et l'étiquette de surface de carie/obturation suivent l'anatomie dentaire — occlusale → I/incisale sur les dents antérieures, vestibulaire → L/labiale sur les dents antérieures, linguale → P/palatine sur les dents supérieures et L/linguale sur les dents inférieures (mésiale/distale/sous-coronaire non concernées) ; le mode simple utilise toujours l'ensemble générique V/M/O/D/L/SC quelle que soit la position de la dent. S'applique au résumé bucco-dentaire et aux deux sélecteurs de surface (caries et défaut d'obturation) (lettre + légende) ; la clé de surface stockée n'est pas affectée
- 🦷↕️ Schéma orthodontique par dent (`orthoAppliance` : aucun / bracket / bague ; `orthoDrift` : aucune / mésiale / distale ; `orthoVertical` : aucun / égression / ingression ; `orthoRotation` : booléen) sur une dent naturelle présente (permanente ou temporaire) — réutilise l'illustration ortho dormante v2.5.0 (aucun nouveau SVG) ; affiché sur le schéma, dans l'infobulle, et une nouvelle section de résumé bucco-dentaire « Orthodontie »
- 🪨 Tartre, et résorption radiculaire typée interne ou externe-cervicale (`resorptionType`)
- 📏 Profondeur de carie par surface (superficielle / dentine / profonde), ou score optionnel ICDAS II (0–6) via `enableIcdas`
- 🩹 Bascule de percolation marginale de couronne, affichée uniquement pour une restauration de type couronne ou pont
- 🧬 Codage diagnostique basé sur des standards (WHO ICD-10, toujours actif) : chaque observation renseignée dérive un diagnostic codé en ICD-10 — carie (K02), carie radiculaire/cémentaire et carie arrêtée (K02.2/.3), pulpite et nécrose pulpaire (K04.0/.1), parodontite apicale, abcès périapical et kyste radiculo-dentaire (K04.4–.9), attrition/abrasion/érosion/abfraction (K03.0–.8), tartre (K03.6), résorption (K03.3), coloration (K00.3/K00.8/K03.7), perte dentaire (K08.1), racine résiduelle (K08.3) et fracture dentaire (S02.5) — affiché dans l'infobulle et le résumé bucco-dentaire, et exporté sous forme de FHIR Conditions.
- 🩺 Carte des Diagnostics par dent : consulter les diagnostics ICD-10 dérivés d'une dent et les organiser — supprimer un diagnostic mal dérivé ou en ajouter un que le schéma ne représente pas. L'ensemble effectif (dérivés − supprimés + ajoutés) pilote l'export FHIR.
- 🗺️ Conditions de cas / régionales : renseigner des diagnostics bucco-dentaires non liés à une dent précise — malocclusion et troubles de l'ATM (K07), kystes de la région buccale (K09), maladies des glandes salivaires (K11), stomatite et muqueuse buccale (K12/K13), et anomalies du développement à l'échelle de l'arcade (K00) — chacune éventuellement latéralisée (gauche / droite / bilatérale).
- 🌍 Packs de codage nationaux (Paramètres → Codage du diagnostic) : superpose un système de codes national à la base WHO ICD-10 — BNO-10 (hongrois, libellés localisés ; conserve le code WHO) ou US ICD-10-CM (codes remappés, p. ex. la plage dentofaciale K07 → M26). Ajouter le pack d'un autre pays est une petite entrée `CodingPack` — voir `CODING_PACKS.md`.
- 🔬 Surcouche SNOMED CT (Paramètres → SNOMED CT, optionnelle, désactivée par défaut) : ajoute un codage SNOMED CT en plus du codage WHO et de tout pack national, et code les observations péri-implantaires qui n'ont pas de code WHO ICD-10. Les identifiants de concept ICD-10-CM et SNOMED sont indicatifs/de bonne foi — à vérifier par rapport à la liste tabulaire officielle ICD-10-CM / au navigateur SNOMED CT avant toute utilisation clinique.
- 🔁 Aller-retour FHIR Condition : les diagnostics s'exportent sous forme de ressources FHIR `Condition` (liées à une dent, plus des conditions de cas au niveau du patient avec un `bodySite` de latéralité) aux côtés des Observations, et l'import les reconstruit — les conditions de cas directement, et les surcharges d'ajout/suppression par dent en comparant les Conditions importées au schéma re-dérivé.
- 🧰 Rangée d'icônes de barre supérieure unifiée avec une fenêtre modale de Paramètres à onglets (Général / Panneaux / Détails de la dent / Caries / Pulpe / Notes / Parodontal — numérotation, notes, visibilité des panneaux, ICDAS, bascule de profondeur de carie, granularité de la carie radiculaire/radiographique, niveau de détail pulpaire, niveau de détail de l'usure/coloration dentaire, informations sur la dent)
- 🗂️ Paramètres → onglet « Panneaux » : afficher/masquer indépendamment les panneaux de résumé bucco-dentaire États et Orthodontie
- 🦷🩺 Paramètres → onglet « Parodontal » : 16 bascules d'affichage/masquage par indice pour les lignes du bilan parodontal (regroupées poche/hygiène/muco-gingival/soutien/péri-implantaire — PD/GM/CAL/BOP, plaque, PI, GI, visibilité de la JEC, concavité radiculaire, KG, GT, furcation, mobilité, classe de Miller, mPI, mBI), chacune avec une description, plus une option d'affichage du nom d'indice traduit vs canonique (canonique = un nom scientifique fixe en anglais/latin dans toutes les langues de l'interface ; les infobulles restent toujours localisées indépendamment de ce paramètre). Les deux sont des préférences au niveau de l'application (comme `perioViewMode`) — jamais incluses dans la charge utile d'export
- 🩹 Contrôle des paramètres de carie secondaire (CARS) fusionné dans l'onglet des paramètres Caries, positionné au-dessus de la Profondeur radiographique (l'onglet séparé « Carie secondaire » est retiré)
- 🎚️ Niveau de détail des détails de la dent (Paramètres → Détails de la dent) : un réglage simple/complexe pour l'usure et la coloration dentaires. Le mode simple affiche une bascule oui/non par observation (usure activée → attrition/abrasion, coloration activée → autre) ; le mode complexe (par défaut) conserve les listes déroulantes de type/cause, et la valeur stockée est préservée lors du changement de niveau
- 📋 Panneau d'informations sur la dent : résumé textuel en direct de l'ensemble du schéma (nombre de dents, listes présentes/absentes, caries y compris secondaires, obturations, traitements canalaires, prothèses, implants, statut parodontal) — affiché par défaut, activable dans les Paramètres
- 🗂️ Menu déroulant Export consolidé (JSON d'état / FHIR / PNG / JPG)
- 📥 Menu déroulant Import avec import FHIR (aller-retour des Bundles exportés)
- ⏳ Superposition de progression pendant l'export d'image
- 🎓 Visite guidée interactive en 12 étapes
- 🔢 Trois systèmes de numérotation (FDI, Universel, Palmer)
- 🌐 I18n — 12 langues d'interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) avec un sélecteur de langue ; l'arabe affiche l'interface de droite à gauche avec les schémas dentaire/parodontal épinglés de gauche à droite (traduction automatique, relecture par un locuteur natif en attente pour AR/ZH/FR)
- 🌗 Prise en charge du mode sombre avec bouton de bascule (autonome ou contrôlé par l'application parente)
- 🎨 Configuration de thème personnalisée (prop `themeConfig`) avec des propriétés CSS personnalisées (`--odon-*`)
- 📱 UX tactile mobile : popover tap-to-zoom, menu contextuel par appui long, pincer pour zoomer, cibles tactiles WCAG de 44 px, navigation par bascule d'arcade
- 🔌 Système de plugins SVG personnalisés : injecter des superpositions visuelles, un état personnalisé par dent, la prise en charge de l'export/import JSON — la sortie de `renderSvg()` d'un plugin est désinfectée avec DOMPurify (profil SVG) avant insertion dans le schéma en direct ; les plugins s'exécutent toujours comme du code de confiance, ne chargez donc que des plugins provenant de sources fiables
- 🛡️ Content-Security-Policy : la build de production de la démo injecte une balise meta CSP (le serveur de développement n'est pas concerné) — les applications hôtes intégrant le composant doivent définir la leur
- ⚠️ Avertissements de validation d'état pour les combinaisons d'états dentaires incompatibles
- 🏷️ Infobulle d'état automatique sur les tuiles de dent (affiche tous les états actifs)
- 🩺 Infobulle par dent et panneau de résumé bucco-dentaire modernisés : les deux font apparaître l'ensemble complet des observations cliniques (diagnostic pulpaire/apical + sous-type de lésion, résorption radiculaire, statut péri-implantaire, carie radiculaire graduée, tartre, percolation marginale de couronne, fracture, perte de contact, usure de bord/cervicale typée), avec une section « Diagnostics » dédiée dans le panneau, une section « Usure » dédiée, et un qualificatif grossier de sévérité de carie (superficielle/modérée/profonde)
- ♿ Accessibilité au clavier (WCAG) : rôles ARIA listbox/option, sélection par Entrée/Espace, navigation par touches fléchées, contours focus-visible
- 🔒 Mode lecture seule : désactive toutes les interactions pour les cas d'usage impression/rapport/consultation
- ✨ Animations de sélection : bordure en pointillés pulsée et ombre portée lumineuse sur les dents sélectionnées (avec prise en charge de prefers-reduced-motion)
- 📝 Notes par dent : double-clic pour ajouter/modifier des notes, icône de note à côté du numéro de dent, infobulle au survol avec le texte de la note, une ligne « Notes individuelles » dans le panneau de résumé bucco-dentaire, inclusion dans le rapport PDF, export/import JSON
- 🔀 Séparation schéma État ↔ Plan : une bascule `État | Plan` dans l'en-tête du schéma commute entre un schéma d'**état** courant et un schéma de **plan** (post-traitement prévu), chacun avec ses propres états de dents ; le schéma de plan commence comme une copie de l'état la première fois que vous y basculez, et les modifications d'un schéma n'affectent jamais l'autre. L'export/import (`exportStatus`/`exportFhir`/import de fichier) cible toujours le schéma d'état ; le schéma de plan est lu/écrit séparément via sa propre API (voir l'API publique ci-dessous) et — lorsqu'il diffère de l'état — est inclus comme section additive `plan` dans l'export JSON
- 📝 Encadré « Ce qui change » : chaque fois que le plan diffère de l'état courant, un encadré sous le panneau d'informations sur la dent liste chaque différence par dent et par axe de traitement (présence, substrat, restauration, prothèse, couronne planifiée, orthodontie, pulpe/endo, apical) sous la forme d'une ligne `dent : axe  de → à` ; également disponible par programmation via `getPlanChanges()`

![Bilan parodontal bouche complète — anglais](screenshot_en_perio.png)

- 🩺 Bilan parodontal : **profondeur de sondage**, **marge gingivale**, **saignement au sondage** (+ suppuration) par site aux six sites standard par dent, avec **niveau d'attache clinique dérivé (CAL = PD + marge gingivale)**, récession, et **%BOP** bucco-dentaire. Un **bilan parodontal graphique bouche complète** — chaque arcade dessinée en **deux SVG vestibulaire/palatin(lingual) distincts** (réutilisant l'illustration dentaire avec une orientation uniforme couronnes-vers-bande des deux côtés ; un **graphique d'implant** pour les dents sur implant) avec une **ligne JEC** rouge, une **grille repère millimétrée numérotée**, et une **courbe marge gingivale / profondeur de poche** sur les dents, séparée par une **bande centrale d'indices parodontaux** (étiquetée `▲ Vestibulaire … Lingual/Palatin ▼`) qui porte les indices partagés par dent — la **classe de Miller** tout en haut, et **Plaque/PI/GI/mPI/mBI** rendus sous forme de **tuile en losange anatomique** par dent (pointe vestibulaire en haut, pointe linguale en bas, mésiale/distale sur la rangée médiane échangées selon le côté afin que la mésiale pointe toujours vers la ligne médiane de l'arcade) ; les rangées de chiffres (noms complets des indices — PD/GM/CAL/BOP + mobilité + furcation — dans des cellules plus grandes et plus adaptées au tactile) alignées en colonnes et un résumé (PD/CAL moyens, %BOP, PI%), avec une saisie à **avancée automatique au clavier** ; le schéma **s'adapte dynamiquement pour remplir la largeur disponible**, réactif à toute taille de fenêtre. Présenté comme une **bascule de vue** `Odontogramme | Statut parodontal`, dont le panneau de droite est reconverti en **barre latérale contextuelle parodontale** (données patient, classification 2017, et résumé bucco-dentaire) tant que cette vue est active (une option des Paramètres bascule toute la présentation vers une **fenêtre contextuelle**), et reste un **composant invocable séparément** (export `PerioChart`) afin qu'une application hôte puisse appeler le bilan parodontal indépendamment de l'odontogramme de base. Export **FHIR** par site via le panel parodontal LOINC (`74029-0` ; PD `32910-2`, récession `32911-0`, CAL `32912-8`)
- 🅿️ Style de proposition : en mode Plan, les observations que le plan **ajoute** par rapport à l'état courant (couronne planifiée, extraction, mouvement orthodontique, prothèse, …) s'affichent avec un **contour « proposé » distinct en pointillés et teinté** afin que le plan se lise comme une intention, et non comme un fait — avec une légende « pointillés = proposé » dans la carte du schéma. Le rendu en mode État est identique octet pour octet ; le traitement est propre au plan et entièrement réinitialisé au retour à l'état
- 🚦 Verrouillage du mode Plan : le schéma de Plan n'affiche que ce qu'un dentiste peut *faire* — le sélecteur de base ne propose que Absente / Permanente / Implant, et les observations propres à l'état (caries, usure dentaire, coloration, et tout le bloc parodontal — mobilité, grille de sondage à six sites, inflammation/modificateurs parodontaux, tartre, statut péri-implantaire) sont masquées ; le contrôle pulpe/endo conserve le **traitement** endodontique (traitement canalaire / tenon / apicectomie / tenon parapulpaire) tout en masquant le **diagnostic** pulpaire/apical et la résorption radiculaire. La restauration, la prothèse, l'orthodontie, le besoin/remplacement de couronne et le plan d'extraction restent planifiables
- 🧪 Une vaste suite de tests automatisés Vitest couvrant la numérotation, les traductions, les préréglages, l'i18n, le composant App, le thème, le tactile, les plugins, l'accessibilité, et la parité des axes cliniques/diagnostics
- 📖 Documentation d'API TypeDoc avec des commentaires JSDoc sur tous les exports publics (`npm run docs`)

### 📦 Modules
- 🦷 Grille d'odontogramme et interface des tuiles de dent
- 🎛️ Contrôles et panneau d'état
- 🎨 Moteur de superposition SVG et modèles
- 🔢 Numérotation des dents et mappage des étiquettes (FDI/Universel/Palmer)
- 🌐 Localisation — 12 langues d'interface (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR), y compris l'arabe (RTL)
- 💾 Export/import d'état
- 📋 Extras d'état : modèles de restauration prédéfinis
- 🎨 Configuration du thème : palette de couleurs personnalisable via les propriétés CSS `--odon-*`
- 📱 Interactions tactiles mobiles (tap-to-zoom, appui long, pincer pour zoomer, bascule d'arcade)
- 🔌 Système de plugins SVG personnalisés
- ⚠️ Système de validation d'état et d'infobulles
- ♿ Accessibilité au clavier et prise en charge ARIA
- 🔒 Mode lecture seule
- ✨ Animations de sélection
- 📝 Système de notes par dent
- 🧪 Suite de tests automatisés (Vitest + Testing Library)

### 🛠️ Contrôles de l'interface

**🔝 Barre supérieure :**
- Sélecteur de langue (liste déroulante HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR)
- Bouton de bascule du mode sombre (icône soleil/lune, commute entre thème clair et sombre)
- Sélecteur de système de numérotation (liste déroulante FDI/Universel/Palmer)
- Boutons Exporter l'état / Importer l'état

**📊 En-tête du schéma :**
- Bascule de vue occlusale
- Bascule de visibilité des dents de sagesse
- Bascule de visibilité de l'os
- Bascule de visibilité de la pulpe
- Bouton d'effacement de la sélection

**🔍 Filtres de sélection :**
- Tout sélectionner / Toutes présentes / Permanentes / Lactéales / Implants / Toutes absentes
- Sélectionner Supérieures / 6 antérieures supérieures / Molaires supérieures
- Sélectionner Inférieures / 6 antérieures inférieures / Molaires inférieures

**📋 Préréglages d'état :**
- Tout réinitialiser (réinitialiser la bouche)
- Denture temporaire
- Denture mixte
- Bascule Édenté

**📦 Menu déroulant Extras d'état :**
- Ponts en zircone supérieurs/inférieurs (12-22, 13-23, 16-26, arcade complète)
- Ponts métalliques supérieurs/inférieurs (12-22, 13-23, 16-26, arcade complète)
- Prothèses amovibles partielles supérieures/inférieures
- Prothèses amovibles complètes supérieures/inférieures
- Prothèses sur barre avec implants supérieures/inférieures

**🦷 Panneau d'édition de la dent** (pour la/les dent(s) sélectionnée(s), regroupé en cartes repliables) :
- **Rangée de base :** sélection de la dent (type de base y compris les variantes de couronne fracturée) et substrat dentaire (naturel/radix/fracturé/crownprep)
- **Rangée de restauration :** la liste déroulante de restauration combinée « Fix : … » / « Kivehető : … » (options fixes `restorationType`×`restorationMaterial` plus les options d'attachement/amovibles `prosthesis`, délimitées par le type de dent) ; case à cocher de percolation marginale de couronne (couronne/pont uniquement) ; cases à cocher de localisation de couronne fracturée ; bascules couronne à réaliser / remplacement de couronne nécessaire
- **Rangée usure et coloration :** liste déroulante de type d'usure incisale/occlusale, liste déroulante de type d'usure cervicale, liste déroulante de cause de coloration (chacune se transforme en simple bascule oui/non sous Paramètres → Détails de la dent → mode simple)
- **Carte Orthodontie :** appareil, dérive mésiale/distale, mouvement vertical (égression/ingression), bascule de rotation — affichée sur une dent naturelle présente
- **Carte Caries :** liste déroulante de mode de profondeur de carie, case à cocher de carie sous-coronaire, liste déroulante de sévérité de carie radiculaire, et le sélecteur de carie par surface V/M/O/D/L avec une fenêtre contextuelle de profondeur ICDAS/CARS et un badge de profondeur radiographique
- **Carte Obturations :** liste déroulante de matériau d'obturation, sélecteur d'obturation par surface (avec matériau par surface), indicateur de défaut d'obturation par surface (marginal/fracture/usure), notes d'indication de sous-carie et de défaut d'obturation
- **Carte Racine et parodonte :** sélecteur fusionné « Statut pulpe / endo », sélecteur de diagnostic apical, sélecteur de sous-type de lésion périapicale (parodontite apicale symptomatique/asymptomatique uniquement), sélecteur de type de résorption radiculaire, sélecteur de degré de mobilité, sélecteur de statut péri-implantaire (implants uniquement)
- **Indicateurs spéciaux :** plan/plaie d'extraction, espace fermé, scellement de sillon, perte de point de contact, tartre, tenon parapulpaire, résection endodontique, pilier de pont

### 🦷 Types et états de dents

**Sélection de la dent (type de base) :**
| Valeur | Description |
|---|---|
| `none` | Dent absente |
| `tooth-base` | Dent permanente |
| `milktooth` | Dent temporaire (lactéale) |
| `implant` | Implant dentaire |
| `tooth-under-gum` | Dent sous-gingivale (non éruptée) |

**Variantes de dent fracturée :**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrat dentaire (dents permanentes) :**
`natural` (par défaut), `radix` (reste radiculaire), `broken`, `crownprep` (préparé pour couronne)

**Type de restauration (dents permanentes) :**
`none`, `crown`, `inlay`, `onlay` (vue occlusale uniquement), `veneer`, `bridge`

**Matériau de restauration (dents permanentes) :**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (les couronnes `metal` héritées migrent ici), `telescope`, `temporary`

**Les options de restauration sont délimitées par le type de dent** (`restorationOptions()` dans `src/registry/restorations.ts`) : un implant ne propose que les types de restauration `crown`/`bridge` (composés avec un calque de connecteur d'implant) plus les cinq entrées d'attachement `prosthesis` ci-dessous ; une dent absente/édentée ne propose qu'un intermédiaire de `bridge` plus les deux entrées `prosthesis` de prothèse amovible ; un substrat `radix` masque entièrement le contrôle de restauration. Les anciens champs plats `crownMaterial`/`bridgeUnit` (valeurs d'attachement implant/pont d'avant la v1.14) sont retirés du modèle actif — acceptés uniquement comme chemin de migration en lecture seule pour les anciennes charges utiles.

**Prothèse** (`prosthesis` ; axe orthogonal amovible/à attachements, présenté comme des entrées « Kivehető : » dans la liste déroulante de restauration combinée) :
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attachements sur implant, avec ou sans prothèse supra-implantaire), `removable-partial`, `removable-full` (prothèses dento-portées sur une dent absente/édentée). Une dent a soit une restauration fixe, soit une prothèse, jamais les deux — définir l'une efface l'autre.

**Percolation marginale de couronne** (`crownLeakage` ; booléen) : affichée uniquement lorsque `restorationType` est `crown` ou `bridge` ; active le calque d'illustration `crown-leakage`.

**Options endodontiques (dents permanentes) :**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Options endodontiques (dents temporaires) :**
`none`, `endo-medical-filling`

`endo` et `pulpDx` sont présentés via un unique `<select>` fusionné « Statut pulpe / endo » (regroupé : pulpe vitale vs traitée/endo) et sont mutuellement exclusifs — choisir une option traitée (`endo != none`) réinitialise `pulpDx` à `normal` et choisir un diagnostic pulpaire réinitialise `endo` à `none`.

**Matériaux d'obturation (dents permanentes) :**
`amalgam`, `composite`, `gic`, `temporary`

**Matériaux d'obturation (dents temporaires) :**
`composite`, `gic`, `temporary`

**Surfaces d'obturation/carie :**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (carie uniquement)

**Modifications :**
`inflammation` (périapicale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Type de lésion périapicale** (`periapicalType` ; qualifie le symbole périapical, affiché uniquement sous parodontite apicale symptomatique/asymptomatique) :
`none`, `granuloma`, `cyst` — options de saisie ; la valeur héritée `abscess` est encore acceptée/stockée mais n'est plus proposée dans le sélecteur, car elle fait doublon avec le diagnostic apical. À l'import elle est abandonnée : intégrée dans `apicalDx` lorsque la dent porte le modificateur d'inflammation, sinon remise à `none`

**Diagnostic pulpaire** (terminologie AAE ; `pulpDx`) :
`normal`, `reversible-pulpitis` (affiche un symbole de pulpe réduit), `irreversible-pulpitis`, `necrosis` — mutuellement exclusif avec `endo` ; normalisé à `normal` sur une dent traitée endodontiquement

**Diagnostic pulpaire, latin pratique** (`pulpLatin` ; affiché par le sélecteur pulpaire uniquement lorsque `pulpDetailLevel` est `latin`) :
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Niveau de détail pulpaire** (`pulpDetailLevel`, paramètre global) : `simple`, `aae` (par défaut), `latin` — contrôle le vocabulaire pulpaire proposé par le sélecteur

**Diagnostic apical** (`apicalDx` ; pilote le symbole périapical) :
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Type de résorption radiculaire** (`resorptionType`) :
`none`, `internal`, `external-cervical`

**Statut péri-implantaire** (`periImplant` ; implants uniquement, classification du World Workshop 2018) : `mucositis` réutilise le symbole gingival parodontal ; `peri-implantitis-*` ajoute le calque `peri-implant-bone-loss` à une opacité mise à l'échelle de la sévérité (légère 0,4 / modérée 0,7 / sévère 1,0). Les implants n'affichent plus le symbole de lésion périapicale (leur inflammation s'exprime via cet axe à la place), et les cases à cocher `mods` inflammation/parodontal sont masquées sur les implants :
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Sévérité de carie** (`cariesSeverity` ; champ unifié par surface, `0`–`6`) : sur une surface sans obturation, elle est lue comme l'échelle de profondeur de carie ICDAS (`superficial` / `dentin` / `deep`, ou les codes bruts ICDAS II `0–6` lorsque `enableIcdas` est activé) et affiche le calque primaire `caries-{surface}` ; sur une surface avec obturation, elle est lue comme un score CARS nommé (`0` saine … `6` cavité étendue) et affiche le calque `subcaries-{surface}` (carie récidivante) à la place — une surface n'est jamais à la fois primaire et récidivante

**Carie radiculaire** (`rootCaries` ; câble le calque d'illustration `caries-root` sur une dent présente, opacité pilotée par la sévérité — `active` 0,5 / `arrested` 0,7 / `active-cavitated` pleine) :
`none`, `active`, `arrested`, `active-cavitated`

**Profondeur de carie radiographique** (`radiographicDepth` ; par surface, indépendante de l'échelle visuelle de sévérité ICDAS/CARS `cariesSeverity`) :
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Paramètres de granularité des caries** (globaux) : `secondaryCariesMode` (`simple`/`standard`/`full`, par défaut `standard`), `rootCariesMode` (`simple`/`severity`, par défaut `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, par défaut `off`), `cariesDepthEnabled` (booléen, par défaut `true`) — chacun réduit son échelle à une vue de sélecteur plus simple sans altérer la valeur stockée

**Indicateurs spéciaux :**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Usure dentaire** (`wearEdge`, `wearCervical` ; type clinique par localisation, délimité sur tooth-base + aucune restauration + substrat naturel ; affichent les calques existants `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`) :
`wearEdge` : `none`, `attrition`, `erosion` — `wearCervical` : `none`, `abrasion`, `abfraction`, `erosion`

**Coloration** (`discoloration` ; cause par dent, délimitée sur une dent naturelle tooth-base ou une dent temporaire + aucune restauration + substrat naturel ; teinte le remplissage de la couronne naturelle affichée — aucun nouveau SVG) :
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Défaut d'obturation** (`fillingDefect` ; par surface, observation sur restauration directe indépendante de la carie récidivante — délimité aux surfaces présentes dans `fillingSurfaceMaterials` ; affiche le calque d'illustration `defect-{surface}`) :
`none`, `marginal`, `fracture`, `wear`

**Orthodontie** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation` ; par dent, délimité sur une dent naturelle présente — permanente ou temporaire) :
`orthoAppliance` : `none`, `bracket`, `band` — `orthoDrift` : `none`, `mesial`, `distal` — `orthoVertical` : `none`, `extrusion` (symbole flèche vers le haut), `intrusion` (symbole flèche vers le bas) — `orthoRotation` : booléen

**Paramètres de détail de la dent / de notation** (paramètres de session globaux, Paramètres → Détails de la dent) : `wearDetailLevel` et `discolorationDetailLevel` (`ToothDetailLevel` : `simple`/`complex`, par défaut `complex` — le mode simple affiche une bascule oui/non au lieu de la liste déroulante complète de type/cause, sans muter la valeur stockée) et `surfaceNotation` (`simple`/`full`, par défaut `full` — contrôle si les lettres/étiquettes de surface de carie/obturation tiennent compte de la position ; voir « Notation de surface tenant compte de la position » ci-dessus)

### ⚙️ Paramètres
Ouverts depuis l'icône d'engrenage de la barre supérieure ; un `dialog` ARIA à piège de focus avec une disposition à onglets (Échap/clic sur le fond pour fermer, touches fléchées pour changer d'onglet). Tous les paramètres ne concernent que l'état de l'interface au niveau de la session, sauf mention contraire — aucun d'eux ne mute les données par dent ni la charge utile d'export.

- **Général :** système de numérotation (FDI/Universel/Palmer), langue, thème sombre/clair, visibilité du panneau d'informations sur la dent
- **Odontogramme :** profil d'anatomie dentaire (`classic` par défaut / `measured`) — `measured` affiche neuf modèles dentaires mesurés d'après la littérature dans une disposition à deux arcades avec largeur par dent ; commutable à l'exécution, sans effet sur la valeur par défaut `classic`
- **Panneaux :** afficher/masquer indépendamment la carte États bucco-dentaire et la carte Orthodontie (les deux visibles par défaut)
- **Détails de la dent :** niveau de détail de l'usure et niveau de détail de la coloration (simple/complexe, chacun complexe par défaut), notation de surface (simple/complète, complète par défaut)
- **Caries :** bascule de score ICDAS II (`enableIcdas`), bascule de profondeur de carie (`cariesDepthEnabled`), granularité de la carie radiculaire (`rootCariesMode` : simple/severity), granularité secondaire/CARS (`secondaryCariesMode` : simple/standard/full), granularité de la profondeur radiographique (`radiographicDepthMode` : off/threeLevel/detailed) — l'ancien onglet séparé « Carie secondaire » est fusionné dans celui-ci, avec le contrôle CARS positionné directement au-dessus de la profondeur radiographique
- **Pulpe :** niveau de détail pulpaire (`pulpDetailLevel` : simple/AAE/latin pratique, par défaut AAE) — contrôle le vocabulaire proposé par le sélecteur « Statut pulpe / endo » ; le modifier rafraîchit en direct le résumé bucco-dentaire et toutes les infobulles ouvertes
- **Notes :** activer/désactiver les notes par dent (`enableNotes`)
- **Parodontal :** bascules d'affichage/masquage par indice pour les 16 lignes du bilan parodontal (`perioRowVisibility`, toutes visibles par défaut), regroupées Poche (PD/GM/CAL/BOP) / Hygiène (Plaque/PI/GI) / Muco-gingival (visibilité JEC/Concavité radiculaire/KG/GT) / Soutien (Furcation/Mobilité/Classe de Miller) / Péri-implantaire (mPI/mBI), chaque ligne avec sa propre description ; plus un mode de nom d'indice traduit vs canonique (`perioIndexNameMode` : `translated` par défaut / `canonical` — un nom scientifique fixe anglais/latin affiché dans toutes les langues de l'interface). Préférences au niveau de l'application uniquement (reflète `perioViewMode`) — jamais sérialisées, les infobulles restent localisées dans l'un ou l'autre mode

### 🖼️ Système de modèles SVG

**Modèles de dents** (dans `src/assets/teeth-svgs/`) :
| Modèle | Dents l'utilisant |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisives) |
| `13.svg` | 13, 23, 33, 43 (canines) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (prémolaires) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molaires) |

Les modèles sont pivotés de 180 degrés pour la mâchoire inférieure et reflétés horizontalement pour le côté gauche.

**SVG d'icônes** (dans `src/assets/icon-svgs/`) :
`icon_8.svg` (sagesse), `icon_gum.svg` (os), `icon_no_selection.svg` (effacer), `icon_occl.svg` (vue occlusale), `icon_pulp.svg` (pulpe)

### 🔢 Systèmes de numérotation

**FDI (ISO 3950) :** Dents permanentes 11-18, 21-28, 31-38, 41-48. Dents temporaires 51-55, 61-65, 71-75, 81-85.

**Universel (USA) :** Dents permanentes numérotées 1-32. Dents temporaires lettrées A-T.

**Palmer (Zsigmondy-Palmer) :** Format quadrant + position (p. ex. UR-1, LL-5). Les dents temporaires utilisent les lettres A-E par quadrant.

### 🚀 Utilisation
Développement :
```bash
npm install
npm run dev
```
Build :
```bash
npm run build
```
Prévisualisation :
```bash
npm run preview
```

### 🔗 Intégration
Le composant peut être intégré dans n'importe quelle application React.
Exemple :
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="en"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Intégration du mode sombre :**
- **Mode autonome :** Omettez la prop `darkMode` — le composant gère son propre état de thème via le bouton de bascule de la barre supérieure et ajoute/retire la classe `.dark` sur `<html>`.
- **Mode contrôlé :** Passez `darkMode` et `onDarkModeChange` — l'application parente contrôle le thème. Le bouton de bascule apparaît toujours mais appelle `onDarkModeChange` au lieu de gérer un état interne. Le parent est responsable de l'ajout/retrait de la classe `.dark` sur `<html>`.

**Thème personnalisé :**
```tsx
<App
  themeConfig={{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
  }}
/>
```

**Intégration de plugins :**
```tsx
import App, { type OdontogramPlugin, setPluginState } from "./App";

const myPlugin: OdontogramPlugin = {
  id: "implant-brand",
  label: { en: "Implant Brand", hu: "Implantátum márka" },
  layer: "overlay",
  renderSvg: (toothNo, _quadrant, state) => {
    if (!state) return null;
    return `<text x="16" y="60" font-size="6" fill="#3b7bff">${state}</text>`;
  },
};

<App plugins={[myPlugin]} />

// Set plugin state for a tooth:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Tests
```bash
npm run test           # Run the full Vitest suite
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### 📖 Documentation d'API
```bash
npm run docs           # Generate TypeDoc docs in docs/
```

### 📡 API publique

**Props du composant :**

| Prop | Type | Par défaut | Description |
|---|---|---|---|
| `language` | `string` | `'hu'` | Langue de l'interface (hu/en/de/es/it/sk/pl/ru/pt-br/ar/zh/fr) |
| `onLanguageChange` | `(lang) => void` | — | Callback lorsque la langue change |
| `numberingSystem` | `string` | `'FDI'` | Système de numérotation (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback lorsque la numérotation change |
| `darkMode` | `boolean` | `undefined` | État du mode sombre. À omettre pour le mode autonome. |
| `onDarkModeChange` | `(dark) => void` | — | Callback lorsque le mode sombre bascule. Requis pour le mode contrôlé. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Surcharges de couleurs personnalisées via des propriétés CSS personnalisées (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugins SVG personnalisés pour les superpositions visuelles et l'état personnalisé par dent. |
| `readOnly` | `boolean` | `undefined` | Désactive toutes les interactions (clic, tactile, clavier). Utile pour les vues impression/rapport. |
| `enableNotes` | `boolean` | `undefined` | Active les notes par dent. Double-cliquez sur une dent pour ajouter/modifier des notes. |

**Fonctions exportées pour le contrôle externe :**

| Fonction | Description |
|---|---|
| `initOdontogram()` | Initialise le moteur et affiche toutes les dents |
| `destroyOdontogram()` | Nettoie le moteur et retire les écouteurs d'événements |
| `setNumberingSystem(system)` | Bascule entre FDI, Universal, Palmer |
| `clearSelection()` | Désélectionne toutes les dents |
| `setOcclusalVisible(on)` | Active/désactive la vue occlusale |
| `setWisdomVisible(on)` | Affiche/masque les dents de sagesse |
| `setShowBase(on)` | Affiche/masque le calque d'os |
| `setHealthyPulpVisible(on)` | Affiche/masque la pulpe saine |
| `registerPlugins(plugins)` | Enregistre des plugins SVG personnalisés |
| `setPluginState(toothNo, pluginId, value)` | Définit l'état personnalisé d'un plugin pour une dent |
| `getPluginState(toothNo, pluginId)` | Obtient l'état personnalisé d'un plugin pour une dent |
| `getToothStateSummary(toothNo)` | Obtient un résumé localisé de tous les états actifs |
| `getOdontogramSummary()` | Obtient un résumé textuel structuré et localisé de l'ensemble du schéma (comptages, sections) |
| `onStateChange(callback)` | S'abonne aux changements d'état ; renvoie une fonction de désabonnement |
| `setReadOnly(value)` | Active/désactive le mode lecture seule |
| `getReadOnly()` | Obtient l'état actuel de lecture seule |
| `setNotesEnabled(value)` | Active/désactive les notes par dent |
| `getNotesEnabled()` | Obtient l'état actuel d'activation des notes |
| `setPulpDetailLevel(level)` | Définit le vocabulaire du sélecteur pulpaire — `"simple"`, `"aae"`, ou `"latin"` |
| `getPulpDetailLevel()` | Obtient le niveau de détail pulpaire actuel |
| `getChartMode()` | Obtient le schéma actuellement actif — `"status"` ou `"plan"` |
| `setChartMode(mode)` | Bascule le schéma actif vers `"status"` ou `"plan"` ; le schéma de plan est copié en profondeur depuis l'état la première fois qu'on y entre |
| `getStatusChart()` | Obtient la charge utile du schéma d'état (`{version, globals, teeth}`), indépendamment du schéma actuellement actif |
| `getPlanChart()` | Obtient la charge utile du schéma de plan (`{version, globals, teeth}`), indépendamment du schéma actuellement actif |
| `setPlanChart(payload)` | Remplace les dents du schéma de plan à partir d'une charge utile (l'état est laissé intact) ; marque le schéma de plan comme initialisé |
| `getPlanChanges()` | Obtient le diff structuré état→plan (`{ toothNo, axis, from, to }[]`) — une entrée par dent par axe de traitement qui diffère entre les schémas d'état et de plan ; vide lorsqu'aucun plan n'existe. Également exposé sur `getOdontogramSummary()` comme `plannedChanges` |
| `setPerioSite(toothNo, site, patch)` | Définit les données parodontales pour l'un des six sites (`patch` = `{ pd?, gm?, bop?, sup? }`) ; `pd` null/`<1` dé-charte le site. Valide + borne (PD 1–15, GM −10…+20) |
| `getToothPerio(toothNo)` | Obtient l'enregistrement parodontal par site d'une dent (sites chartés uniquement) |
| `getToothCal(toothNo)` | Obtient le CAL dérivé par site (`pd + marge gingivale`) pour une dent |
| `getPerioSummary()` | Agrégats parodontaux bucco-dentaires : nombre de sites chartés, nombre de saignements, %BOP, pire CAL, PD max |
| `getPerioChart()` | Obtient les enregistrements parodontaux par dent du schéma actif |
| `PerioChart` | Composant React (export nommé) — la superposition de bilan parodontal bouche complète (`{ open, onClose }`), montable indépendamment de `OdontogramShell` pour l'intégration hôte |
| `openPerioOverlay()` / `closePerioOverlay()` / `isPerioOverlayOpen()` | Ouvre/ferme/interroge par programmation la superposition du bilan parodontal — permet à un hôte d'appeler le bilan parodontal séparément de l'odontogramme de base (état de cas partagé) |
| `getPerioViewMode()` / `setPerioViewMode(mode)` | Obtient/définit la manière dont le bilan parodontal est présenté — `"toggle"` (une bascule de vue `Odontogram \| Dental Chart`, par défaut) ou `"popup"` (la superposition) |
| `getPerioOverlayLayer()` / `setPerioOverlayLayer(layer)` | Obtient/définit la superposition de surbrillance du bilan parodontal — `"none"` (par défaut) / `"pd"` / `"cal"` / `"gr"` / `"plaque"` / `"bop"` / `"pd5"` / `"pd6"` / `"cairo"` ; repeint les dents selon cette mesure (affichage seul sur les données existantes) |
| `getToothRecessionType(toothNo)` | Obtient le **type de récession de Cairo** dérivé — `"none"` / `"rt1"` / `"rt2"` / `"rt3"` (calculé à partir du CAL interproximal vs vestibulaire de la dent) |
| `setCejVisibility(toothNo, v)` / `getCejVisibility(toothNo)` | Visibilité de la JEC par dent — `"none"` / `"detectable"` / `"not-detectable"` |
| `setRootConcavity(toothNo, v)` / `getRootConcavity(toothNo)` | Concavité de surface radiculaire par dent — `"none"` / `"mild"` / `"deep"` |
| `setPlaqueIndex(toothNo, surface, grade)` / `getPlaqueIndex(toothNo, surface)` | Grade de l'indice de plaque de Silness-Löe par surface — `0`-`3` |
| `setGingivalIndex(toothNo, surface, grade)` / `getGingivalIndex(toothNo, surface)` | Grade de l'indice gingival de Löe-Silness par surface — `0`-`3` |
| `setKeratinizedWidth(toothNo, mm)` / `getKeratinizedWidth(toothNo)` | Largeur de gencive kératinisée vestibulaire par dent en mm — `0`-`15`, ou `null` si non charté |
| `setGingivalThickness(toothNo, v)` / `getGingivalThickness(toothNo)` | Phénotype d'épaisseur gingivale par dent — `"unknown"` / `"thin"` / `"medium"` / `"thick"` |
| `setMillerClass(toothNo, v)` / `getMillerClass(toothNo)` | Classe de récession de Miller par dent — `"none"` / `"i"` / `"ii"` / `"iii"` / `"iv"` |
| `setPeriImplantPlaque(toothNo, surface, grade)` / `getPeriImplantPlaque(toothNo, surface)` | Implants uniquement — grade de l'indice de plaque modifié de Mombelli (mPI) par surface — `0`-`3` ; sans effet sur une dent non implantaire |
| `setPeriImplantBleeding(toothNo, surface, grade)` / `getPeriImplantBleeding(toothNo, surface)` | Implants uniquement — grade de l'indice de saignement sulculaire modifié de Mombelli (mBI) par surface — `0`-`3` ; sans effet sur une dent non implantaire |
| `furcationEntrances(toothNo)` | Les entrées de furcation d'une dent — `["mesial","distal","buccal"]` (molaires supérieures), `["buccal","lingual"]` (molaires inférieures), `["mesial","distal"]` (premières prémolaires supérieures), sinon `[]` |
| `setFurcation(toothNo, entrance, grade)` / `getToothFurcation(toothNo)` | Définit/obtient l'atteinte de furcation par entrée (Glickman `1`–`4` ; `null` efface) |
| `setPlaque(toothNo, surface, present)` / `getToothPlaque(toothNo)` | Définit/obtient la présence de plaque O'Leary par surface (mésiale/distale/vestibulaire/linguale) ; alimente le PI% bucco-dentaire dans `getPerioSummary()` |
| `getCaseMeta()` | Obtient l'objet de métadonnées au niveau du cas (`{age, smokingStatus, cigarettesPerDay, diabetesStatus, hba1c, toothLossPerio, maxRblPercent, patientName, patientDob, examDate}`) — un unique bloc partagé, non par dent/à double état (reflète la clé `globals` de la charge utile de premier niveau) ; alimente la classification de stadification/gradation parodontale et l'en-tête du rapport PDF |
| `setPatientName(v)` | Définit le nom du patient du cas (nettoyé ; chaîne vide ou `null` l'efface) — identité uniquement, jamais injecté dans la dérivation parodontale |
| `setPatientDob(v)` | Définit la date de naissance du patient du cas (`YYYY-MM-DD` ; invalide/vide l'efface) — identité du rapport PDF uniquement |
| `setExamDate(v)` | Définit la date d'examen du cas (`YYYY-MM-DD` ; invalide/vide l'efface) |
| `setCaseAge(v)` | Définit l'âge du patient du cas en années — `0`-`120`, ou `null` pour effacer |
| `setSmokingStatus(v)` | Définit le statut tabagique du cas — `"unknown"` / `"never"` / `"former"` / `"current"` |
| `setCigarettesPerDay(v)` | Définit les cigarettes/jour (pertinent uniquement lorsque le statut tabagique est `"current"`) — `0`-`99`, ou `null` pour effacer |
| `setDiabetesStatus(v)` | Définit le statut diabétique du cas — `"unknown"` / `"none"` / `"present"` |
| `setHba1c(v)` | Définit l'HbA1c % (pertinent uniquement lorsque le statut diabétique est `"present"`) — `3.0`-`20.0` (une décimale), ou `null` pour effacer |
| `setToothLossPerio(v)` | Définit les dents perdues par parodontite — `0`-`32`, ou `null` pour effacer |
| `setMaxRblPercent(v)` | Définit le % de perte osseuse radiographique max — `0`-`100`, ou `null` pour effacer |
| `resetCaseMeta()` | Réinitialise l'objet de métadonnées au niveau du cas à ses valeurs par défaut vides |
| `getPerioClassification()` | Obtient la classification parodontale du World Workshop 2017 (`{diagnosis, stage, grade, extent, derived, overridden}`) — diagnostic/stade/grade/extension dérivés des données parodontales chartées et des métadonnées du cas, chaque axe remplacé par la surcharge du clinicien lorsqu'elle est définie (`derived` expose toujours les valeurs calculées non modifiées, `overridden` signale quels axes ont été surchargés) |
| `setDiagnosisOverride(v)` | Surcharge le diagnostic parodontal dérivé — `"health"` / `"gingivitis"` / `"periodontitis"`, ou `null` pour effacer (revenir au dérivé) |
| `setStageOverride(v)` | Surcharge le stade parodontal dérivé — `"I"` / `"II"` / `"III"` / `"IV"`, ou `null` pour effacer (revenir au dérivé) |
| `setGradeOverride(v)` | Surcharge le grade parodontal dérivé — `"A"` / `"B"` / `"C"`, ou `null` pour effacer (revenir au dérivé) |
| `setExtentOverride(v)` | Surcharge l'extension parodontale dérivée — `"localized"` / `"generalized"` / `"molar-incisor"`, ou `null` pour effacer (revenir au dérivé) |
| `exportFhir(options?)` | Exporte le schéma sous forme de Bundle de collection HL7 FHIR R4 (téléchargement JSON). Référence `{ subject }` optionnelle ; sinon un Patient de substitution est intégré |
| `exportImage(format)` | Télécharge le schéma sous forme d'image — `"png"` ou `"jpg"` |
| `exportSvg()` | Télécharge le schéma sous forme de SVG évolutif (vectoriel) |
| `hasAnyPerioData()` | `true` si et seulement si un axe parodontal est charté quelque part dans la bouche — pilote l'auto-saut de l'export parodontal et désactive les éléments de menu d'export parodontal sur un schéma vierge |
| `exportPerioSvg()` | Télécharge le bilan parodontal complet (graphiques des dents + rangées numériques + classification 2017) sous forme d'un unique SVG vectoriel autonome, construit sans affichage à partir de l'état via `buildPerioSvg()` |
| `exportPerioImage(format)` | Télécharge le bilan parodontal sous forme d'image matricée — `"png"` ou `"jpg"` |
| `exportPdf(opts)` | Télécharge un rapport PDF natif jsPDF (`{patientData, odontogramChart, odontogramDescription, individualNotes, perioStatus, perioDescription}`, chaque section optionnelle) — texte vectoriel plus images matricées des dents/bilan parodontal ; la section des notes individuelles est auto-sautée lorsqu'aucune dent n'a de note, et les deux sections parodontales sont auto-sautées chaque fois que `hasAnyPerioData()` est faux, indépendamment de `opts` |
| `importFhirBundle(input)` | Importe un Bundle FHIR R4 (objet ou chaîne JSON) produit par ce module |
| `setImportFormat(format)` | Définit l'analyseur du prochain import de fichier — `"status"` ou `"fhir"` |
| `startIntroTour()` | Lance la visite guidée interactive en 12 étapes |

### 💾 Persistance de l'état (localStorage)

Persistance `localStorage` optionnelle pour l'état de cas de l'odontogramme (`src/persistence.ts`, réexporté depuis le point d'entrée du paquet). Désactivée par défaut — les intégrations existantes ne sont pas affectées tant qu'une application hôte ne l'active pas explicitement, et elle doit être appelée **après** que l'odontogramme a été monté (la restauration repeint le DOM en direct via `importStatus()`) :

```ts
import {
  enablePersistence, disablePersistence,
  clearPersistedState, isPersistenceEnabled,
} from "react-advanced-odontogram";

enablePersistence({
  key: "my-app-odontogram",   // default: "react-advanced-odontogram"
  includePlan: true,          // also persist the plan chart; default: false
  onError: (err) => console.error("odontogram persistence:", err),
});
```

| Fonction | Description |
|---|---|
| `enablePersistence(options?)` | Restaure un cas précédemment sauvegardé (le cas échéant) via `importStatus()`, puis sauvegarde le schéma d'état dans `localStorage` à chaque changement d'état. Idempotente — l'appeler à nouveau remplace l'abonnement/les options précédents. **Doit être appelée après que l'odontogramme a été monté.** |
| `disablePersistence()` | Arrête la persistance ; l'entrée stockée est laissée en place. |
| `clearPersistedState()` | Supprime l'entrée stockée pour la clé active (ou par défaut). |
| `isPersistenceEnabled()` | `true` tant qu'un abonnement au changement d'état est actif. |

**`PersistenceOptions` :**

| Champ | Type | Par défaut | Description |
|---|---|---|---|
| `key` | `string` | `"react-advanced-odontogram"` | La clé `localStorage`. |
| `includePlan` | `boolean` | `false` | Persiste aussi le schéma de plan (le champ `plan` de la charge utile). |
| `onError` | `(err: Error) => void` | — | Appelée en cas d'erreur de stockage/analyse au lieu de `console.warn`. |

Remarques : rien n'est lu ni écrit dans `localStorage` tant que `enablePersistence()` n'est pas appelée ; une protection de taille de 4 Mo saute une sauvegarde surdimensionnée (signalée via `onError`/`console.warn`) au lieu de lever une exception ; chaque échec de stockage/JSON — quota dépassé, iframe verrouillée, données stockées corrompues ou non reconnues, etc. — est intercepté et signalé. Ce module ne lève jamais d'exception.

Remarque : activer la persistance restaure le cas sauvegardé via `importStatus()`, qui remplace le cas courant — y compris un schéma de plan en cours si la charge utile sauvegardée n'en contient pas. Activez la persistance au démarrage (juste après le montage), pas en cours de session.

Remarque : la charge utile persistée peut inclure des données de cas identifiant le patient (nom du patient, date d'examen) en clair dans `localStorage`. Si vous chartez de telles données, assurez une protection au niveau de l'appareil ou effacez-les avec `clearPersistedState()` le cas échéant.

### 💾 Format d'export/import de l'état
L'export crée un fichier JSON (version `2.20` ; les imports acceptent aussi les formats hérités `1.4` et `2.0` à `2.19` et migrent automatiquement) contenant :

**Champs globaux :**
- `wisdomVisible` - dents de sagesse visibles
- `showBase` - calque d'os visible
- `occlusalVisible` - vue occlusale active
- `showHealthyPulp` - pulpe saine visible
- `edentulous` - mode édenté actif

**Champs par dent (32 dents) :**
- `toothSelection` - type de dent de base
- `toothSubstrate` - substrat dentaire (natural/radix/broken/crownprep), orthogonal à toute restauration
- `restorationType` - type de restauration (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - matériau de restauration (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), apparié à `restorationType`
- `prosthesis` - axe amovible/à attachements (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuellement exclusif avec un `restorationType` fixe de couronne/pont
- `crownLeakage` - indicateur de percolation marginale de couronne, pertinent uniquement lorsque `restorationType` est couronne ou pont
- `endo` - état endodontique ; mutuellement exclusif avec `pulpDx` (présentés ensemble via un unique sélecteur fusionné « Statut pulpe / endo » — traiter une dent normalise `pulpDx` à `normal`)
- `mods` - tableau de modifications (inflammation, parodontal) ; `inflammation` est retiré de l'interface sur les dents présentes (`apicalDx` y pilote le symbole) mais s'applique encore aux dents absentes/alvéole d'extraction
- `caries` - surfaces à carie active
- `cariesActiveDepth` - la valeur de profondeur ICDAS mise en attente par le sélecteur de profondeur de carie lorsqu'une nouvelle surface est appliquée (non une valeur stockée par surface ; voir `cariesSeverity` pour le champ stocké par surface)
- `rootCaries` - sévérité de carie radiculaire (none/active/arrested/active-cavitated)
- `cariesSeverity` - sévérité unifiée par surface (0-6) : profondeur ICDAS sur une surface primaire (non obturée), score CARS sur une surface récidivante (obturée)
- `radiographicDepth` - profondeur de carie radiographique par surface (none/E1/E2/D1/D2/D3), indépendante de l'échelle visuelle ICDAS/CARS
- `fillingMaterial` - matériau d'obturation
- `fillingSurfaces` - surfaces obturées
- `fillingSurfaceMaterials` - matériau d'obturation par surface (obturations mixtes, p. ex. amalgame vestibulaire + composite distal)
- `fillingDefect` - défaut d'obturation par surface (none/marginal/fracture/wear), délimité aux surfaces obturées, indépendant de la carie récidivante
- `pulpDx` - diagnostic pulpaire AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis) ; reversible-pulpitis affiche un symbole réduit
- `pulpLatin` - sous-type pulpaire en latin pratique (affiché par le sélecteur pulpaire uniquement lorsque `pulpDetailLevel` est `latin`)
- `apicalDx` - diagnostic apical pilotant le symbole périapical
- `periapicalType` - sous-type de lésion périapicale (none/granuloma/cyst), affiché uniquement sous parodontite apicale symptomatique/asymptomatique ; `abscess` hérité encore accepté à l'import
- `resorptionType` - type de résorption radiculaire (none/internal/external-cervical)
- `periImplant` - statut péri-implantaire implants uniquement (none/mucositis/peri-implantitis-mild/-moderate/-severe), classification du World Workshop 2018
- `endoResection` - indicateur d'apicectomie
- `fissureSealing` - indicateur de scellement de sillon
- `calculus` - indicateur de tartre
- `contactMesial` - perte de point de contact mésial
- `contactDistal` - perte de point de contact distal
- `wearEdge` - type d'usure incisale/occlusale (none/attrition/erosion)
- `wearCervical` - type d'usure cervicale (none/abrasion/abfraction/erosion)
- `discoloration` - cause de coloration par dent (none/tetracycline/fluorosis/nonvital/extrinsic/other), teinte le remplissage de la couronne naturelle sur une dent naturelle tooth-base/temporaire sans restauration
- `orthoAppliance` - appareil orthodontique (none/bracket/band)
- `orthoDrift` - dérive orthodontique (none/mesial/distal)
- `orthoVertical` - mouvement vertical orthodontique (none/extrusion/intrusion)
- `orthoRotation` - indicateur de rotation orthodontique
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - localisations de fracture
- `extractionWound` - plaie post-extraction
- `extractionPlan` - extraction planifiée
- `parapulpalPin` - indicateur de tenon parapulpaire
- `bridgePillar` - dent pilier de pont
- `mobility` - degré de mobilité (none/m1/m2/m3)
- `crownNeeded` - indicateur couronne à réaliser
- `crownReplace` - indicateur remplacement de couronne nécessaire
- `missingClosed` - espace fermé après extraction
- `customStates` - états personnalisés des plugins (objet, indexé par ID de plugin)
- `note` - note textuelle par dent (chaîne, optionnelle — présente uniquement lorsque non vide)

**Champ `plan` de premier niveau (version 2.11+) :**
- `plan` - objet optionnel, de même forme que `teeth` (champs par dent ci-dessus), contenant le schéma de **plan** (post-traitement prévu). Présent uniquement lorsque le schéma de plan a été initialisé (la bascule `État | Plan` a été commutée sur Plan au moins une fois) ET que son contenu diffère du schéma d'état — un export uniquement d'état l'omet entièrement et reste identique octet pour octet à un export d'avant la 2.11 à l'exception du numéro de version. À l'import, un `plan` absent efface/désinitialise le schéma de plan (il ne ressuscite jamais un plan obsolète laissé d'avant l'import) ; un `plan` présent restaure le schéma de plan aux côtés de l'état. Le schéma de plan peut aussi être lu/écrit indépendamment de l'import/export via `getPlanChart()`/`setPlanChart()` (voir l'API publique ci-dessus), et `getStatusChart()` renvoie toujours la charge utile principale d'état quel que soit le mode de schéma actif.

**Champ `case` de premier niveau (version 2.17+, étendu en 2.18, 2.19 et 2.20) :**
- `case` - objet optionnel contenant des métadonnées au niveau du cas (non par dent), partagées par les schémas d'état et de plan (reflète la clé `globals` de premier niveau). Omis quand vide : entièrement absent lorsque tous les champs sont à leur valeur par défaut, de sorte qu'un export sans cas reste identique octet pour octet à l'exception du numéro de version. Champs (chacun omis lorsqu'à sa valeur par défaut) : `age` ; `smokingStatus` (+ `cigarettesPerDay`) ; `diabetesStatus` (+ `hba1c`) ; `toothLossPerio` ; `maxRblPercent` ; les quatre surcharges par axe du clinicien de la classification 2017 `diagnosisOverride` / `stageOverride` / `gradeOverride` / `extentOverride` ; (version 2.19) `patientName` / `examDate` ; et (version 2.20) `patientDob`. Il alimente la classification de stadification/gradation parodontale et l'en-tête du rapport PDF ; lu/écrit via `getCaseMeta()` et les setters `setCase*` (voir l'API publique ci-dessus). Le nom du patient, la date de naissance et la date d'examen ne sont que des métadonnées d'identité du schéma — ils ne font **pas** partie de l'export FHIR.

### 🖨️ Export
Au-delà de l'export propre à l'odontogramme (JSON d'état / FHIR / PNG / JPG / SVG), le **bilan parodontal** dispose de son propre chemin d'export :
- **Perio SVG/PNG/JPG :** `exportPerioSvg()` / `exportPerioImage("png"|"jpg")` rendent le bilan parodontal complet (graphiques des dents + rangées numériques + la classification 2017) sous forme d'un unique SVG vectoriel autonome (`buildPerioSvg()`), indépendamment du DOM `PerioChart` monté. Les trois éléments de menu d'export sont désactivés chaque fois que `hasAnyPerioData()` est faux (un schéma vierge n'a rien de parodontal à exporter).
- **Rapport PDF :** l'élément « Rapport PDF… » du menu d'export ouvre `ExportOptionsModal` — une boîte de dialogue de paramètres (champs nom du patient + date de naissance + date d'examen, câblés directement aux métadonnées du cas, avec la date d'examen par défaut à aujourd'hui ; cases à cocher de section : données patient, schéma d'odontogramme, description de l'odontogramme, notes individuelles — désactivée lorsqu'aucune dent n'a de note — statut parodontal, description parodontale) avant d'appeler `exportPdf(opts)`. Les champs d'identité vides retombent sur des valeurs de substitution (« John Doe » / « 1980-01-01 ») afin que l'export réussisse toujours. Le PDF est assemblé nativement en jsPDF — texte vectoriel via `.text()`, images matricées des dents/bilan parodontal via `.addImage()` — sans **aucune dépendance svg2pdf.js**. La section des notes individuelles est auto-sautée lorsqu'aucune dent n'a de note, et les deux sections parodontales chaque fois que `hasAnyPerioData()` est faux, indépendamment des cases à cocher de la boîte de dialogue.
- **Verrouillage implantaire mPI/mBI :** les indices de Mombelli péri-implantaires (mPI/mBI) ne s'affichent en tant que rangées que dans une arcade contenant au moins une dent sur implant — à la fois sur le bilan parodontal en direct et sur les exports SVG/PDF.
- Le nom du patient, la date de naissance et la date d'examen ne sont que des métadonnées d'identité du schéma (charge utile `2.20`, additif) — ils ne font **pas** partie de l'export FHIR.

### 📁 Structure des dossiers
- `src/App.tsx` - interface shell, contrôles de la barre supérieure, sélecteur de langue/numérotation/mode sombre/thème/plugin
- `src/odontogram.ts` - moteur de superposition SVG, gestion de l'état des dents, interactions tactiles, superpositions de plugins, câblage de l'interface
- `src/plugin.ts` - type `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priorités d'index-z `LAYER_Z`
- `src/theme.ts` - type `OdontogramThemeConfig` et utilitaire `applyThemeConfig()`
- `src/status_extras.ts` - 34 modèles de restauration prédéfinis (ponts, prothèses, constructions sur barre)
- `src/i18n/` - traductions (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR/ZH/FR) et hook i18n
- `src/utils/numbering.ts` - conversion de numérotation FDI, Universel, Palmer
- `src/registry/` - registre déclaratif des axes cliniques : mappages de champs FHIR, activation par clear-set SVG/indicateur booléen, matrice type×matériau de restauration, listes d'options d'interface (source unique de vérité générant l'export/import, FHIR, et l'interface de sélection)
- `src/fhir/` - export/import HL7 FHIR R4 : `toFhir.ts`/`fromFhir.ts`, systèmes de codes, mappages de champs, primitives
- `src/bridgeOverlay.ts` - superposition de connecteur d'étendue de pont multi-dents (géométrie de selle adaptée à l'arcade)
- `src/SettingsModal.tsx` - boîte de dialogue de Paramètres à onglets (Général/Panneaux/Détails de la dent/Caries/Pulpe/Notes/Parodontal)
- `src/perioExport.ts` - `buildPerioSvg()` : le bilan parodontal complet sous forme d'un unique SVG vectoriel autonome
- `src/perioPdf.ts` - l'assembleur pur de rapport jsPDF de `exportPdf()` (`assemblePdf`)
- `src/ExportOptionsModal.tsx` - la boîte de dialogue de paramètres d'export « Rapport PDF… »
- `src/__tests__/` + `src/registry/__tests__/` - vaste suite de tests automatisés Vitest
- `src/assets/teeth-svgs/` - modèles de dents SVG (6 fichiers : incisives, canines, prémolaires, molaires + vues occlusales)
- `src/assets/icon-svgs/` - SVG d'icônes de la barre d'outils (5 fichiers)

### ⚙️ Pile technique
- React 18 + Vite + TypeScript
- Tailwind CSS pour la mise en forme de l'interface
- Superposition SVG via manipulation du DOM (état non-React pour la performance)
- Système i18n personnalisé et léger
- Vitest + Testing Library pour les tests automatisés
- TypeDoc pour la documentation d'API
- Alias de chemin Vite : `@` mappé sur `./src`

### 📝 Notes
- Les modèles SVG sont chargés depuis `src/assets/teeth-svgs` et `src/assets/icon-svgs`, l'hébergement statique doit donc servir le dossier public.
- Le moteur d'odontogramme utilise son propre état interne (et non l'état React) pour la performance et la simplicité.
- Les dents temporaires disposent d'un ensemble réduit de matériaux disponibles (pas d'obturations à l'amalgame, pas d'endo à base de tenon).
- Les dents sur implant disposent d'un ensemble d'options de couronne/pilier différent de celui des dents naturelles.

### 🔒 Notes de sécurité

- **Les plugins s'exécutent comme du code de confiance.** La valeur de retour de `renderSvg()` d'un plugin est injectée dans le SVG du schéma en direct. Cette sortie est désinfectée avec [DOMPurify](https://github.com/cure53/DOMPurify) (profil SVG, plus `svgFilters`) avant insertion — `<script>`, `<iframe>`, `<object>`, `<embed>` et `<foreignObject>` sont catégoriquement interdits, et une sortie entièrement malveillante est abandonnée plutôt que partiellement rendue. Cela réduit le rayon d'impact d'un plugin compromis ou bogué, mais les plugins ne devraient toujours être chargés que depuis des sources fiables — la désinfection est un filet de sécurité, pas un substitut à une vérification.
- **Content-Security-Policy.** La **build de production** de la démo injecte cette politique via une balise `<meta http-equiv="Content-Security-Policy">` (le serveur de développement n'est pas concerné) :

  ```
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'
  ```

  Les applications hôtes intégrant `OdontogramShell` devraient définir leur propre CSP adaptée à leur déploiement — le composant n'en injecte aucune lorsqu'il est utilisé comme bibliothèque.

### 📖 Comment citer

Si vous utilisez ce module dans votre travail, veuillez le citer.

**Cette version (v2.4.0) :**
> Dul, Z. (2026). *React Advanced Odontogram* (v2.4.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**Toutes les versions (DOI de concept) :** https://doi.org/10.5281/zenodo.21156787

> Le DOI de concept toutes-versions ci-dessus résout toujours vers la version
> archivée la plus récente ; un DOI spécifique à une version est émis à chaque
> publication lorsqu'elle est archivée sur Zenodo. Jusqu'à ce que la v2.4.0 soit
> archivée, citez-la via le DOI de concept.

Les métadonnées de citation lisibles par machine se trouvent dans [`CITATION.cff`](CITATION.cff).

## 🙌 Remerciements

React Advanced Odontogram est créé et maintenu par Zoltan Dul ([@ZoliQua](https://github.com/ZoliQua)), créateur et développeur principal de l'ensemble du moteur. Avec la précieuse aide des contributeurs cités ci-dessous. Merci à toutes celles et ceux qui ont contribué.

**Contributeurs**

- [@odontodev](https://github.com/odontodev): hydratation de l'état et API de cycle de vie, réglages des obturations en tant que props contrôlées, setters idempotents et cartes repliables
- [@JulianoBazzi](https://github.com/JulianoBazzi): traduction en portugais brésilien
- [@yassine-bhn](https://github.com/yassine-bhn): traduction en français et l'anatomie mesurée proposée
- [@saegerdirk-star](https://github.com/saegerdirk-star): anatomie dentaire mesurée et le générateur de dents, ainsi que la proposition d'interface composable

**Construit avec** [jsPDF](https://github.com/parallax/jsPDF), [DOMPurify](https://github.com/cure53/DOMPurify), [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org) et [Tailwind CSS](https://tailwindcss.com).

Les contributions sont les bienvenues. Ouvrez une pull request sur GitHub et vous serez crédité ici. Si le projet vous est utile, merci de [lui donner une étoile sur GitHub](https://github.com/ZoliQua/React-Odontogram-Modul).
