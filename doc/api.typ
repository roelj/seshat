#import "config.typ": *
#let categoryDescription = [
  Categories are a controlled vocabulary and can be used to make the collection
  findable in the categorical overviews. The `string` values expected here
  can be found under the `uuid` property with a call to `\/v2/categories`.
  For more details, see @sec-v2-categories.
]

#let customFieldsDescription = [
  An `Object` where each key is a field name and each value is the
  corresponding value. Allowed values are: `contributors`,
  `data_link`, `derived_from`, `format`, `geolocation`,
  `language`, `latitude`, `longitude`, `organizations`,
  `publisher`, `same_as`, `time_coverage`.
]

#let customFieldsListDescription = [
  Each `Object` should have two keys: `name` and `value`. For
  allowed keys, see `custom_fields`.
]

#let resourceDoiDescription = [
  The URL of the DOI of an associated peer-reviewed journal publication.
]

#let resourceTitleDescription = [
  The title of the associated peer-reviewed journal publication.
]

#let doiDescription = [
  Do not use this field as a DOI will be automatically assigned upon publication.
]

#let timelineDescription = [
  Do not use this field because it will be automatically populated
  during the publication process.
]

#let pagingOptions(item) = (
  ([`page`],      [Optional], [The page number used in combination with `page_size`.]),
  ([`page_size`], [Optional], [The number of #item\s per page. Used in combination with `page`.]),
  ([`limit`],     [Optional], [The maximum number of #item\s to output. Used together with `offset`.]),
  ([`offset`],    [Optional], [The number of #item\s to skip in the output. Used together with `limit`.]),
)

#let licenseDescription(item) = [
  Licences communicate under which conditions the #item can be
  re-used. The `integer` value to submit here can be found as
  the `value` property in a call to `\/v2/licences`. For more
  details, see @sec-v2-licenses.
]

#let tagsDescription(item) = [
  Keywords to enhance the findability of the #item. Instead of using
  the key `tags`, you may also use the key `keywords`.
]

#let fundingParameters = [
  The following parameters can be used:

  #table(
    columns: (auto, auto, auto, 1fr),
    table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
    [`uuid`],         [`string`], [No],  [The uuid of an existing funding record. When this parameter is set, other parameters will be ignored.],
    [`title`],        [`string`], [Yes], [The title of the funding project.],
    [`grant_code`],   [`string`], [No],  [An optional grant code of the funding.],
    [`funder_name`],  [`string`], [No],  [The name of the funder.],
    [`url`],          [`string`], [No],  [A URL to the funding project or funding organization.],
  )
]

#let authorParameters = [
  The following parameters can be used:

  #table(
    columns: (auto, auto, auto, 1fr),
    table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
    [`full_name`],  [`string`], [No],  [The full name of the author.],
    [`first_name`], [`string`], [Yes], [The first name of the author.],
    [`last_name`],  [`string`], [Yes], [The last name of the author.],
    [`email`],      [`string`], [No],  [The e-mail address of the author.],
    [`orcid_id`],   [`string`], [No],  [The ORCID identifier for the author.],
    [`job_title`],  [`string`], [No],  [The job title of the author.],
  )
]

#let categoriesParameters = [
  The parameters sent to the server should be a JSON object with a single key
  named `categories`, with as value a list of either the numeric or the UUID
  identifiers for a category. The API endpoint described in
  @sec-api-v2-articles-categories-get shows how to obtain the category
  identifiers.
]

#let searchParameters = table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`search_for`], [Optional], [The terms to search for.],
)

#let chapter_text = [
= Application Programming Interface <api>

The application programming interface (API) provided by `seshat` allows
for automating tasks otherwise done through the user interface. In addition
to automation, the API can also be used to gather additional information,
like statistics on Git repositories.

Throughout this chapter we provide examples for using the API using `curl` and `jq`.
Another way of seeing the API in action is to use the developer tools in a web
browser while performing the desired action using the web user interface.

== Published datasets

The `v2` API was designed by Figshare#footnote(link("https://figshare.com")).
`seshat` implements a backward-compatible version of it, with the
following differences:

+ The `id` property is superseded by the `uuid` property.
+ Error handling is done through precise HTTP error codes, rather than always returning `400` on a usage error.

Unless specified otherwise, the HTTP `Content-Type` to interact
with the API is `application/json`. In the case an API call returns
information, don't forget to set the HTTP `Accept` header appropriately.

=== `/v2/articles` (`GET`) <sec-v2-articles>

This API endpoint can be used to retrieve a list of published datasets.
Passing (one of) the following parameters will filter or sort the list of
datasets:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`order`],            [Optional], [Field to use for sorting.],
  [`order_direction`],  [Optional], [Can be either `asc` or `desc`.],
  [`institution`],      [Optional], [The institution identifier to filter on.],
  [`published_since`],  [Optional], [When set, datasets published before this timestamp are dropped from the results.],
  [`modified_since`],   [Optional], [When set, only datasets modified after this timestamp are shown from the results.],
  [`group`],            [Optional], [The group identifier to filter on.],
  [`resource_doi`],     [Optional], [#resourceDoiDescription When set, only returns datasets associated with this DOI.],
  [`item_type`],        [Optional], [Either `3` for datasets or `9` for software.],
  [`doi`],              [Optional], [The DOI of the dataset to search for.],
  [`handle`],           [Optional], [Unused.],
    ..pagingOptions("dataset").flatten(),
)

Example usage:
#let output = ```bash
curl "<seshatbaseurl>/v2/articles?limit=100&published_since=2024-07-25" | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "4f8a9423-83fc-4263-9bb7-2aa83d73865d",
    "title": "Measurement data of a Low Speed Field Test of Tractor Se...",
    "doi": "10.4121/4f8a9423-83fc-4263-9bb7-2aa83d73865d.v1",
    "handle": null,
    "url": "<seshatbaseurl>/v2/articles/4f8a...865d",
    "published_date": "2024-07-26T10:39:57",
    "thumb": null,
    "defined_type": 3,
    "defined_type_name": "dataset",
    "group_id": 28589,
    "url_private_api": "<seshatbaseurl>/v2/account/articles/4f8a...865d",
    "url_public_api": "<seshatbaseurl>/v2/articles/4f8a...865d",
    "url_private_html": "<seshatbaseurl>/my/datasets/4f8a...865d/edit",
    "url_public_html": "<seshatbaseurl>/datasets/4f8a...865d/1",
    ...
  }
]
```
#render_code_output(output)

=== `/v2/articles/search` (`POST`) <sec-api-v2-articles-search-post>

In addition to the parameters of @sec-v2-articles, the following parameters
can be used.

#searchParameters

Example usage:
#let output = ```bash
curl --request POST \
     --header "Content-Type: application/json"\
     --data '{ "search_for": "seshat" }'\
     <seshatbaseurl>/v2/articles/search | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "342efadc-66f8-4e9b-9d27-da7b28b849d2",
    "title": "Source code of the 4TU.ResearchData repository",
    "doi": "10.4121/342efadc-66f8-4e9b-9d27-da7b28b849d2.v1",
    "handle": null,
    "url": "<seshatbaseurl>/v2/articles/342e...49d2",
    "published_date": "2023-03-20T11:29:10",
    "thumb": null,
    "defined_type": 9,
    "defined_type_name": "software",
    "group_id": 28586,
    "url_private_api": "<seshatbaseurl>/v2/account/articles/342e...49d2",
    "url_public_api": "<seshatbaseurl>/v2/articles/342e...49d2",
    "url_private_html": "<seshatbaseurl>/my/datasets/342e...49d2/edit",
    "url_public_html": "<seshatbaseurl>/datasets/342e...49d2/1",
    ...
  }
]
```
#render_code_output(output)

=== `/v2/articles/<dataset-id>` (`GET`) <sec-v2-articles-dataset-id>

This API endpoint can be used to retrieve detailed metadata for the dataset
identified by `dataset-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/articles/342efadc-66f8-4e9b-9d27-da7b28b849d2 | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "files": ...,
  "custom_fields": ...,
  "authors": ...,
  "description": "<p>This dataset contains the source code of the 4TU...",
  "license": ...,
  "tags": ...,
  "categories": ...,
  "references": ...,
  "id": null,
  "uuid": "342efadc-66f8-4e9b-9d27-da7b28b849d2",
  "title": "Source code of the 4TU.ResearchData repository",
  "doi": "10.4121/342efadc-66f8-4e9b-9d27-da7b28b849d2.v1",
  "url": "<seshatbaseurl>/v2/articles/342e...49d2",
  "published_date": "2023-03-20T11:29:10",
  "timeline": ...,
  ...
}
```
#render_code_output(output)

=== `/v2/articles/<dataset-id>/versions` (`GET`)

This API endpoint can be used to retrieve a list of versions for the dataset
identified by `dataset-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/articles/342efadc-66f8-4e9b-9d27-da7b28b849d2/versions | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[
  {
    "version": 1,
    "url": "<seshatbaseurl>/v2/articles/342e...49d2/versions/1"
  }
]
```
#render_code_output(output)

=== `/v2/articles/<dataset-id>/versions/<version>` (`GET`)

This API endpoint can be used to retrieve detailed metadata of the version
`version` for the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/articles/342e...49d2/versions/1 | jq
```
#render_code_output(output)

The output of the example is identical to the example output of @sec-v2-articles-dataset-id.

=== `/v2/articles/<dataset-id>/versions/<version>/embargo` (`GET`)

This API endpoint can be used to retrieve embargo information of the version
`version` for the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/articles/c127...8fd7/versions/2/embargo | jq
```
#render_code_output(output)

Output of the example:
```json
{
  "is_embargoed": true,
  "embargo_date": "2039-06-30",
  "embargo_type": "article",
  "embargo_title": "Under embargo",
  "embargo_reason": "<p>Need consent to publish the data</p>",
  "embargo_options": []
}
```

=== `/v2/articles/<dataset-id>/files` (`GET`)

This API endpoint can be used to retrieve the list of files associated with
the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/articles/342efadc-66f8-4e9b-9d27-da7b28b849d2/files
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "d3e1c325-7fa9-4cb9-884e-0b9cd2059292",
    "name": "seshat-0.0.1.tar.gz",
    "size": 3713709,
    "is_link_only": false,
    "is_incomplete": false,
    "download_url": "<seshatbaseurl>/file/342e...49d2/d3e1...9292",
    "supplied_md5": null,
    "computed_md5": "910e9b0f79a0af548f59b3d8a56c3bf4"
  }
]
```
#render_code_output(output)

=== `/v2/articles/<dataset-id>/files/<file-id>` (`GET`)

This API endpoint can be used to retrieve all metadata of the file
identified by `file-id` associated with the dataset identified
by `dataset-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/articles/342e...49d2/files/d3e1...9292 | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "id": null,
  "uuid": "d3e1c325-7fa9-4cb9-884e-0b9cd2059292",
  "name": "seshat-0.0.1.tar.gz",
  "size": 3713709,
  "is_link_only": false,
  "is_incomplete": false,
  "download_url": "<seshatbaseurl>/file/342e...49d2/d3e1...9292",
  "supplied_md5": null,
  "computed_md5": "910e9b0f79a0af548f59b3d8a56c3bf4"
}
```
#render_code_output(output)

== Published collections

=== `/v2/collections` (`GET`) <sec-v2-collections>

This API endpoint can be used to retrieve a list of collections published
in the data repository.

The following parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`order`],            [Optional], [Field to use for sorting.],
  [`order_direction`],  [Optional], [Can be either `asc` or `desc`.],
  [`institution`],      [Optional], [The institution identifier to filter on.],
  [`published_since`],  [Optional], [When set, collections published before this timestamp are dropped from the results.],
  [`modified_since`],   [Optional], [When set, only collections modified after this timestamp are shown from the results.],
  [`group`],            [Optional], [The group identifier to filter on.],
  [`resource_doi`],     [Optional], [#resourceDoiDescription When set, only returns collections associated with this DOI.],
  [`doi`],              [Optional], [The DOI of the collection to search for.],
  [`handle`],           [Optional], [Unused.],
  ..pagingOptions("collection").flatten(),
)

Example usage:
#let output = ```bash
curl "<seshatbaseurl>/v2/collections?limit=100&published_since=2024-07-25" | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "0fe9ab80-6e6a-4087-a509-ce09dddfa3d9",
    "title": "PhD research 'Untangling the complexity of local water ...'",
    "doi": "10.4121/0fe9ab80-6e6a-4087-a509-ce09dddfa3d9.v1",
    "handle": "",
    "url": "<seshatbaseurl>/v2/collections/0fe9...fa3d9",
    "timeline": {
      "posted": "2024-08-13T14:09:52",
      "firstOnline": "2024-08-13T14:09:51",
      ...
    },
    "published_date": "2024-08-13T14:09:52"
  },
  ...
]
```
#render_code_output(output)

=== `/v2/collections/search` (`POST`)

This API endpoint can be used to search for collections published in
the data repository.

In addition to the parameters of @sec-v2-collections, the following
parameters can be used.

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`search_for`], [Optional], [The terms to search for.],
)

Example usage:
#let output = ```bash
curl --request POST \
     --header "Content-Type: application/json"\
     --data '{ "search_for": "wingtips" }'\
     <seshatbaseurl>/v2/collections/search | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[  /* Example output has been shortened. */
  {
    "id": 6070238,
    "uuid": "3dfc4ef2-7f79-4d33-81a7-9c6ae09a2782",
    "title": "Flared Folding Wingtips - TU Delft",
    "doi": "10.4121/c.6070238.v1",
    "handle": "",
    "url": "<seshatbaseurl>/v2/collections/3dfc...2782",
    "timeline": {
      "posted": "2023-04-05T15:05:04",
      "firstOnline": "2023-04-05T15:05:03",
      ...
    },
    "published_date": "2023-04-05T15:05:04"
  },
  ...
]
```
#render_code_output(output)

=== `/v2/collections/<collection-id>` (`GET`)

This API endpoint can be used to retrieve detailed metadata for the collection
identified by `collection-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/collections/3dfc4ef2-7f79-4d33-81a7-9c6ae09a2782 | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* Example output has been shortened. */
  "version": 3,
  ...
  "description": "<p>This collection contains the results of the work ...",
  "categories": [ ... ],
  "references": [],
  "tags": [ ... ],
  "created_date": "2024-08-08T15:48:55",
  "modified_date": "2024-08-12T11:24:39",
  "id": 6070238,
  "uuid": "3dfc4ef2-7f79-4d33-81a7-9c6ae09a2782",
  "title": "Flared Folding Wingtips - TU Delft",
  "doi": "10.4121/c.6070238.v3",
  "published_date": "2024-08-12T11:24:40",
  "timeline": ...
  ...
}
```

=== `/v2/collections/<collection-id>/versions` (`GET`)

This API endpoint can be used to retrieve a list of versions for the collection
identified by `collection-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/collections/3dfc4ef2-7f79-4d33-81a7-9c6ae09a2782/versions | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "version": 3,
    "url": "<seshatbaseurl>/v2/collections/3dfc...2782/versions/3"
  },
  {
    "version": 2,
    "url": "<seshatbaseurl>/v2/collections/3dfc...2782/versions/2"
  },
  {
    "version": 1,
    "url": "<seshatbaseurl>/v2/collections/3dfc...2782/versions/1"
  }
]
```
#render_code_output(output)

=== `/v2/collections/<collection-id>/versions/<version>` (`GET`)

This API endpoint can be used to retrieve detailed metadata of the version
`version` for the collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/collections/3dfc...2782/versions/2 | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* Example output has been shortened. */
  "version": 2,
  ...
  "description": "<p>This collection contains the results of the work ...",
  "categories": [ ... ],
  "references": [],
  "tags": [ ... ],
  "references": [],
  "tags": [ ... ],
  "authors": [ ... ],
  "created_date": "2023-04-05T15:07:35",
  "modified_date": "2023-05-26T15:19:11",
  "id": 6070238,
  "uuid": "3dfc4ef2-7f79-4d33-81a7-9c6ae09a2782",
  "title": "Flared Folding Wingtips - TU Delft",
  "doi": "10.4121/c.6070238.v2",
  ...
}
```

=== `/v2/collections/<collection-id>/articles` (`GET`)

This API endpoint can be used to retrieve the list of datasets in the
collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/collections/3dfc...2782/articles | jq
```
#render_code_output(output)

Output of the example:
```json
[ /* Example output has been shortened. */
  {
    "id": 20222334,
    "uuid": "c5fde4a2-798a-456e-b793-cf64e486c0e8",
    "title": "E001 - Stiffness and Hinge Release Study (October 2021) ...",
    "doi": "10.4121/20222334.v2",
    "published_date": "2023-05-31T08:57:54",
    "defined_type": 3,
    "defined_type_name": "dataset",
    "group_id": 28586,
    "timeline": {
      "posted": "2023-05-31T08:57:54",
      "firstOnline": "2023-05-26T15:08:09",
      "revision": null
    },
    "resource_title": "Effect of Wing Stiffness and Folding Wingtip ...",
    "resource_doi": "https://doi.org/10.2514/1.C037108"
  },
  {
    "id": null,
    "uuid": "984090ea-26fd-4809-8dac-f41367bf8916",
    "title": "M001 - GVT Data and Nastran models (August 2024) ...",
    "doi": "10.4121/984090ea-26fd-4809-8dac-f41367bf8916.v1",
    "published_date": "2024-08-12T11:21:47",
    "defined_type": 3,
    "defined_type_name": "dataset",
    "group_id": 28586,
    "timeline": {
      "posted": "2024-08-12T11:21:47",
      "firstOnline": "2024-08-12T11:21:46",
      "revision": null
    },
    "resource_title": "Effect of Wing Stiffness and Folding Wingtip ...",
    "resource_doi": "https://doi.org/10.2514/1.C037108"
  }
]
```

== Categories

=== `/v2/categories` (`GET`) <sec-v2-categories>

Each dataset and collection is categorized using a controlled vocabulary
of categories. This API endpoint provides those categories.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/categories | jq
```
#render_code_output(output)

Output of the example:
```json
[ /* Example output has been shortened. */
  {
    "id": 13622,
    "uuid": "01fddd41-68d2-4e28-9d9c-18347847e7d1",
    "title": "Mining and Extraction of Energy Resources",
    "parent_id": 13620,
    "parent_uuid": "6e5bdc69-96db-41e4-ac0b-18812b46c49c",
    "path": "",
    "source_id": null,
    "taxonomy_id": null
  },
  {
    "id": 13443,
    "uuid": "026f555c-2826-4a83-97ff-0f230fb54ddb",
    "title": "Livestock Raising",
    "parent_id": 13440,
    "parent_uuid": "45a8c849-ab59-4302-af79-09b8c0677df8",
    "path": "",
    "source_id": null,
    "taxonomy_id": null
  },
  ...
]
```

== Licences

=== `/v2/licenses` (`GET`) <sec-v2-licenses>

Publishing a dataset involves communicating under which conditions it can be
re-used. The licenses under which you can publish a dataset can be found with
this API endpoint.

Example usage:
#let output = ```bash
curl <seshatbaseurl>/v2/licenses | jq
```
#render_code_output(output)

Output of the example:
```json
[ /* Example output has been shortened. */
  {
    "value": 1,
    "name": "CC BY 4.0",
    "url": "https://creativecommons.org/licenses/by/4.0/",
    "type": "data"
  },
  {
    "value": 10,
    "name": "CC BY-NC 4.0",
    "url": "https://creativecommons.org/licenses/by-nc/4.0/",
    "type": "data"
  },
  ...
]
```

== Account properties

The interaction with the `v2` private interface API requires an API token.
Such a token can be obtained from the dashboard page after logging in. This
token can then be passed along in the `Authorization` HTTP header as:

```
Authorization: token YOUR_TOKEN_HERE
```

=== `/v2/account` (`GET`)

This API endpoint can be used to retrieve information about the account
identified with the API token.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* Example output has been shortened. */
  "id": null,
  "uuid": "df7c0e54-b988-42b1-a815-308513d2f269",
  "is_active": true,
  "is_public": false,
  ...
}
```

== Authors

=== `/v2/account/authors/search` (`POST`)

This API endpoint can be used to search for authors known to the data
repository.

The following parameter can be used:

#table(
  columns: (auto, auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
  [`search`], [`string`], [Yes], [The string to search for.],
)

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --data '{ "search": "John Doe" }' \
     <seshatbaseurl>/v2/account/authors/search | jq
```
#render_code_output(output)

Output of the example:
```json
[ /* This example output has been shortened. */
  {
    "full_name": "John Doe Jr",
    "uuid": "08f4d496-67b5-4b7c-b2d2-923458d1f450",
    "orcid_id": "",
    ...
  },
  {
    "full_name": "John Doe",
    "uuid": "6815031c-21dc-4873-93c9-f6539da482ce",
    "orcid_id": "",
    ...
  }
]
```

=== `/v2/account/authors/<author-id>` (`GET`)

This API endpoint returns a detailed author record for the author identified
by `author-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/authors/5c75...94aa | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* This example output has been shortened. */
  "first_name": "Roel",
  "full_name": "Roel Janssen",
  "uuid": "5c752155-60ff-41d7-9b88-b7112afc94aa",
  "last_name": "Janssen",
  "orcid_id": "0000-0003-4324-5350",
  ...
}
```

== Institutions

=== `/v2/account/institution` (`GET`)

This API endpoint returns the accounts within your institution.

Example usage:
#let output = ```bash
curl --header "Accept: application/json" \
     --header "Authorization: token ${API_TOKEN}" \
     <seshatbaseurl>/v2/account/institution/accounts | jq
```
#render_code_output(output)

Output of the example:
```json
[
  { /* This example output has been shortened. */
    "uuid": "485a04c8-7fb0-4361-856f-470930c5fec0",
    "first_name": "Roel",
    "last_name": "Janssen",
    "full_name": "Roel Janssen",
    "is_active": true,
    "is_public": false,
    ...
  },
  ...
]
```

=== `/v2/account/institution/users/<account-id>` (`GET`)

This API endpoint returns account information for the specified `account-id`.

Example usage:
#let output = ```bash
curl --header "Accept: application/json" \
     --header "Authorization: token ${API_TOKEN}" \
     <seshatbaseurl>/v2/account/institution/users/485a...fec0 | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* This example output has been shortened. */
  "uuid": "485a04c8-7fb0-4361-856f-470930c5fec0",
  "first_name": "Roel",
  "last_name": "Janssen",
  "full_name": "Roel Janssen",
  "is_active": true,
  "is_public": false,
  ...
}
```

== Git repositories

A published dataset may include a Git repository in its publication.
The Git repository has a unique UUID that isn't re-used between versions
of the same publication.

=== `/v3/datasets/<git-uuid>.git` (`GET`)

This endpoint can be used to pass as a URL to `git clone`.

Example usage:
#let output = ```bash
git clone <seshatbaseurl>/v3/datasets/de82...20b7.git
```
#render_code_output(output)

Output of the example:
```bash
Cloning into 'seshat'...
remote: Enumerating objects: 24850, done.
remote: Counting objects: 100% (4171/4171), done.
remote: Compressing objects: 100% (599/599), done.
remote: Total 24850 (delta 3963), reused 3647 (delta 3571), pack-reused 20679 (from 2)
Receiving objects: 100% (24850/24850), 11.41 MiB | 569.00 KiB/s, done.
Resolving deltas: 100% (17094/17094), done.
```

=== `/v3/datasets/<git-uuid>.git/zip` (`GET`)

This endpoint offers a ZIP file to download the files in the Git
repository without using Git. The ZIP file is generated on the
spot, and therefore, the timestamps of files within the
ZIP file are set to _January 1, 1980_ to ensure that
downloading a ZIP file multiple times results in an identical
ZIP file.

=== `/v3/datasets/<git-uuid>.git/languages` (`GET`)

This API endpoint can be used to gather which programming languages are
used in which ratio to each other for the Git repository identified by
the `git-uuid`.

The number returned per programming language is the sum of the number
of bytes of files identified to belong to that programming language.

Example usage:
#let output = ```bash
curl --header "Accept: application/json" \
     <seshatbaseurl>/v3/datasets/de82...20b7.git/languages
```
#render_code_output(output)

Output of the example:
```json
{ /* Example output has been shortened. */
  "Python": 963065,
  "JavaScript": 188239,
  "HTML": 186766,
  ...
}
```

=== `/v3/datasets/<git-uuid>.git/contributors` (`GET`)

This API endpoint provides contributions in the form of additions,
deletions and commits per week per author.

Example usage:
#let output = ```bash
curl --header "Accept: application/json" \
     <seshatbaseurl>/v3/datasets/de82...20b7.git/contributors
```
#render_code_output(output)

Output of the example:
```json
[ /* Example output has been annotated and shortened. */
  {
    "total": 2769,
    "additions": 94508,
    "deletions": 62028,
    "weeks": [
      {
        "w": 1624831200,   /* Timestamp for the week */
        "a": 100,          /* Additions */
        "d": 0,            /* Deletions */
        "c": 2             /* Commits */
      },
      ...
    ],
    "author": {
      "name": "Roel Janssen",
      "email": "..."       /* Omitted from the example. */
    }
  },
  ...
]
```

== Creating and editing datasets

=== `/v2/account/articles` (`GET`)

This API endpoint lists the draft datasets of the account to which the
authorization token belongs.

The following parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  ..pagingOptions("dataset").flatten(),
)

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "id": null,
  "uuid": "6ddd7a31-8ad8-4c20-95a3-e68fe716fa42",
  "title": "Example draft dataset",
  "doi": null,
  "handle": null,
  "url": "<seshatbaseurl>/v2/articles/6ddd7a31-8ad8-4c20-95a3-e68fe716fa42",
  "published_date": null,
  ...
}
```
#render_code_output(output)

=== `/v2/account/articles` (`POST`)

This API endpoint can be used to create a new dataset.

The following parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Description*]),
  [`title`],               [`string`],                  [The title of the dataset.],
  [`description`],         [`string`],                  [A description of the dataset.],
  [`tags`],                [list of `string`s],         [#tagsDescription("dataset")],
  [`keywords`],            [list of `string`s],         [See `tags`.],
  [`references`],          [list of `string`s],         [URLs to resources referring to this dataset, or resources that this dataset refers to.],
  [`categories`],          [list of `string`s],         [#categoryDescription],
  [`authors`],             [list of author records],    [],
  [`defined_type`],        [`string`],                  [One of: `figure`, `online resource`, `preprint`, `book`, `conference contribution`, `media`, `dataset`, `poster`, `journal contribution`, `presentation`, `thesis` or `software`.],
  [`funding`],             [`string`],                  [One-liner to cite funding.],
  [`funding_list`],        [list of funding records],   [],
  [`license`],             [`integer`],                 [#licenseDescription("dataset")],
  [`language`],            [`string`],                  [An ISO 639-1 language code.],
  [`doi`],                 [`string`],                  [#doiDescription],
  [`handle`],              [`string`],                  [Do not use this field as it is deprecated.],
  [`resource_doi`],        [`string`],                  [#resourceDoiDescription],
  [`resource_title`],      [`string`],                  [#resourceTitleDescription],
  [`publisher`],           [`string`],                  [The name of the data repository publishing the dataset.],
  [`custom_fields`],       [list of key-value pairs],   [#customFieldsDescription],
  [`custom_fields_list`],  [list of `Object`s],         [#customFieldsListDescription],
  [`timeline`],            [],                          [#timelineDescription],
)

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "title": "Example dataset" }' \
     <seshatbaseurl>/v2/account/articles | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* The UUID in this example has been shortened. */
  "location": "<seshatbaseurl>/v2/account/articles/d7b3...995b1",
  "warnings": []
}
```
#render_code_output(output)

=== `/v2/account/articles/<dataset-id>` (`GET`)

This API endpoint lists details of the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1 | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* Example output has been shortened. */
  "files": [],
  "authors": [],
  "id": null,
  "uuid": "637e9a3b-3e6d-4810-bc8d-f15ab1d6a4d7",
  "title": "Example dataset",
  ...
}
```

=== `/v2/account/articles/<dataset-id>` (`PUT`)

This API endpoint can be used to update the metadata of the dataset
identified by `dataset-id`.

The following parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`title`],                         [`string`],   [The title of the dataset.],
  [`description`],                   [`string`],   [A description of the dataset.],
  [`resource_doi`],                  [`string`],   [#resourceDoiDescription],
  [`resource_title`],                [`string`],   [#resourceTitleDescription],
  [`license`],                       [`integer`],  [#licenseDescription("dataset")],
  [`group_id`],                      [`integer`],  [],
  [`time_coverage`],                 [`string`],   [Free-text field to describe the time coverage of the dataset.],
  [`publisher`],                     [`string`],   [The name of the data repository publishing the dataset.],
  [`language`],                      [`string`],   [An ISO 639-1 language code.],
  [`contributors`],                  [`string`],   [Free-text field to indicate contributors to the dataset other than direct authors.],
  [`license_remarks`],               [`string`],   [Free-text field to clarify licensing details.],
  [`geolocation`],                   [`string`],   [Free-text field to specify a location.],
  [`longitude`],                     [`string`],   [The longitude coordinate of the location.],
  [`latitude`],                      [`string`],   [The latitude coordinate of the location.],
  [`format`],                        [`string`],   [Free-text field to indicate the data format(s) used in the dataset.],
  [`data_link`],                     [`string`],   [URL to where the data can be found. This is only applicable when data is not directly uploaded.],
  [`derived_from`],                  [`string`],   [DOI or URL of a dataset from which this dataset is derived from.],
  [`same_as`],                       [`string`],   [DOI or URL of the dataset that is the same as this one.],
  [`organizations`],                 [`string`],   [Free-text field to specify organizations that contributed or are associated with the dataset.],
  [`is_embargoed`],                  [`boolean`],  [Set to `true` when the dataset is under embargo.],
  [`embargo_options`],               [`Object`],   [An `Object` with an `id` property that can have either the integer value `1000` to indicate the dataset has no end-date for the embargo or the integer value `1001` to indicate that the dataset is permanently closed-access.],
  [`embargo_until_date`],            [`string`],   [A date indicator for when the dataset will be available publically.],
  [`embargo_type`],                  [`string`],   [Either `file` for files-only embargo or `article` to also hide the metadata, except for the title and authors of the dataset.],
  [`embargo_title`],                 [`string`],   [Title of the embargo.],
  [`embargo_reason`],                [`string`],   [Reason for the embargo.],
  [`is_metadata_record`],            [`boolean`],  [Set to `true` when no data is associated with this dataset.],
  [`metadata_reason`],               [`string`],   [Reason why the dataset is metadata-only.],
  [`eula`],                          [`string`],   [An End-User-License-Agreement.],
  [`defined_type`],                  [`string`],   [Either `software` to indicate the dataset is software or `dataset` to indicate the dataset is data (not software).],
  [`git_repository_name`],           [`string`],   [Title of the Git repository (for software datasets only). This is a seshat-extension to the original API specification.],
  [`git_code_hosting_url`],          [`string`],   [Link to the code hosting platform (e.g. Gitlab, or any other). This is a seshat-extension to the original API specification.],
  [`agreed_to_deposit_agreement`],   [`boolean`],  [Set to `true` when you agree to the repository's deposit agreement. This is a seshat-extension to the original API specification.],
  [`agreed_to_publish`],             [`boolean`],  [Set to `true` to indicate the dataset may be published. This is a seshat-extension to the original API specification.],
  [`categories`],                    [list of `string`s], [#categoryDescription],
)

Example usage:
#let output = ```bash
curl --verbose --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --data '{ "title": "Updated title" }'
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1 | jq
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/articles/<dataset-id>` (`DELETE`)

This API endpoint can be used to delete a draft dataset.

Example usage:
#let output = ```bash
curl --verbose --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/authors` (`GET`) <sec-api-v2-articles-authors>

This API endpoint lists the authors of the dataset identified by `dataset-id`.
The following URL parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`order`],           [Optional], [Field to use for sorting.],
  [`order_direction`], [Optional], [Can be either `asc` or `desc`.],
  [`limit`],           [Optional], [The maximum number of datasets to output. Used together with `offset`.],
)

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1 | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": null,
    "uuid": "08f4d496-67b5-4b7c-b2d2-923458d1f450",
    "full_name": "John Doe Jr",
    "is_active": false,
    "url_name": null,
    "orcid_id": ""
  },
  {
    "id": null,
    "uuid": "6815031c-21dc-4873-93c9-f6539da482ce",
    "full_name": "John Doe",
    "is_active": false,
    "url_name": null,
    "orcid_id": ""
  }
]
```

=== `/v2/account/articles/<dataset-id>/authors` (`POST`) <sec-api-v2-articles-authors-post>

This API endpoint can be used to append authors to the dataset identified
by `dataset-id`.

#authorParameters

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe" }]}' \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1/authors
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe Jr" }]}' \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1/authors
```
#render_code_output(output)

The following is an example of the output of the HTTP `POST` calls:
```
HTTP/1.1 205 RESET CONTENT
```

An example of the output of the HTTP `GET` call can be found in @sec-api-v2-articles-authors.

=== `/v2/account/articles/<dataset-id>/authors` (`PUT`)

In contrast to @sec-api-v2-articles-authors-post, this API endpoint
can be used to *overwrite* the list of authors of the dataset identified
by `dataset-id`.

Example usage:
#let output = ```bash
curl --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe" }]}' \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1/authors

curl --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe Jr" }]}' \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1/authors

curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1 | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": null,
    "uuid": "61751fe3-53a1-477f-a46f-e534cbd0b618",
    "full_name": "John Doe Jr",
    "is_active": false,
    "url_name": null,
    "orcid_id": ""
  },
]
```

=== `/v2/account/articles/<dataset-id>/authors/<author-id>` (`DELETE`)

This API endpoint can be used to delete an author's association with a dataset.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/authors/6175...0b618
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/funding` (`GET`)

This API endpoint lists the funding of the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...95b1/funding | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": null,
    "uuid": "6f605fe1-e87a-43f5-8b67-70ebe3f9b868",
    "title": "Example cases fund",
    "grant_code": "EXA-001",
    "funder_name": "Example",
    "is_user_defined": null,
    "url": "https://example.exa"
  }
]
```

=== `/v2/account/articles/<dataset-id>/funding` (`POST`) <sec-api-v2-articles-funding-post>

This API endpoint can be used to append funders to the dataset identified
by `dataset-id`.

#fundingParameters

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "funders": [{ "title": "Example cases fund", \
                             "grant_code": "EXA-001", \
                             "funder_name": "Example", \
                             "url": "https://example.exa" }]}' \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1/funding
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/articles/<dataset-id>/funding` (`PUT`)

In contrast to @sec-api-v2-articles-funding-post, this API endpoint
can be used to *overwrite* the list of funders of the dataset
identified by `dataset-id`.

#let output = ```bash
curl --verbose --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "funders": [{ "title": "Example cases fund",
                             "grant_code": "EXA-001",
                             "funder_name": "Example",
                             "url": "https://example.exa" }]}' \
     <seshatbaseurl>/v2/account/articles/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1/funding
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/articles/<dataset-id>/funding/<funding-id>` (`DELETE`)

This API endpoint can be used to delete an funder's association with a dataset.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/funding/d50e...7500
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/categories` (`GET`) <sec-api-v2-articles-categories-get>

This API endpoint lists the categories of the dataset identified by `dataset-id`.
The identifiers for the categories can be found by using the API endpoint
described at @sec-v2-categories.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...95b1/categories | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": 13558,
    "uuid": "8f27eb44-0a63-4496-ba6d-e3cbf4efa6c7",
    "title": "Other Earth Sciences",
    "parent_id": 13551,
    "parent_uuid": "dd4dbaaf-0610-4d8d-8b07-e1eeb32dd11c",
    "path": "",
    "source_id": null,
    "taxonomy_id": null
  },
  {
    "id": 13551,
    "uuid": "dd4dbaaf-0610-4d8d-8b07-e1eeb32dd11c",
    "title": "Earth Sciences",
    "parent_id": null,
    "parent_uuid": null,
    "path": "",
    "source_id": null,
    "taxonomy_id": null
  }
]
```

=== `/v2/account/articles/<dataset-id>/categories` (`POST`) <sec-api-v2-articles-categories-post>

This API endpoint can be used to append categories to the dataset identified
by `dataset-id`. #categoriesParameters

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "categories": [13551, 13558]}' \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/categories
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/articles/<dataset-id>/categories` (`PUT`)

In contrast to @sec-api-v2-articles-categories-post, this API endpoint
can be used to *overwrite* the list of categories of the dataset identified
by `dataset-id`.

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "categories": ["dd4dbaaf-0610-4d8d-8b07-e1eeb32dd11c"]}' \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/categories
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/articles/<dataset-id>/categories/<category-id>` (`DELETE`)

This API endpoint can be used to delete a category's association with a dataset.
The `category-id` can be either the `uuid` or the `id` property.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/categories/5c61...b668
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/embargo` (`GET`)

This API endpoint lists the embargo status of the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/embargo | jq
```
#render_code_output(output)

Output of the example:
```json
{
  "is_embargoed": false,
  "embargo_date": null,
  "embargo_type": "file",
  "embargo_title": "",
  "embargo_reason": "",
  "embargo_options": []
}
```

=== `/v2/account/articles/<dataset-id>/embargo` (`DELETE`)

This API endpoint can be used to remove an embargo on the dataset
identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --verbose --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3d...995b1/embargo
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/files` (`GET`)

This API endpoint lists files associated with the dataset identified by
`dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/files | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "d112d0cd-bc15-4f8e-9013-930750fc017a",
    "name": "README.md",
    "size": 3696,
    "is_link_only": false,
    "is_incomplete": false,
    "download_url": "<seshatbaseurl>/file/d7b3...995b1/d112...c017a",
    "supplied_md5": null,
    "computed_md5": "c5b36584a0d62d28e9bf9e6892d9ebac"
  }
]
```
#render_code_output(output)

=== `/v2/account/articles/<dataset-id>/files` (`DELETE`)

#block(
  fill: luma(230),
  inset: 8pt,
  radius: 4pt,
  [*Note:* This API endpoint is a seshat extension to the original specification.]
)

This API endpoint can be used to delete all files associated with the
dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "remove_all": true }' \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/files
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/files/<file-id>` (`GET`)

This API endpoint lists files associated with the dataset identified by
`dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/files | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "d112d0cd-bc15-4f8e-9013-930750fc017a",
    "name": "README.md",
    "size": 3696,
    "is_link_only": false,
    "is_incomplete": false,
    "download_url": "<seshatbaseurl>/file/d7b3...995b1/d112...c017a",
    "supplied_md5": null,
    "computed_md5": "c5b36584a0d62d28e9bf9e6892d9ebac"
  }
]
```
#render_code_output(output)

=== `/v2/account/articles/<dataset-id>/private_links` (`GET`)

This API endpoint lists the private links associated with the dataset
identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/private_links | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": "8G2f...IJP0",
    "is_active": true,
    "expires_date": "2032-01-01T00:00:00"
  },
  {
    "id": "Hb0a...diitg",
    "is_active": true,
    "expires_date": "2026-01-01T00:00:00"
  }
]
```

=== `/v2/account/articles/<dataset-id>/private_links` (`POST`)

This API endpoint can be used to append a private link to the dataset
identified by `dataset-id`.

The following parameter can be used:

#table(
  columns: (auto, auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
  [`expires_date`], [`string`], [No], [The format of the date string should be `YYYY-MM-DD`.],
)

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --data '{ "expires_date": "2032-01-01", "read_only": false }' \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/private_links | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "location": "<seshatbaseurl>/private_datasets/8G2fk..."
}
```
#render_code_output(output)

=== `/v2/account/articles/<dataset-id>/private_links/<link-id>` (`GET`)

This API endpoint can be used to view the details of a private link for
the dataset identified by `dataset-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/private_links/8G2fk... | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": "8G2f...IJP0",
    "is_active": true,
    "expires_date": "2032-01-01T00:00:00"
  }
]
```

=== `/v2/account/articles/<dataset-id>/private_links/<link-id>` (`PUT`)

This API endpoint can be used to update the expiry date of a private link
and whether the private link is active or not for the dataset identified
by `dataset-id`.

The following parameter can be used:

#table(
  columns: (auto, auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
  [`expires_date`], [`string`],  [No], [The format of the date string should be `YYYY-MM-DD`.],
  [`is_active`],    [`boolean`], [No], [Defaults to `false`.],
)

Example usage:
#let output = ```bash
curl --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --data '{ "expires_date": "2034-01-01", "is_active": true }' \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/private_links/8G2fk... | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "location": "<seshatbaseurl>/private_datasets/8G2fk..."
}
```
#render_code_output(output)

=== `/v2/account/articles/<dataset-id>/private_links/<link-id>` (`DELETE`)

This API endpoint can be used to remove a private link for the dataset identified
by `dataset-id`.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/private_links/8G2fk...
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/articles/<dataset-id>/reserve_doi` (`POST`)

This API endpoint can be used to obtain the DOI before the dataset is
published and the DOI is activated.

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/reserve_doi | jq
```
#render_code_output(output)

Output of the example:
```json
{
  "doi": "10.5074/d7b3daa5-45e2-47b0-9910-0f7fa6a995b1"
}
```

=== `/v2/account/articles/<dataset-id>/publish` (`POST`)

This API endpoint can be used to publish the dataset identified by
`dataset-id`.

#block(
  fill: luma(230),
  inset: 8pt,
  radius: 4pt,
  [*Note:* Only users with the "review" privilege can succesfully use this API call.]
)

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/articles/d7b3...995b1/publish | jq
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 201 CREATED
```

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "location": "<seshatbaseurl>/review/published/9ce6...3976"
}
```
#render_code_output(output)

== Creating and editing collections

=== `/v2/account/collections` (`GET`)

This API endpoint lists the draft collections of the account to which the
authorization token belongs.

The following parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  ..pagingOptions("dataset").flatten(),
  [`order`],           [Optional], [Field to use for sorting.],
  [`order_direction`], [Optional], [Can be either `asc` or `desc`.],
)

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* This example output has been shortened. */
  {
    "id": null,
    "uuid": "fc03a4c3-cba4-4a88-a8a6-eb38924eeb6d",
    "title": "Test collection",
    "doi": null,
    "handle": "",
    "url": "<seshatbaseurl>/v2/collections/fc03...eb6d",
    "published_date": null,
    ...
  }
]
```
#render_code_output(output)

=== `/v2/account/collections` (`POST`)

This API endpoint can be used to create a new collection.

The following parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Description*]),
  [`title`],               [`string`],                       [The title of the collection.],
  [`description`],         [`string`],                       [A description of the collection.],
  [`tags`],                [list of `string`s],              [#tagsDescription("collection")],
  [`keywords`],            [list of `string`s],              [See `tags`.],
  [`references`],          [list of `string`s],              [URLs to resources referring to this collection, or resources that this collection refers to.],
  [`categories`],          [list of `string`s],              [#categoryDescription],
  [`authors`],             [list of author records],         [],
  [`funding`],             [`string`],                       [One-liner to cite funding.],
  [`funding_list`],        [list of funding records],        [],
  [`license`],             [`integer`],                      [#licenseDescription("collection")],
  [`doi`],                 [`string`],                       [#doiDescription],
  [`handle`],              [`string`],                       [Do not use this field as it is deprecated.],
  [`resource_doi`],        [`string`],                       [#resourceDoiDescription],
  [`resource_title`],      [`string`],                       [#resourceTitleDescription],
  [`custom_fields`],       [`Object`],                       [#customFieldsDescription],
  [`custom_fields_list`],  [list of `Object`s],              [#customFieldsListDescription],
  [`timeline`],            [],                               [#timelineDescription],
  [`articles`],            [list of strings or integers],    [The articles to include in the collection.],
)

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "title": "Example collection" }' \
     <seshatbaseurl>/v2/account/collections | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{
  "location": "<seshatbaseurl>/v2/account/collections/08b7...cfa8",
  "warnings": []
}
```
#render_code_output(output)

=== `/v2/account/collections/<collection-id>` (`GET`) <sec-v2-collections-collection-id>

This API endpoint lists details of the collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/08b7...cfa8 | jq
```
#render_code_output(output)

Output of the example:
```json
{ /* Example output has been shortened. */
  "articles_count": 0,
  "authors": [],
  "id": null,
  "uuid": "08b702d6-98a0-4081-9445-5aeae720cfa8",
  "title": "Example collection",
  ...
}
```

=== `/v2/account/collections/<collection-id>` (`PUT`)

This API endpoint can be used to update the metadata of the collection
identified by `collection-id`.

The following parameters can be used:

#table(
  columns: (auto, auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
  [`title`],          [`string`],           [Yes], [The title of the collection.],
  [`description`],    [`string`],           [No],  [A description of the collection.],
  [`resource_doi`],   [`string`],           [No],  [#resourceDoiDescription],
  [`resource_title`], [`string`],           [No],  [#resourceTitleDescription],
  [`group_id`],       [`integer`],          [No],  [],
  [`time_coverage`],  [`string`],           [No],  [Free-text field to describe the time coverage of the collection.],
  [`publisher`],      [`string`],           [No],  [The name of the data repository publishing the collection.],
  [`language`],       [`string`],           [No],  [An ISO 639-1 language code.],
  [`contributors`],   [`string`],           [No],  [Free-text field to indicate contributors to the collection other than direct authors.],
  [`geolocation`],    [`string`],           [No],  [Free-text field to specify a location.],
  [`longitude`],      [`string`],           [No],  [The longitude coordinate of the location.],
  [`latitude`],       [`string`],           [No],  [The latitude coordinate of the location.],
  [`organizations`],  [`string`],           [No],  [Free-text field to specify organizations that contributed or are associated with the collection.],
  [`categories`],     [list of `string`s],  [No],  [#categoryDescription],
)

Example usage:
#let output = ```bash
curl --verbose --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "title": "Updated title" }' \
     <seshatbaseurl>/v2/account/collections/08b702d6-98a0-4081-9445-5aeae720cfa8 | jq
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>` (`DELETE`)

This API endpoint can be used to delete a draft collection.

Example usage:
#let output = ```bash
curl --verbose --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/08b702d6-98a0-4081-9445-5aeae720cfa8
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/collections/search` (`POST`)

This API call searches for collections, including drafts created
by the account performing the search.

#searchParameters

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "search_for": "Example" }' \
     <seshatbaseurl>/v2/account/collections/search | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
[ /* Example output has been shortened. */
  {
    "id": null,
    "uuid": "08b702d6-98a0-4081-9445-5aeae720cfa8",
    "title": "Example collection",
    "url": <seshatbaseurl>/v2/collections/08b7...cfa8
    ...
  }
]
```
#render_code_output(output)

=== `/v2/account/collections/<collection-id>/authors` (`GET`) <sec-api-v2-collections-authors>

Similar to @sec-api-v2-articles-authors, this API endpoint lists the
authors of the collection identified by `collection-id`.
The following URL parameters can be used:

#table(
  columns: (auto, auto, 1fr),
  table.header([*Parameter*], [*Required*], [*Description*]),
  [`order`],           [Optional], [Field to use for sorting.],
  [`order_direction`], [Optional], [Can be either `asc` or `desc`.],
  [`limit`],           [Optional], [The maximum number of datasets to output. Used together with `offset`.],
)

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/3760c457-d4f3-4d58-8b94-af089a97a9b4 | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": null,
    "uuid": "08f4d496-67b5-4b7c-b2d2-923458d1f450",
    "full_name": "John Doe Jr",
    "is_active": false,
    "url_name": null,
    "orcid_id": ""
  },
  {
    "id": null,
    "uuid": "6815031c-21dc-4873-93c9-f6539da482ce",
    "full_name": "John Doe",
    "is_active": false,
    "url_name": null,
    "orcid_id": ""
  }
]
```

=== `/v2/account/collections/<collection-id>/authors` (`POST`) <sec-api-v2-collections-authors-post>

Similar to @sec-api-v2-articles-authors-post, this API endpoint can
be used to append authors to the collection identified by `collection-id`.

#authorParameters

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe" }]}' \
     <seshatbaseurl>/v2/account/collections/3760c457-d4f3-4d58-8b94-af089a97a9b4/authors
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe Jr" }]}' \
     <seshatbaseurl>/v2/account/collections/3760c457-d4f3-4d58-8b94-af089a97a9b4/authors
```
#render_code_output(output)

The following is an example of the output of the HTTP `POST` calls:
```
HTTP/1.1 205 RESET CONTENT
```

An example of the output of the HTTP `GET` call can be found in @sec-api-v2-collections-authors.

=== `/v2/account/collections/<collection-id>/authors` (`PUT`)

In contrast to @sec-api-v2-collections-authors-post, this API endpoint
can be used to *overwrite* the list of authors of the collection identified
by `collection-id`.

Example usage:
#let output = ```bash
curl --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe" }]}' \
     <seshatbaseurl>/v2/account/collections/3760c457-d4f3-4d58-8b94-af089a97a9b4/authors

curl --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "authors": [{ "name": "John Doe Jr" }]}' \
     <seshatbaseurl>/v2/account/collections/3760c457-d4f3-4d58-8b94-af089a97a9b4/authors

curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/3760c457-d4f3-4d58-8b94-af089a97a9b4/authors | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": null,
    "uuid": "61751fe3-53a1-477f-a46f-e534cbd0b618",
    "full_name": "John Doe Jr",
    "is_active": false,
    "url_name": null,
    "orcid_id": ""
  },
]
```

=== `/v2/account/collections/<collection-id>/authors/<author-id>` (`DELETE`)

This API endpoint can be used to delete an author's association with a collection.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d//authors/5c75...94aa
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/collections/<collection-id>/categories` (`GET`)

This API endpoint can be used to retrieve the categories associated with
the collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/categories | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": 13376,
    "uuid": "2bdba8f2-5914-4d82-bfe8-c938cccab71f",
    "title": "Agricultural and Veterinary Sciences",
    "parent_id": null,
    "parent_uuid": null,
    "path": "",
    "source_id": null,
    "taxonomy_id": null
  }
]
```

=== `/v2/account/collections/<collection-id>/categories` (`POST`) <sec-api-v2-collections-categories-post>

Similar to @sec-api-v2-articles-categories-post this API endpoint can be
used to append categories to the collection identified by `collection-id`.
#categoriesParameters

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "categories": [13551, 13558]}' \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/categories
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>/categories` (`PUT`)

In contrast to @sec-api-v2-collections-categories-post, this API endpoint
can be used to *overwrite* the list of categories of the collection identified
by `collection-id`.

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "categories": ["dd4dbaaf-0610-4d8d-8b07-e1eeb32dd11c"]}' \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/categories
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>/categories/<category-id>` (`DELETE`)

This API endpoint can be used to delete a category's association with a collection.
The `category-id` can be either the `uuid` or the `id` property.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/categories/13558
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/collections/<collection-id>/articles` (`GET`)

This API endpoint can be used to retrieve the datasets associated with
the collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/articles | jq
```
#render_code_output(output)

Output of the example:
```json
[ /* This example has been shortened. */
  {
    "id": null,
    "uuid": "8050f9cb-d0b0-4149-bd24-02f13c2410db",
    "doi": "10.4121/8050f9cb-d0b0-4149-bd24-02f13c2410db.v1",
    ...
  },
  {
    "id": 14309234,
    "uuid": "06431360-776c-45c6-bcca-ec898f2870ff",
    "doi": "10.4121/14309234.v1",
    ...
  }
]
```

=== `/v2/account/collections/<collection-id>/articles` (`POST`) <sec-v2-account-collection-articles>

This API endpoint can be used to append datasets to the collection identified
by `collection-id`. The API endpoint accepts both the `id` property
and the `uuid` property of a dataset as identifier.

The parameters sent to the server should be a JSON object with a single key
named `articles`, with as value a list of either the `id` or the `uuid`
identifiers for datasets. The API endpoint described in
@sec-api-v2-articles-search-post shows how to obtain the dataset
identifiers.

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --data '{ "articles": ["8050...10db", 14309234 ]}' \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/articles
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>/articles` (`PUT`)

In contrast to @sec-v2-account-collection-articles, this API endpoint
can be used to *overwrite* the list of datasets associated with a
collection.

#let output = ```bash
curl --verbose --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --header "Accept: application/json" \
     --data '{ "articles": [ 14309234 ]}' \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/articles
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>/articles/<dataset-id>` (`DELETE`)

This API endpoint can be used to delete a dataset's association with a collection.
The `dataset-id` can be either the `uuid` or the `id` property.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/articles/8050...10db
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/collections/<collection-id>/private_links` (`GET`)

This API endpoint lists the private links associated with the collection
identified by `collection-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/f000...3c16/private_links | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": "xk84wQ0Vxn5Xf44cAjPlg4Bjw-sbrHoia_SgboWF6eo",
    "is_active": true,
    "expires_date": null
  },
  {
    "id": "EYgjp5RGul2maCblF6Mlx0lfFombnPLLYniTS7hLD2E",
    "is_active": true,
    "expires_date": "2027-01-01T00:00:00"
  }
]
```

=== `/v2/account/collections/<collection-id>/private_links` (`POST`)

This API endpoint can be used to append a private link to the collection
identified by `collection-id`.

The following parameter can be used:

#table(
  columns: (auto, auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
  [`expires_date`], [`string`], [No], [The format of the date string should be `YYYY-MM-DD`.],
)

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --data '{ "expires_date": "2032-01-01", "read_only": false }' \
     <seshatbaseurl>/v2/account/collections/f000...3c16/private_links | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "location": "<seshatbaseurl>/private_collections/Jk2I..."
}
```
#render_code_output(output)

=== `/v2/account/collections/<collection-id>/private_links/<link-id>` (`GET`)

This API endpoint can be used to view the details of a private link for
the collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/f000...3c16/private_links/Jk2I... | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": "Jk2Iw1cOKqQ0EJbx01feLKcJOukIcBCDJ20HFbe9F8g",
    "is_active": true,
    "expires_date": "2032-01-01T00:00:00"
  }
]
```

=== `/v2/account/collections/<collection-id>/private_links/<link-id>` (`PUT`)

This API endpoint can be used to update the expiry date of a private link
and whether the private link is active or not for the collection identified
by `collection-id`.

The following parameter can be used:

#table(
  columns: (auto, auto, auto, 1fr),
  table.header([*Parameter*], [*Data type*], [*Required*], [*Description*]),
  [`expires_date`], [`string`],  [No], [The format of the date string should be `YYYY-MM-DD`.],
  [`is_active`],    [`boolean`], [No], [Defaults to `false`.],
)

Example usage:
#let output = ```bash
curl --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --data '{ "expires_date": "2034-01-01", "is_active": true }' \
     <seshatbaseurl>/v2/account/collections/f000...3c16/private_links/Jk2I... | jq
```
#render_code_output(output)

Output of the example:
#let output = ```json
{ /* Example output has been shortened. */
  "location": "<seshatbaseurl>/private_collections/Jk2I..."
}
```
#render_code_output(output)

=== `/v2/account/collections/<collection-id>/private_links/<link-id>` (`DELETE`)

This API endpoint can be used to remove a private link for the collection identified
by `collection-id`.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/f000...3c16/private_links/Jk2I...
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```

=== `/v2/account/collections/<collection-id>/reserve_doi` (`POST`)

This API endpoint can be used to obtain the DOI before the collection is
published and the DOI is activated.

Example usage:
#let output = ```bash
curl --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/reserve_doi | jq
```
#render_code_output(output)

Output of the example:
```json
{
  "doi": "10.5074/fc03a4c3-cba4-4a88-a8a6-eb38924eeb6d"
}
```

=== `/v2/account/collections/<collection-id>/funding` (`GET`)

This API endpoint lists the funding of the collection identified by `collection-id`.

Example usage:
#let output = ```bash
curl --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/funding | jq
```
#render_code_output(output)

Output of the example:
```json
[
  {
    "id": null,
    "uuid": "6f605fe1-e87a-43f5-8b67-70ebe3f9b868",
    "title": "Example cases fund",
    "grant_code": "EXA-001",
    "funder_name": "Example",
    "is_user_defined": null,
    "url": "https://example.exa"
  }
]
```

=== `/v2/account/collections/<collection-id>/funding` (`POST`) <sec-api-v2-collections-funding-post>

This API endpoint can be used to append funders to the collection identified
by `collection-id`.

#fundingParameters

Example usage:
#let output = ```bash
curl --verbose --request POST \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "funders": [{ "title": "Example cases fund", \
                             "grant_code": "EXA-001", \
                             "funder_name": "Example", \
                             "url": "https://example.exa" }]}' \
     <seshatbaseurl>/v2/account/collections/fc03a4c3-cba4-4a88-a8a6-eb38924eeb6d/funding
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>/funding` (`PUT`)

In contrast to @sec-api-v2-collections-funding-post, this API endpoint
can be used to *overwrite* the list of funders of the collection
identified by `collection-id`.

#let output = ```bash
curl --verbose --request PUT \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     --header "Content-Type: application/json" \
     --data '{ "funders": [{ "title": "Example cases fund",
                             "grant_code": "EXA-001",
                             "funder_name": "Example",
                             "url": "https://example.exa" }]}' \
     <seshatbaseurl>/v2/account/collections/fc03a4c3-cba4-4a88-a8a6-eb38924eeb6d/funding
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 205 RESET CONTENT
```

=== `/v2/account/collections/<collection-id>/funding/<funding-id>` (`DELETE`)

This API endpoint can be used to delete an funder's association with a collection.

Example usage:
#let output = ```bash
curl --request DELETE \
     --header "Authorization: token YOUR_TOKEN_HERE" \
     <seshatbaseurl>/v2/account/collections/fc03...eb6d/funding/9b43...e6cd
```
#render_code_output(output)

HTTP response of the example:
```
HTTP/1.1 204 NO CONTENT
```
]

#render_chapter(chapter_text, "Application Programming Interface")
