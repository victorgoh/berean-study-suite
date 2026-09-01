# Data Sources and Provenance

The authoritative resource inventory is maintained in [shared-academic-datasets.md](shared-academic-datasets.md). It records resource names, origins, licenses, and current storage details where known.

## Source groups

- BibleMateData: classical Bible modules and commentary resources
- STEPBible / Tyndale House: selected open-access lexicons, notes, and reference datasets
- Other public-domain or open-access sources: clearly identified in the inventory

Every deployed resource should have a source, edition or release identifier, license, conversion method, and storage location. If the origin is uncertain, mark it as unknown rather than inferring it.

The Book Guide uses the concise `BookIntroSummaries.xml` and full `BookIntros.xml` from the Tyndale Open Study Notes distribution. They are imported unchanged into `data/tyndale_book_intros.data`, identified in each result as Tyndale Open Study Notes, Tyndale House Publishers, CC BY-SA 4.0.

The project consumes these resources in read-only fashion. R2 stores larger SQLite objects; D1 stores selected indexed tables. The storage location can differ between local and Cloudflare deployments.

Some runtime resources are source-preserving normalized derivatives. They retain the source schema and content while decoding display-only typographic entities and composing Unicode diacritics. The original source database remains unchanged; the derivative records its source checksum and normalizer metadata in `NormalizationMetadata`.

## Resource categories

The inventory covers Bible translations and original-language texts, public-domain and open-access commentaries, lexicons, dictionaries, encyclopedias, cross-references, and supporting reference datasets. The live catalog is deployment-specific; use `get_available_resources` for the authoritative list of resources exposed by a running server.
