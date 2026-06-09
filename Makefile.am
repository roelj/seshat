AUTOMAKE_OPTIONS        = subdir-objects
SUBDIRS                 = src doc helm

# Help make tarballs more reproducible.
export TAR_OPTIONS      = --owner=0 --group=0 --numeric-owner

if HAVE_SYSTEMD
systemdsystemunit_DATA = etc/seshat.service
endif

sysconf_DATA = etc/seshat.xml

EXTRA_DIST              =                   \
  LICENSE                                   \
  MANIFEST.in                               \
  README.md                                 \
  etc/seshat.service                        \
  etc/seshat.xml                            \
  debian/changelog                          \
  debian/control                            \
  debian/copyright                          \
  debian/rules                              \
  debian/source/format                      \
  debian/source/include-binaries            \
  docker/development-build                  \
  docker/release-build                      \
  pyproject.toml                            \
  tests/admin_panel.py                      \
  tests/create_article.py                   \
  tests/create_collection.py                \
  tests/depositor_panel.py                  \
  tests/ui_pages.py                         \
  tests/validators.py

man_MANS = doc/seshat.1

dist-rpm: dist
	mkdir -p rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
	rm -f rpmbuild/SOURCES/*
	ln -s $(abs_top_srcdir)/seshat-@VERSION@.tar.gz rpmbuild/SOURCES/seshat-@VERSION@.tar.gz
	rpmbuild --define "_topdir $(abs_top_srcdir)/rpmbuild" -ba $(abs_top_srcdir)/rpmbuild/SPECS/seshat.spec

dist-deb: dist
	mkdir -p debbuild
	rm -rf debbuild/*
	ln -s $(abs_top_srcdir)/seshat-@VERSION@.tar.gz debbuild/seshat_@VERSION@.orig.tar.gz
	cd debbuild && tar -zxf seshat_@VERSION@.orig.tar.gz && \
        cd seshat-@VERSION@/ && debuild -us -uc

if HAVE_DOCKER
dist-docker: dist
	@DOCKER@ image build --no-cache --squash \
           -t seshat.software/seshat:@VERSION_FOR_PYTHON@   \
           -f docker/release-build .

dist-docker-dev: dist
	@DOCKER@ image build --no-cache --squash        \
           --build-arg="BRANCH=main"                    \
           -t localhost/seshat:@VERSION_FOR_PYTHON@-dev \
           -f docker/development-build .

publish-docker: dist-docker
	@DOCKER@ push docker.io/4turesearchdata/djehuty:@VERSION@
endif

dist-pypi:
	@PYTHON@ -m build

if HAVE_PYTHON_BUILD
source-dist:
	@PYTHON@ -m build --skip-dependency-check --no-isolation --sdist \
           -C=--global-option=sdist                                \
           -C=--global-option=--owner=root                         \
           -C=--global-option=--group=root                         \
           -C=--global-option=--formats=gztar

binary-dist:
	@PYTHON@ -m build --skip-dependency-check --no-isolation --wheel \
           -C=--global-option=bdist                                \
           -C=--global-option=--owner=root                         \
           -C=--global-option=--group=root                         \
           -C=--global-option=--formats=gztar
all-local:
	@PYTHON@ -m build --skip-dependency-check --no-isolation   \
           --outdir $(shell readlink -f $(builddir))/build

else
source-dist:
	@PYTHON@ -c "import setuptools; setuptools.setup()" sdist
binary-dist:
	@PYTHON@ -c "import setuptools; setuptools.setup()" bdist_wheel
all-local:
	@PYTHON@ -c "import setuptools; setuptools.setup(name='@PACKAGE_NAME@', version='@VERSION_FOR_PYTHON@')" \
           sdist --dist-dir $(builddir)/build                      \
           bdist_wheel --dist-dir $(builddir)/build
endif

install-exec-local:
	@PYTHON@ -m pip install --prefix $(DESTDIR)$(prefix) \
        --disable-pip-version-check                          \
        --no-build-isolation                                 \
        --no-deps                                            \
        --no-cache-dir                                       \
        $(abs_builddir)/build/seshat-@VERSION_FOR_PYTHON@-py3-none-any.whl

uninstall-local:
	rm -rf $(DESTDIR)$(pkgpythondir)

lint:
	@pylint src/seshat/* > pylint.log || true
	@printf "Wrote 'pylint.log'.\n"

coverity-report:
	@cov-build --dir cov-int --no-command --fs-capture-search .

publish-pypi: dist-pypi
	@PYTHON@ -m twine upload --repository pypi dist/seshat-@VERSION@.tar.gz dist/seshat-@VERSION@-py3-none-any.whl

publish-test-pypi: dist-pypi
	@PYTHON@ -m twine upload --repository testpypi dist/seshat-@VERSION@.tar.gz dist/seshat-@VERSION@-py3-none-any.whl
