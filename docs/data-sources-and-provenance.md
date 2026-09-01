# Data Sources and Provenance

The authoritative resource inventory is maintained in [shared-academic-datasets.md](shared-academic-datasets.md). It records resource names, origins, licenses, and current storage details where known.

## Source groups

- BibleMateData: classical Bible modules and commentary resources
- STEPBible / Tyndale House: selected open-access lexicons, notes, and reference datasets
- Other public-domain or open-access sources: clearly identified in the inventory

Every deployed resource should have a source, edition or release identifier, license, conversion method, and storage location. If the origin is uncertain, mark it as unknown rather than inferring it.

The project consumes these resources in read-only fashion. R2 stores larger SQLite objects; D1 stores selected indexed tables. The storage location can differ between local and Cloudflare deployments.

## Resource categories

The inventory covers Bible translations and original-language texts, public-domain and open-access commentaries, lexicons, dictionaries, encyclopedias, cross-references, and supporting reference datasets. The live catalog is deployment-specific; use `get_available_resources` for the authoritative list of resources exposed by a running server.
