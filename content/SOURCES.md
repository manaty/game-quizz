# Starter banks: authoring and references

Version 1.2.0 contains **100 questions per bank, exactly 25 per difficulty**, in English, French and Tagalog. Levels are indicative editorial estimates, not curriculum certification or measures of intelligence. Geography levels reflect familiarity; fruit and history levels progress from recognition to specialist vocabulary and connections. The history bank covers kings, queens, emperors and basic monarchy vocabulary.

## Rebuild and edit

Edit `countries.tsv`, `fruits.tsv`, `kings.tsv` and the two answer dictionaries. A question row contains three localized prompts separated by `~`, then `|`, then four answer keys separated by commas; the first key is the correct answer. Four consecutive groups of 25 rows specify levels 1–4. The generator rotates the correct answer position evenly. The game additionally shuffles answers during play.

Run `npm run content:build`, `npm run build`, and `npm test`. Generation checks translations, distinct prompts (or flag images), answer uniqueness, level balance, image constraints and total bank size. It writes the portable `quizzes/*.quiz.json` and native `server/builtins.js` from the same content. Tests exercise every complete level and all four 100-question matches. Automated tests do not establish the truth of historical or botanical claims.

Flag PNGs are cached under `flags/` so normal rebuilds and gameplay work offline. Only missing source images are fetched by the authoring script; `flag-sources.json` records their source URL and SHA-256. No external image requests are needed to play. Banks remain far below the 10,000,000-byte limit and every image below 100,000 bytes.

## Geography and image provenance

- [Flagpedia / FlagCDN PNG API](https://flagpedia.net/download/api): national flag artwork, downloaded at width 320. The service makes its flag images freely available as public domain. Source files are included unchanged. Flag names and answer text were written for this collection.
- [GeoNames country information](https://download.geonames.org/export/dump/countryInfo.txt) and [attribution/license](https://www.geonames.org/export/): country/capital cross-check, CC BY 4.0. Accents and localized spellings are retained. The selected set avoids multi-capital ambiguities.
- [Australian Department of Foreign Affairs: Palau](https://www.dfat.gov.au/geo/heads-of-government/palau): Ngerulmud, correcting the older Melekeok entry in the GeoNames file consulted.

## Fruit references

Original short question wording; scientific terms are intentionally retained in the specialist Tagalog questions where standard loanwords are appropriate.

- [Kew: apple](https://www.kew.org/plants/apple) and [garden strawberry](https://www.kew.org/plants/garden-strawberry): identification and classification.
- [Kew Plants of the World Online: banana](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A797527-1/general-information) and [papaya](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30011248-2/general-information): morphology, names and uses.
- [Cornell Cooperative Extension: garden botany](https://s3.amazonaws.com/assets.cce.cornell.edu/attachments/18219/garden-botany.pdf): floral structures, pericarp layers and fruit types.
- [University of Nebraska: fruit types](https://extensionpubs.unl.edu/publication/ec1265/2014/pdf/view/ec1265-2014.pdf): drupes, pomes, berries, pepos and hesperidia.
- [University of Maryland Extension: ethylene and fruit ripening](https://extension.umd.edu/resource/ethylene-and-regulation-fruit-ripening): climacteric ripening.
- [University of Minnesota Extension: freezing fruit](https://extension.umn.edu/food/preparing/cooking-at-home/food-preservation/freezing/freezing-fruit): ripening categories and preservation.
- [University of California Riverside: what kind of fruit is an avocado?](https://avocado.ucr.edu/what-kind-fruit-avocado): single-seeded berry and pericarp terminology.

The French distinction between *pamplemousse* (Citrus maxima) and *pomélo* (Citrus × paradisi) is made explicit with scientific names. Questions asking about seeds distinguish the seed from the hard stone enclosing it.

## Historical references

Dates and reigns are historical rather than questions about current rulers, so the bank does not depend on a live officeholder list. These references support editorial checks and future maintenance; the questions are original rather than quotations.

- [British Royal Family: monarchs from 1066](https://www.royal.uk/kings-and-queens-1066), [monarchs from 1603](https://www.royal.uk/united-kingdom-monarchs-1603-present), [House of Windsor](https://www.royal.uk/house-windsor).
- [English Heritage: kings and queens timeline](https://www.english-heritage.org.uk/siteassets/home/members-area/kids/kids-rule---kings-and-queens/landing-page/kings-and-queens-timeline-2023.pdf).
- [Palace of Versailles: Louis XIV](https://en.chateauversailles.fr/discover/history/great-characters/louis-xiv), [Louis XV](https://en.chateauversailles.fr/discover/history/great-characters/louis-xv), [historical chronology](https://www.chateauversailles.fr/decouvrir/histoire/les-grandes-dates).
- [Swedish Royal Court: history of the monarchy](https://www.kungahuset.se/english/the-monarchy-of-sweden).
- [Danish Royal House: history](https://www.kongehuset.dk/en/the-monarchy-in-denmark/history), [royal lineage](https://www.kongehuset.dk/en/the-monarchy-in-denmark/the-royal-lineage).
- [National Museum of Denmark: Jelling monuments](https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-viking-age/the-monuments-at-jelling/).
- [World of the Habsburgs: Maria Theresa](https://www.habsburger.net/en/persons/habsburg-emperor/maria-theresa), [Rudolf I](https://www.habsburger.net/en/persons/habsburg-emperor/rudolf-i), [Compromise with Hungary](https://www.habsburger.net/en/chapter/empire-two-halves-compromise-hungary).
- [Charles University: foundation charter, 1348](https://cuni.cz/UKEN-116.html).
- [Jagiellonian University student government: university history](https://info.samorzad.uj.edu.pl/en/university/history/).
- [Museum of King Jan III's Palace at Wilanów: royal residence](https://wilanow-palac.pl/en/discover-the-royal-residence).

Editorial reference check: 8 September 2026. Original questionnaire text: Manaty, CC BY 4.0. Reference websites retain their own rights; their articles and photographs are not redistributed with these banks.
