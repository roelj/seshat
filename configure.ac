AC_INIT(seshat, 26.5)
AM_INIT_AUTOMAKE([foreign tar-ustar])
AM_PATH_PYTHON([3.9])
AC_CONFIG_FILES([
  guix.scm
  Makefile
  src/Makefile
  pyproject.toml
  rpmbuild/SPECS/seshat.spec
  doc/seshat.1
  docker/release-build
])

dnl Make building pre-releases work seemlessly
dnl ---------------------------------------------------------------------------
AC_SUBST([VERSION_FOR_PYTHON], m4_translit(AC_PACKAGE_VERSION, [~], []))

dnl Check for presence of 'typst'.
dnl ---------------------------------------------------------------------------
AC_CHECK_PROG(TYPST, typst, typst)

have_typst=no
test -n "$TYPST" && have_typst=yes

have_prebuilt_docs=no
test -f "$srcdir/doc/seshat.pdf" && test -f "$srcdir/doc/index.html" && have_prebuilt_docs=yes

AS_IF([test "x$have_typst" = "xno"],
  [AS_IF([test "x$have_prebuilt_docs" = "xyes"],
    [AC_MSG_NOTICE([Using pre-built user manual.])],
    [AC_MSG_WARN([Unable to create the user manual.])])])

AS_IF([test "x$have_typst" = "xyes" || test "x$have_prebuilt_docs" = "xyes"],
  [AC_CONFIG_FILES([doc/Makefile doc/config.typ src/seshat/config.py])])

AM_CONDITIONAL([HAVE_TYPST], [test "x$have_typst" = "xyes"])
AM_CONDITIONAL([HAVE_PREBUILT_DOCS], [test "x$have_prebuilt_docs" = "xyes"])
AM_CONDITIONAL([HAVE_DOCS], [test "x$have_typst" = "xyes" || test "x$have_prebuilt_docs" = "xyes"])

dnl Check for the presence of 'docker' or 'podman'.
dnl ---------------------------------------------------------------------------
AC_CHECK_PROG(DOCKER, docker, docker)
if test "x$DOCKER" = "x"; then
  AC_CHECK_PROG(DOCKER, podman, podman)
fi

AM_CONDITIONAL([HAVE_DOCKER], [test -n "$DOCKER"])

dnl Check for the Python 'build' module.
dnl ---------------------------------------------------------------------------
AC_CACHE_CHECK([for python build module], [ac_cv_have_python_build],
  [AS_IF([$PYTHON -m build --version > /dev/null 2>&1],
    [ac_cv_have_python_build=yes], [ac_cv_have_python_build=no])])
AM_CONDITIONAL([HAVE_PYTHON_BUILD], [test "x$ac_cv_have_python_build" = "xyes"])

dnl systemd integration
dnl ---------------------------------------------------------------------------
PKG_PROG_PKG_CONFIG
AC_ARG_WITH([systemdsystemunitdir],
    [AS_HELP_STRING([--with-systemdsystemunitdir=DIR],
        [Directory for systemd service files])],
    [systemdsystemunitdir="$withval"],
    [systemdsystemunitdir="$($PKG_CONFIG --variable=systemdsystemunitdir systemd)"])

AS_IF([test -z "$systemdsystemunitdir"],
  [systemdsystemunitdir="\${prefix}/lib/systemd/system"])

AC_SUBST([systemdsystemunitdir])
AM_CONDITIONAL([HAVE_SYSTEMD], [test -n "$systemdsystemunitdir"])

dnl Package-specific configurable options
dnl ---------------------------------------------------------------------------

AC_ARG_VAR(BASE_URL, [The URL on which the instance will run.  This is only
                      used to align the documentation.])

dnl Default value for BASE_URL (use without "/" at the end)
: "${BASE_URL=https://demo.seshat.software}"

AC_ARG_VAR(GIT_URL, [The URL of the Git repository for the code of this
                     instance.  This is only used to align the documentation.])

dnl Default value for GIT_URL
: "${GIT_URL=https://codeberg.org/seshat/seshat}"

dnl Check for presence of 'git'.
dnl ---------------------------------------------------------------------------
AC_CHECK_PROG(GIT, git, git)
AC_OUTPUT
