<p align="center">
  <img src="https://seshat.software/logo.png" alt="Seshat logo" width="256">
</p>

# seshat

This software provides a general data and software repository system that
attempts to promote active re-use of data and software by providing a
rock-solid foundation of implementations of protocols and standards related
to its aims.

## Reporting (potential) security issues

For security-related matters, please e-mail
[security@seshat.software](mailto:security@seshat.software).  If you are
(going to be) running an instance of this project and would like to be part of
the security mailing list, then please write the mailing list.

## Creating a development environment

This project uses the GNU autotools build system.

### GNU/Linux

For development on GNU/Linux we recommend installing `git`, `autoconf`,
`automake`, `make` and `typst` through your system's package manager, followed
by creating a Python virtual environment for `seshat`:

```bash
git clone https://codeberg.org/seshat/seshat.git && cd seshat/
autoreconf -if && ./configure
python -m venv ../seshat-env
. ../seshat-env/bin/activate
pip install --upgrade pip
pip install --editable .
```

#### Keeping your development environment up-to-date

Because the virtual environment isn't updated by your system's package
manager, you can use the following snippet to update packages inside your
virtual environment:
```bash
pip freeze | grep -v "seshat.git" | cut -d= -f1 | xargs -n1 pip install -U
```

### macOS X

For development on Apple's macOS X, we recommend installing `python3`, `git`,
`autoconf`, `automake`, and `make` through [homebrew](https://brew.sh/),
followed by creating a Python virtual environment for `seshat`:

```bash
brew install python3 git autoconf automake make typst
git clone https://codeberg.org/seshat/seshat.git && cd seshat/
autoreconf -if && ./configure
python3 -m venv ../seshat-env
. ../seshat-env/bin/activate
pip install --upgrade pip
pip install --editable .
```

#### Keeping your development environment up-to-date

Because the virtual environment isn't updated by homebrew, you can use the
following snippet to update packages inside your virtual environment:
```bash
pip freeze | grep -v "seshat.git" | cut -d= -f1 | xargs -n1 pip install -U
```

### Microsoft Windows

For development on Windows we recommend [MSYS2](https://www.msys2.org/)
and the following approach to installing packages:
```bash
PRE="mingw-w64-ucrt-x86_64-" # See https://www.msys2.org/docs/package-naming
pacman -Suy auto{conf,make} make ${PRE}{git,typst,python,python-setuptools} \
       ${PRE}python-{defusedxml,jinja,pillow,pygit2,rdflib,requests,werkzeug,pip}
# If you chose a different PRE above, change /ucrt64 accordingly below.
# See: https://www.msys2.org/docs/environments
export PATH="/ucrt64/bin":"${PATH}"
git clone https://codeberg.org/seshat/seshat.git && cd seshat/
python -m venv --system-site-packages ../seshat-env
. ../seshat-env/bin/activate
autoreconf -if && ./configure
pip install --editable .
```

Tip: On Windows, prefer `127.0.0.1` over `localhost` in the `sparql-uri`
and `sparql-update-uri` configuration. Windows resolves `localhost` to
IPv6 (`::1`) first, and when the SPARQL endpoint only listens on IPv4, every
request waits for the failed IPv6 connection attempt before falling back,
adding a second or more to each query.

#### Keeping your development environment up-to-date

The dependencies for `seshat` are installed via `pacman`, so to update those
packages use the following snippet:
```bash
pacman -Suy
```

See [Updating MSYS2](https://www.msys2.org/docs/updating/) for more details.

### Verify that the installation works
Upon completing the installation, you should be able to run:
```bash
seshat --help
```

## Setting up the database

Seshat needs a SPARQL 1.1 endpoint such as
[Virtuoso OSE](https://github.com/openlink/virtuoso-opensource) or
[Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) to
store its state.

## Run the web service

To start the web service, we recommend copying the
[example configuration](./etc/seshat.xml)
and go from there:

```python
cp etc/seshat.xml seshat.xml
```

### First run

Upon first run, `seshat` needs to initialize the database with categories,
licences and accounts.  To do so, pass the `--initialize` option to the
`seshat web` command:

```bash
seshat web --initialize --config-file seshat.xml
```

### Subsequent runs

After the database has been initialized, you can remove the `--initialize`
option:
```bash
seshat web --config-file=seshat.xml
```
