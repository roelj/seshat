#import "config.typ": *

#let chapter_text = [
= Introduction <introduction>

The `seshat` project implements a data and software repository system.  With
this software you can publish data and create citeable objects from it.

Data isn't fully described by its bytes.  Data has provenance, authors, usage
conditions, and multiple ways of working with it.  For example, a photograph
was taken with an intent, by a person, with a photocamera, with a specific lense,
and a specific focus-point.  Furthermore, when sharing the photograph, its
viewers may want to view it in a specific format, or in a specific size.  The
`seshat` data repository attempts to provide the means to capture the story behind
the bytes, and attempts to provide the means to re-use the data in a way its users
wish.

Software can be viewed through the lense of of bytes-to-be-reused, but in
`seshat` it is treated as a special case.  We implemented Git and the OCI
registry API in `seshat` to preserve software in its full shape: including
version control history, and including the means to run it.

== The structure of this document

There is only one manual provides by `seshat`.  It describes both the
technicalities of getting an instance up and running, as well as how to use it
thereafter.  This is part of the Free Software philosophy at the core of `seshat`:
As a user of this software you have the rights to run your own instance of it,
to study its workings, to modify it, and to redistribute your modified version
of it.

== Installing `seshat` from its source code

Building software from its source code makes it easier to modify it afterwards.
The remainer of this section will go over this process.  If you prefer pre-built
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


== Installing pre-compiled packages <pre-built-packages>

=== RPM packages

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

=== Debian packages

A Debian package is provided and built for Debian 13.
#table(
  columns: (auto, 1fr),
  table.header([*Filename*], [*Description*]),
    [#link(seshatgiturl + "/releases/download/v" + seshatversion + "/seshat_" + seshatversion + "-1_all.deb")[seshat\_#(seshatversion)-1\_all\.deb]],
    [Binary DEB, to install and run `seshat`.],
)

== Container images <container-images>

Container images are provided through the `seshat.software` registry.  The image
is built using the Dockerfile in `docker/Dockerfile` with the `PURPOSE=release`
build argument.

The OCI image can be `pull`ed using:
```bash
docker pull seshat.software/seshat:latest
```

]
#render_chapter(chapter_text, "Introduction")
