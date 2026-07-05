#import "config.typ": *

#let chapter_text = [
= Running your own instance <running-your-own-instance>

== Building from the source code

Building software from its source code makes it easier to modify it afterwards.
The remainder of this section will go over this process.  If you prefer pre-built
packages, skip ahead to @pre-built-packages.

=== Obtaining the source code <sec-obtaining-tarball>

The source code can be downloaded at the
#link(seshatgiturl + "/releases")[Releases]#footnote(seshatgiturl + "/releases")
page. Make sure to download the #raw("seshat-" + seshatversion + ".tar.gz") file.

Or, directly download the tarball using the command-line:

#let output = ```bash
curl -LO <seshatgiturl>/releases/download/v<seshatversion>/seshat-<seshatversion>.tar.gz
```
#render_code_output(output)

After obtaining the tarball, it can be unpacked using the `tar` command:

#let output = ```bash
tar zxvf seshat-<seshatversion>.tar.gz
```
#render_code_output(output)

=== Installing the prerequisites <sec-prerequisites>

The `seshat` program needs Python (version 3.9 or higher) and
Git to be installed. Additionally, a couple of Python packages need
to be installed. The following sections describe installing the
prerequisites on various GNU/Linux distributions. To put the software in
the context of its environment, @fig-references-graph displays
the complete run-time dependencies from `seshat` to `glibc`.

#figure(
  image("figures/references-graph.svg"),
  caption: [Run-time references when constructed with the packages from GNU Guix.],
) <fig-references-graph>

The web service of `seshat` stores its information in a SPARQL 1.1
@sparql-11 endpoint. We recommend either
#link("https://blazegraph.com/")[Blazegraph]#footnote("https://blazegraph.com/")
or #link("http://vos.openlinksw.com/owiki/wiki/VOS")[Virtuoso open-source edition]#footnote("http://vos.openlinksw.com/owiki/wiki/VOS").

==== Optional installation requirements depending on configuration

For specific features `seshat` may require additional packages to be
installed. Whether this is the case depends on the run-time configuration.
When an optional package is required `seshat` will report which one in
its logs. There are three configuration scenarios that require the
additional packages: SAML, S3 and IIIF.

===== SAML

When configuring the use of an identity provider via SAML `seshat`
requires the `python3-saml` Python package to be installed. This
package provides the implementation of the SAML protocol.

===== S3

When configuring file access in S3 buckets `seshat` requires the
`boto3` Python package to be installed. This package is used to
authenticate to the S3 endpoints and to download (or stream) data.

===== IIIF

When enabling the IIIF functionality `seshat` requires the
`pyvips` Python package to be installed. This package is used to
perform image transformations.

=== Installation instructions

After obtaining the source code (see @sec-obtaining-tarball)
and installing the required tools (see @sec-prerequisites),
building involves running the following commands:

#let output = ```bash
cd seshat-<seshatversion>
autoreconf -vif # Only needed if the "./configure" step does not work.
./configure
make
make install
```
#render_code_output(output)

To run the `make install` command, super user privileges may be
required. Specify a `--prefix` to the `configure`
script to install the tools to a user-writeable location to avoid
needing super user privileges.

After installation, the `seshat` program will be available.


== Using pre-compiled packages <pre-built-packages>

=== RPM packages

RPM packages are provided and built for Enterprise Linux 10. This
RPM depends on packages in the
#link("https://docs.fedoraproject.org/en-US/epel")[Extra Packages for Enterprise Linux (EPEL)]
repository.

#table(
  columns: (auto, 1fr),
  table.header([*Filename*], [*Description*]),
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat-" +
           seshatversion + "-1.el10.noarch.rpm")[seshat-#(seshatversion)-1.el10.noarch.rpm]],
  [Binary RPM, to install and run `seshat`.],
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat-" +
           seshatversion + "-1.el10.src.rpm")[seshat-#(seshatversion)-1.el10.src.rpm]],
  [Source RPM, to (re)build from source code.],
)

RPM packages for more distributions, including Enterprise Linux 9, are
#link("https://copr.fedorainfracloud.org/coprs/seshat/seshat")[built via Copr].

=== Debian packages

A Debian package is provided and built for Debian 13.
#table(
  columns: (auto, 1fr),
  table.header([*Filename*], [*Description*]),
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat_" +
           seshatversion + "-1_all.deb")[seshat\_#(seshatversion)-1\_all\.deb]],
    [Binary DEB, to install and run `seshat`.],
)

== Using container images <container-images>

=== Production-grade containers

Container images are published based on the Debian distribution and the
`seshat` package for Debian.  This means that the dependencies of `seshat` are
installed through Debian's distribution instead of PyPI.

Container images are provided through the `seshat.software` registry.  The image
is built using the Dockerfile in `docker/release-build`.

The OCI image can be `pull`ed using:
```bash
docker pull seshat.software/seshat:latest
```

=== Development containers

A container image that tracks the latest Git commit and installs dependencies
directly from PyPI can be built using:
```
make dist-docker-dev
```

The image will be built using the Dockerfile in `docker/development-build`.
To customize more, including changing the upstream Git URL, look at the
`dist-docker-dev` in `Makefile.am`.

== Configuring `seshat` <configuring-seshat>

Now that `seshat` is installed, it's a good moment to look into its
run-time configuration options. All configuration can be done through a
configuration file, for which an example is available at `etc/seshat.xml`.

=== Essential options <sec-essential-options>

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`bind-address`],           [The address to bind a TCP socket on.],
  [`port`],                   [The port to bind a TCP socket on.],
  [`alternative-port`],       [A fall-back port to bind on when `port` is already in use.],
  [`base-url`],               [The URL on which the instance will be available to the outside world.],
  [`documentation-url`],      [The URL on which the documentation will be available to the outside world.],
  [`ontology-url`],           [The URL for the internal ontology.],
  [`allow-crawlers`],         [Set to 1 to allow crawlers in the `robots.txt`, otherwise set to 0.],
  [`production`],             [Performs extra checks before starting. Enable this when running a production instance.],
  [`live-reload`],            [When set to 1, it reloads Python code on-the-fly. We recommend to set it to 0 when running in production.],
  [`debug-mode`],             [When set to 1, it will display backtraces and error messages in the web browser. When set to 0, it won't.],
  [`use-x-forwarded-for`],    [When running `seshat` behind a reverse-proxy server, use the HTTP header `X-Forwarded-For` to log IP address information. Set to 1 when `seshat` should use the `X-Forwarded-For` HTTP header.],
  [`static-resources-cache`], [When running `seshat` behind a reverse-proxy server, it can write images, fonts, stylesheets and JavaScript resources to a folder so it can be served by the reverse-proxy server. Specify a filesystem directory to store the resources at.],
  [`disable-collaboration`],  [When set to 1, it disables the "collaborators" feature.],
  [`allowed-depositing-domains`], [When unset, any authenticated user may deposit data. Otherwise, this option limits the ability to deposit to users with an e-mail address of the listed domain names.],
  [`cache-root`],             [`seshat` can cache query responses to lower the load on the database server. Specify the directory where to store cache files. This element takes an attribute `clear-on-start`, and when set to 1, it will remove all cache files on start-up of `seshat`.],
  [`profile-images-root`],    [Users can upload a profile image in `seshat`. This option should point to a filesystem directory where these profile images can be stored.],
  [`disable-2fa`],            [Accounts with privileges receive a code by e-mail as a second factor when logging in. Setting this option to 1 disables the second factor authentication.],
  [`disable-account-creation`], [When set to 1, new accounts cannot be created, effectively disabling new users from signing up. The default is 0.],
  [`sandbox-message`],        [Display a message on the top of every page.],
  [`notice-message`],         [Display a message on the main page.],
  [`maintenance-mode`],       [When set to 1, all HTTP requests result in the displayment of a maintenance message. Use this option while backing up the database, or when performing major updates.],
)

=== Configuring the Database

The `seshat` program stores its state in a SPARQL 1.1 compliant
RDF store. Configuring the connection details is done in the
`rdf-store` node.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`state-graph`],   [The graph name to store triplets in.],
  [`sparql-uri`],    [The URI at which the SPARQL 1.1 endpoint can be reached.

    When the `sparql-uri` begins with `bdb://`, followed by a path to a
    filesystem directory, it will use the BerkeleyDB back-end, for which
    the `berkeleydb` Python package needs to be installed.],
  [`sparql-update-uri`], [The URI at which the SPARQL 1.1 Update endpoint can be reached (in case it is different from the `sparql-uri`).],
  [`seconds-to-wait-for-online`], [Number of seconds to retry in case the SPARQL endpoint is down when initializing. A retry is done every second, and after the configured amount, `seshat` will give up.],
  [`read-only-mode`], [When set to `1`, no queries that change the state of the database shall be made. This is useful for running secondary instances to balance the load of specific endpoints. Defaults to `0`.],
)

=== Audit trails and database reconstruction

The `seshat` program can keep an audit log of all database modifications
made by itself from which a database state can be reconstructed. Whether
`seshat` keeps such an audit log can be configured with the
`enable-query-audit-log` configuration option.

The database can receive a large amount of requests due to inserting log
entries to calculate views and downloads statistics from. The configuration
option `delay-inserting-log-entries` can be used to prevent these queries
from being sent to the database server. To maintain accurate statistics, these
log entry queries must be replayed in due time.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`delay-inserting-log-entries`], [When set to 1, it writes the `INSERT` queries for log entries only to the audit log, rather than executing them on the SPARQL endpoint.],
  [`enable-query-audit-log`], [When set to 1, it writes every SPARQL query that modifies the database in the web logs. This can be replayed to reconstruct the database at a later time. Setting this option to 0 disables this feature. This element takes an attribute `transactions-directory` that should specify an empty directory to which transactions can be written that are extracted from the audit log.],
)

==== Reconstructing the database from the query audit log

Each query that modifies the database state while the query audit logs
are enabled can be extracted from the query audit log using the
`--extract-transactions-from-log` command-line option. A timestamp to
specify the starting point to extract from can be specified as an argument.
The following example displays its use:

```bash
seshat web --config-file=config.xml --extract-transactions-from-log="YYYY-MM-DD HH:MM:SS"
```

This will create a file for each query in the folder specified in the
`transactions-directory` attribute.

To replay the extracted transactions, use the `--apply-transactions`
command-line option:

```bash
seshat web --config-file=config.xml --apply-transactions
```

When a query cannot be executed, the command stops, allowing to fix or
remove the query to-be-replayed. Invoking the `--apply-transactions`
command a second time will continue replaying where the previous run stopped.

If the `delay-inserting-log-entries` configuration option is set to 1,
use the `--extract-delayed-transactions-from-log` command-line option to
write the log entries queries to the transactions-directory. Then
re-run `--apply-transactions` to apply the log entries queries.

=== Configuring storage

Storage locations can be configured with the `storage` node.
When configuring multiple locations, `seshat` attempts to find a
file by looking at the first configured location, and in case it cannot
find the file there, it will look at the second configured location,
and so on, until it has tried each storage location.

This allows for moving files between storage systems transparently
without requiring specific interactions with `seshat` other than
having the files made available as a POSIX filesystem or in an S3 bucket.

One use-case that suits this mechanism is letting uploads write to
fast online storage and later move the uploaded files to a slower but
less costly storage.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`location`],  [A filesystem path to where files are stored. This is a repeatable property.],
  [`s3-bucket`], [An S3 bucket configuration. See @sec-s3-buckets. This is a repeatable property.],
)

==== Configuring S3 buckets <sec-s3-buckets>

Other than configuring storage locations on a POSIX filesystem,
`seshat` can be configured to serve files from an S3 bucket.
To do so, the following parameters must be configured within a
`s3-bucket` node.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`endpoint`],   [Endpoint URL to connect to.],
  [`name`],       [Name of the bucket.],
  [`key-id`],     [Key ID for the bucket.],
  [`secret-key`], [Secret key for the bucket.],
)

For example, configuring one filesystem location and one S3 bucket
as storage locations looks as following:

```xml
<storage>
  <location>/data</location>
  <s3-bucket>
    <endpoint>https://some.example</endpoint>
    <name>example-bucket</name>
    <key-id>...</key-id>
    <secret-key>...</secret-key>
  </s3-bucket>
</storage>
```

There are a few scenarios in which `seshat` downloads an S3 object
to perform some operation on: creating thumbnails and IIIF image
transformations. To direct where these temporary files will be stored,
the `s3-cache-root` can be configured.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`s3-cache-root`], [The directory to store the S3 objects while performing some operation on the objects. This option can only be configured globally and applies to all S3 buckets.],
)

=== Configuring an identity provider

Ideally, `seshat` makes use of an external identity provider.
`seshat` can use SAML2.0, ORCID, or an internal identity provider
(for testing and development purposes only).

This section will outline the configuration options for each
identity provision mechanism.

==== SAML2.0

For SAML 2.0, the configuration can be placed in the `saml`
section under `authentication`. That looks as following:

```xml
<authentication>
  <saml version="2.0">
    <!-- Configuration goes here. -->
  </saml>
</authentication>
```

The options outlined in the remainder of this section should be placed
where the example shows `<!-- Configuration goes here. -->`.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`strict`],            [When set to 1, SAML responses must be signed. *Never disable 'strict' mode in a production environment.*],
  [`debug`],             [Increases logging verbosity for SAML-related messages.],
  [`attributes`],        [In this section the attributes provided by the identity provider can be aligned to the attributes `seshat` expects.],
  [`service-provider`],  [The `seshat` program fulfills the role of service provider. In this section the certificate and service provider metadata can be configured.],
  [`identity-provider`], [In this section the certificate and single-sign-on URL of the identity provider can be configured.],
  [`sram`],              [In this section, SURF Research Access Management-specific attributes can be configured.],
)

===== The `attributes` configuration

To create account and author records and to authenticate a user, `seshat`
stores information provided by the identity provider. Each identity provider
may provide this information using different attributes. Therefore, the
translation from attributes used by `seshat` and attributes given by the
identity provider can be configured. The following attributes must be
configured.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`first-name`],    [A user's first name.],
  [`last-name`],     [A user's last name.],
  [`common-name`],   [A user's full name.],
  [`email`],         [A user's e-mail address.],
  [`groups`],        [The attribute denoting groups.],
  [`group-prefix`],  [The prefix for each group short name.],
)

As an example, the attributes configuration for SURFConext looks like this:

```xml
<attributes>
  <first-name>urn:mace:dir:attribute-def:givenName</first-name>
  <last-name>urn:mace:dir:attribute-def:sn</last-name>
  <common-name>urn:mace:dir:attribute-def:cn</common-name>
  <email>urn:mace:dir:attribute-def:mail</email>
</attributes>
```

And for SURF Research Access Management (SRAM), the attributes configuration
looks like this:

```xml
<attributes>
  <first-name>urn:oid:2.5.4.42</first-name>
  <last-name>urn:oid:2.5.4.4</last-name>
  <common-name>urn:oid:2.5.4.3</common-name>
  <email>urn:oid:0.9.2342.19200300.100.1.3</email>
  <groups>urn:oid:1.3.6.1.4.1.5923.1.1.1.7</groups>
  <group-prefix>urn:mace:surf.nl:sram:group:[organisation]:[service]</group-prefix>
</attributes>
```

===== The `sram` configuration

When using SURF Research Access Management (SRAM),
`seshat` can persuade SRAM to send an invitation to anyone
inside or outside the institution to join the SRAM collaboration
that provides access to the `seshat` instance. To do so,
the following attributes must be configured.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`organization-api-token`], [An organization-level API token.],
  [`collaboration-id`],       [The UUID of the collaboration to invite users to.],
)

===== The `service-provider` configuration

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`x509-certificate`],           [Contents of the public certificate without whitespacing.],
  [`private-key`],                [Contents of the private key belonging to the `x509-certificate` to sign messages with.],
  [`metadata`],                   [This section contains metadata that may be displayed by the identity provider to users before authorizing them.],
  [`  display-name`],        [The name to be displayed by the identity provider when authorizing the user to the service.],
  [`  url`],                 [The URL to the service.],
  [`  description`],         [Textual description of the service.],
  [`  organization`],        [This section contains metadata to describe the organization behind the service.],
  [`    name`],                [The name of the service provider's organization.],
  [`    url`],                 [The URL to the web page of the organization.],
  [`  contact`],             [A repeatable section to list contact persons and their roles within the organization. The role can be configured by setting the `type` attribute.],
  [`    first-name`],          [The first name of the contact person.],
  [`    last-name`],           [The last name of the contact person.],
  [`    email`],               [The e-mail address of the contact person. Note that some identity providers prefer functional e-mail addresses (e.g. support\@... instead of jdoe\@...).],
)

==== ORCID

#link("https://orcid.org")[ORCID.org] plays a key role in making researchers
findable. Its identity provider service can be used by `seshat` in two ways:

+ As primary identity provider to log in and deposit data;
+ As additional identity provider to couple an author record to its ORCID record.

When another identity provider is configured in addition to ORCID, that
identity provider will be used as primary and ORCID will only be used to
couple author records to the author's ORCID record.

To configure ORCID, the configuration can be placed in the `orcid`
section under `authentication`. That looks as following:

```xml
<authentication>
  <orcid>
    <!-- Configuration goes here. -->
  </orcid>
</authentication>
```

Then the following parameters can be configured:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`client-id`],     [The client ID provided by ORCID.],
  [`client-secret`], [The client secret provided by ORCID.],
  [`endpoint`],      [The URL to the ORCID endpoint to use.],
)

=== Configuring an e-mail server

On various occasions, `seshat` will attempt to send an e-mail to either
an author, a reviewer or an administrator. To be able to do so, an e-mail
server must be configured from which the instance may send e-mails.

The configuration is done under the `email` node, and the following
items can be configured:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`server`],          [Address of the e-mail server without protocol specification.],
  [`port`],            [The port the e-mail server operates on.],
  [`starttls`],        [When 1, `seshat` attempts to use StartTLS.],
  [`username`],        [The username to authenticate with to the e-mail server.],
  [`password`],        [The password to authenticate with to the e-mail server.],
  [`from`],            [The e-mail address used to send e-mail from.],
  [`subject-prefix`],  [Text to prefix in the subject of all e-mails sent from the instance of `seshat`. This can be used to distinguish a test instance from a production instance.],
)

=== Configuring DOI registration

When publishing a dataset or collection, `seshat` can register a
persistent identifier with DataCite. To enable this feature, configure it
under the `datacite` node. The following parameters can be configured:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`api-url`],        [The URL of the API endpoint of DataCite.],
  [`repository-id`],  [The repository identifier given by DataCite.],
  [`password`],       [The password to authenticate with to DataCite.],
  [`prefix`],         [The DOI prefix to use when registering a DOI.],
)

=== Configuring Handle registration

Each uploaded file can be assigned a persistent identifier using the Handle
system. To enable this feature, configure it under the `handle` node.
The following parameters can be configured:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`url`],          [The URL of the API endpoint of the Handle system implementor.],
  [`certificate`],  [Certificate to use for authenticating to the endpoint.],
  [`private-key`],  [The private key paired with the certificate used to authenticate to the endpoint.],
  [`prefix`],       [The Handle prefix to use when registering a handle.],
  [`index`],        [The index to use when registering a handle.],
)

=== Configuring IIIF support

When publishing images, `seshat` can enable the IIIF Image API for the
images. It uses `libvips` and `pyvips` under the hood to perform image
manipulation. The following parameters can be configured:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`enable-iiif`],      [Enable support for the IIIF image API. This requires the `pyvips` package to be available in the run-time environment.],
  [`iiif-cache-root`],  [The directory to store the output of IIIF Image API requests to avoid re-computing the image.],
)

=== Configuring OCI registry support

`seshat` has built-in support for the OCI registry v2 API.  The following
configuration options are available:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`enable-oci-registry`], [Enable the built-in OCI registry (defaults to `0`).],
  [`oci-registry-root`],   [The directory to store the container images in.],
)

=== Customizing looks

With the following options, the instance can be branded as necessary.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`site-name`],               [Name for the instance used in the title of a browser window and as default value in the publisher field for new datasets.],
  [`site-description`],        [Description used as a meta-tag in the HTML output.],
  [`site-shorttag`],           [Used as keyword and as Git remote name.],
  [`ror-url`],                 [The ROR URL for this instance's organization.],
  [`support-email-address`],   [E-mail address used in e-mails sent to users in automated messages.],
  [`custom-logo-path`],        [Path to a PNG image file that will be used as logo on the website.],
  [`custom-favicon-path`],     [Path to an ICO file that will be used as favicon.],
  [`small-footer`],            [HTML that will be used as footer for all pages except for the main page.],
  [`large-footer`],            [HTML that will be used as footer on the main page.],
  [`show-portal-summary`],     [When set to 1, it shows the repository summary of number of datasets, authors, collections, files and bytes on the main page.],
  [`show-latest-datasets`],    [When set to 1, it shows the list of latest published datasets on the main page.],
  [`colors`],                  [Colors used in the HTML output. See @sec-customize-colors.],
)

==== Customizing colors <sec-customize-colors>

The following options can be configured in the `colors` section.

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`primary-color`],            [The main background color to use.],
  [`primary-foreground-color`], [The main foreground color to use.],
  [`primary-color-hover`],      [Color to use when hovering a link.],
  [`primary-color-active`],     [Color to use when a link is clicked.],
  [`privilege-button-color`],   [The background color of buttons for privileged actions.],
  [`footer-background-color`],  [Color to use in the footer.],
  [`background-color`],         [Background color for the content section.],
)

=== Configuring privileged users

By default an authenticated user may deposit data. But users can have
additional roles; for example: a dataset reviewer, a technical
administrator or a quota reviewer.

Such additional roles are configured in terms of privileges. The
following privileges can be configured in the `privileges` section:

#table(
  columns: (auto, 1fr),
  table.header([*Option*], [*Description*]),
  [`may-administer`],                  [Allows access to perform maintenance tasks, view accounts and view reports on restricted and embargoed datasets.],
  [`may-run-sparql-queries`],          [Allows to run arbitrary SPARQL queries on the database.],
  [`may-impersonate`],                 [Allows to log in to any account and therefore perform any action as that account.],
  [`may-review`],                      [Allows to see which datasets are sent for review, and allows to perform reviews.],
  [`may-review-quotas`],               [Allows access to see requests for storage quota increases and approve or decline them.],
  [`may-review-integrity`],            [Allows access to an API call that provides statistics on the accessibility of files on the filesystem.],
  [`may-process-feedback`],            [Accounts with this privilege will receive e-mails with the information entered into the feedback form by other users.],
  [`may-recalculate-statistics`],      [Views and downloads statistics are not calculated in real time. An administrator with this additional privilege can trigger a recalculation of these statistics, which can be a database-intensive action.],
  [`may-receive-email-notifications`], [This "privilege" can be used to disable sending any e-mails to an account by setting it to `0`. The default is `1`.],
)

To enable a privilege for an account, set the value of the desired privilege
to `1`. Privileges are disabled by default, except for
`may-receive-email-notifications` which defaults to `1`.

```xml
  <privileges>
    <account email="you@example.com" orcid="0000-0000-0000-0001">
      <may-administer>1</may-administer>
      <may-run-sparql-queries>1</may-run-sparql-queries>
      <may-impersonate>1</may-impersonate>
      <may-review>0</may-review>
      <may-review-quotas>0</may-review-quotas>
      <may-review-integrity>0</may-review-integrity>
      <may-process-feedback>0</may-process-feedback>
      <may-receive-email-notifications>1</may-receive-email-notifications>
    </account>
  </privileges>
```

== Running `seshat` <running-seshat>

Before running `seshat`, consider @configuring-seshat which provides
the configuration options to enable or disable features, where data will be
stored and a way to adapt `seshat` to your organization's style.

=== Running `seshat`

Invoking `seshat web` starts the web interface of `seshat`. On what
port it makes itself available can be configured in its configuration file.

```
seshat web --config-file=your-seshat-config.xml
```

=== Running `seshat` behind an `nginx` reverse-proxy

While `seshat` itself does not support SSL/TLS, it is designed to
work together with a reverse-proxy HTTP server like `nginx`. When
`seshat` starts, it will bind on a pre-configured address and port,
which in turn can be `proxy_pass`ed to using `nginx`.

The following snippet shows how to configure `nginx`.

```
server {
    listen              443 ssl;
    listen              [::]:443 ssl;
    server_name         example.domain;

    ssl_certificate     /etc/letsencrypt/live/example.domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.domain/privkey.pem;

    location / {
       # Set 'use-x-forwarded-for' in the seshat configuration.
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       # The values for address and port depend on what is configured in the
       # seshat configuration file.
       proxy_pass http://127.0.0.1:8080;
       root /usr/share/nginx/html;
    }
}
```

To ensure `seshat` receives the actual client IP address so it can log
this information, one can set the `use-x-forwarded-for` option
described in @sec-essential-options.

=== Running `seshat` with feature isolation <sec-feature-isolation>

Some features are more prone to denial-of-service situations because they
require more CPU, memory, or disk space to complete. To mitigate outages while
using these features, multiple instances of `seshat` can run simultaneous
as long as all but one instance runs in `read-only-mode` in the `rdf-store`
section.

Only one instance may write to the database, but other instances can be useful
to handle specific endpoints (like IIIF image processing or Git operations). The
`read-only` instances need to be able to query the database, but need not to
write to it. They can run on completely different machines, as long as a database
connection can be established.

==== Isolating Git operations <sec-isolating-git-ops>

To take advantage of the multi-instance deployment, we are going to use the `nginx`
configuration file to let a second instance of `seshat` handle all Git operations
by defining multiple `location` blocks in the `nginx` configuration.

So we create two configuration files, differing only in the `port`,
`log-file` and `rdf-store/read-only-mode` options.

- `seshat-primary.xml`: Set the `rdf-store/read-only-mode` to `0` and `port` to `8080`.
- `seshat-git.xml`: Set the `rdf-store/read-only-mode` to `1` and `port` to `8081`.

Setting two different log files makes it easier to track which request goes where.

With both instances of `seshat` running (one with the 'primary' and one 'git'
configuration file), the accompanying `nginx` `server`-block configuration
looks as following:

```
server {
    listen              443 ssl;
    listen              [::]:443 ssl;
    server_name         example.domain;

    ssl_certificate     /etc/letsencrypt/live/example.domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.domain/privkey.pem;

    # Here we group the endpoints that are used to push/pull with Git.
    # These requests will then use an instance bound to port 8081.
    location ~* ^/v3/datasets/(.*).git/(info/refs|git-upload-pack|git-receive-pack)$ {
       root /usr/share/nginx/html;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass http://127.0.0.1:8081;
    }

    # Additionally, we group the endpoints that have a Git interaction.
    # You can also concatenate the last part of the regexp to the previous
    # location block.
    location ~* ^/v3/datasets/(.*).git/(languages|contributors|zip)$ {
       root /usr/share/nginx/html;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass http://127.0.0.1:8081;
    }

    # All other locations use the instance of Seshat bound to port 8080.
    location / {
       root /usr/share/nginx/html;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass http://127.0.0.1:8080;
     }
}
```

==== Isolating IIIF operations

The IIIF endpoints can be captured by the following regular expression for
the `location` block in `nginx`:

```
^/iiif/v3/(.*)$
```

The rest of the instructions are identical to isolating Git requests (see
@sec-isolating-git-ops).
]

#render_chapter(chapter_text, "Running your own instance")
