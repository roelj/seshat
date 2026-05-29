#import "config.typ": *

#let chapter_text = [
= Contributing <contributing>

This chapter outlines how to set up an instance of `seshat` with the goal
of modifying its source code. Or in other words: this is the developer setup.

== Setting up a development environment

First, we need to obtain the latest version of the source code:

#let output = ```bash
$ git clone <seshatgiturl>
```
#render_code_output(output)

Next, we need to create a somewhat isolated Python environment:

```bash
$ python -m venv seshat-env
$ . seshat-env/bin/activate
[env]$ cd seshat
```

And finally, we can install `seshat` in the virtual environment to make
the `seshat` command available:

```bash
[env]$ autoreconf -if && ./configure
[env]$ pip install --editable .
```

If all went well, we will now be able to run `seshat`:

```bash
[env]$ seshat --help
```

== Configuring `seshat`

Invoking `seshat web` starts the web interface of `seshat`. On what
port it makes itself available can be configured in its configuration file.
An example of a configuration file can be found in `etc/seshat.xml`. We will
use this file as the basis to configure our development environment.

```bash
[env]$ cp etc/seshat.xml config.xml
```

In the remainder of the chapter we will assume a value of `127.0.0.1` for
`bind-address` and a value of `8080` for `port`.

=== Modifications to the example configuration for developers

@configuring-seshat describes each configuration option for `seshat`.
The remainder of sections here contain a fast-path through configuring
`seshat` for use in a development setup.

==== Live reload

The `seshat` program can be configured to automatically reload itself when
a change is detected by setting `live-reload` to `1`.

==== Configuring authentication with ORCID

The `seshat` program does not have Identity Provider (IdP) capabilities,
so in order to log into the system we must configure an external IdP. With
an #link("https://orcid.org")[ORCID] account comes the ability to set up an
OAuth endpoint. Go to #link("https://orcid.org/developer-tools")[developer-tools]
at #link("https://orcid.org")[orcid.org]. When setting up the OAuth at ORCID,
choose `http://127.0.0.1:8080/login` as redirect URI.

Modify the following bits to reflect the settings obtained from ORCID.

```xml
  <authentication>
    <orcid>
      <client-id>APP-XXXXXXXXXXXXXXXX</client-id>
      <client-secret>XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX</client-secret>
      <endpoint>https://orcid.org/oauth</endpoint>
    </orcid>
  </authentication>
```

To limit who can log into a development system, accounts are not automatically
created for ORCID as IdP. So we need to configure who can log in by creating
a record in the `privileges` section of the configuration file.

This is also a good moment to configure additional privileges for your account.
In the following snippet, configure the ORCID with which you will log into
the system in the `orcid` argument.

```xml
  <privileges>
    <account email="you@example.com" orcid="0000-0000-0000-0001">
      <may-administer>1</may-administer>
      <may-impersonate>1</may-impersonate>
      <may-review>1</may-review>
    </account>
  </privileges>
```

=== Invoking `seshat`

Once we've configured `seshat` for development use, we can start the web
interface by running:

```bash
[env]$ seshat web --initialize --config-file=config.xml
```

The `--initialize` option creates the internal account record and
associates the specified ORCID with it. We only need to run `seshat`
with the `--initialize` option once.

By now, we should be able to visit `seshat` through a web browser at
#link("http://127.0.0.1:8080")[localhost:8080], unless configured differently.
We should be able to log in through ORCID, and access all features of
`seshat`.

== Navigating the source code

In this section, we trace the path from invoking `seshat` to responding
to a HTTP request.

=== Starting point

Because `seshat` is installable as a Python package, we can find the
starting point for running `seshat` in `pyproject.toml`. It reads:

```
[project.scripts]
seshat = seshat.ui:main
```

So, we start our tour at `src/seshat/ui.py` in the procedure called `main`.

=== How `seshat` initializes

The `main` procedure calls `main_inner`, which handles the command-line
arguments. When invoking `seshat`, we usually invoke
`seshat *web*`, which is handled by the following snippet:

```python
import seshat.web.ui as web_ui
...
if args.command == "web":
    web_ui.main (args.config_file, True, args.initialize,
                 args.extract_transactions_from_log,
                 args.apply_transactions)
```

So, the entry-point for the `web` subcommand is found in
`src/seshat/web/ui.py` at the `main` procedure.

This procedure essentially sets up an instance of `WebServer` (found in
`src/seshat/web/wsgi.py`) and uses `werkzeug`'s `run_simple` to start
the web server.

=== Translating URI paths to internal procedures

An instance of the `WebServer` is passed along in werkzeug's `run_simple`
procedure. Werkzeug calls the instance directly, which is handled by the
`__call__` procedure of the `WebServer` class. The `__call__` procedure
invokes its `wsgi` instance, which is configured as following:

```python
self.wsgi = SharedDataMiddleware(self.__respond, self.static_roots)
```

The `__respond` procedure calls `__dispatch_request`.

In `__dispatch_request`, the requested URI is translated into the procedure
name using the `url_map`. So, except for static resources in the
`src/seshat/web/resources` folder and pre-configured static pages, URIs are
handled by a procedure in the `WebServer` instance.

A mapping between a URI and the procedure that is executed to handle the
request to that URI can be found in the `url_map` defined in the
`WebServer` class in `wsgi.py`.

=== Diving into the code that displays the homepage

As an example, in the `url_map`, we can find the following line:

```python
R("/", self.ui_home),
```

In this case, `self` is a reference to an instance of the `WebServer`
class, so we look for a procedure called `ui_home` inside the
`WebServer` class. Some code editors have a feature to "go to definition"
which helps navigating.

The `ui_home` gathers the summary numbers from the SPARQL endpoint
with the following line:

```python
summary_data = self.db.repository_statistics()
```

And a list of the latest datasets with the following line:

```python
records = self.db.latest_datasets_portal(30)
```

It then passes that information to the `__render_template`
procedure which renders the `portal.html` in the
`src/seshat/web/resources/html_templates` folder. The
Jinja#footnote(link("https://jinja.palletsprojects.com/en/3.1.x/")) package
is used to interpret the template.

```python
return self.__render_template (request, "portal.html",
                               summary_data = summary_data,
                               latest = records, ...)
```

=== Database communication

In the `ui_home` procedure, we found a call to the
`self.db.repository_statistics` procedure. To find out by hand where that
procedure can be found, we can look for the place where `self.db` is
assigned a value:

```python
self.db = database.SparqlInterface()
```

And from there look up where `database` comes from:

```python
from seshat.web import database
```

From which we can conclude that it can be found in
`src/seshat/web/database.py`.

In the `repository_statistics` procedure, we find a call to
`self.__query_from_template` followed by a call to `__run_query`
which takes the output of the former procedure as its input.

As the name implies, `__run_query` sends the query to the SPARQL endpoint
and retrieves the results by putting them in a list of Python dictionaries.

The `self.__query_from_template` procedure takes one parameter, which is
the name of the template file (minus the extension) that contains a SPARQL
query. These templates can be found in the
`src/seshat/web/resources/sparql_templates` folder.
]

#render_chapter(chapter_text, "Contributing")
