#import "config.typ": *

#let chapter_text = [
= Introduction <introduction>

`seshat` is a data and software repository system. The name finds its
inspiration in #link("https://en.wikipedia.org/wiki/Thoth")[Thoth], the Egyptian
entity that introduced the idea of writing.

== Obtaining the source code <sec-obtaining-tarball>

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

== Installing the prerequisites <sec-prerequisites>

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

=== Optional installation requirements depending on configuration

For specific features `seshat` may require additional packages to be
installed. Whether this is the case depends on the run-time configuration.
When an optional package is required `seshat` will report which one in
its logs. There are three configuration scenarios that require the
additional packages: SAML, S3 and IIIF.

==== SAML

When configuring the use of an identity provider via SAML `seshat`
requires the `python3-saml` Python package to be installed. This
package provides the implementation of the SAML protocol.

==== S3

When configuring file access in S3 buckets `seshat` requires the
`boto3` Python package to be installed. This package is used to
authenticate to the S3 endpoints and to download (or stream) data.

==== IIIF

When enabling the IIIF functionality `seshat` requires the
`pyvips` Python package to be installed. This package is used to
perform image transformations.

== Installation instructions

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

== RPM packages

RPM packages are provided and built for Enterprise Linux 10. This
RPM depends on packages in the
#link("https://docs.fedoraproject.org/en-US/epel")[Extra Packages for Enterprise Linux (EPEL)]
repository.

#table(
  columns: (auto, 1fr),
  table.header([*Filename*], [*Description*]),
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat-" + seshatversion + "-1.el10.noarch.rpm")[seshat-#(seshatversion)-1.el10.noarch.rpm]],
  [Binary RPM, to install and run `seshat`.],
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat-" + seshatversion + "-1.el10.src.rpm")[seshat-#(seshatversion)-1.el10.src.rpm]],
  [Source RPM, to (re)build from source code.],
)

RPM packages for more distributions, including Enterprise Linux 9, are
#link("https://copr.fedorainfracloud.org/coprs/seshat/seshat")[built via Copr].

== Debian packages

A Debian package is provided and built for Debian 13.
#table(
  columns: (auto, 1fr),
  table.header([*Filename*], [*Description*]),
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat_" + seshatversion + "-1_all.deb")[seshat\_#(seshatversion)-1\_all\.deb]],
    [Binary DEB, to install and run `seshat`.],
)

]

#render_chapter(chapter_text, "Introduction")
