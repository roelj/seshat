# Copying and distribution of this file, with or without modification,
# are permitted in any medium without royalty provided the copyright
# notice and this notice are preserved.  This file is offered as-is,
# without any warranty.

AUTOMAKE_OPTIONS      = subdir-objects
SUBDIRS               = .
helmdir               = ${pkgdatadir}
dist_helm_DATA        =

EXTRA_DIST            =                \
  seshat/Chart.yaml                    \
  seshat/values.yaml                   \
  seshat/templates/cert-manager.yaml   \
  seshat/templates/deployment.yaml     \
  seshat/templates/secrets.yaml        \
  seshat/templates/service.yaml        \
  seshat/templates/volumes.yaml

if HAVE_HELM
dist_helm_DATA        = index.yaml seshat-1.0.0.tgz

index.yaml: seshat-1.0.0.tgz
	$(HELM) repo index . --url @BASE_URL@

seshat-1.0.0.tgz:
	$(HELM) dependency build seshat && $(HELM) package seshat

all: seshat-1.0.0.tgz index.yaml

endif

clean-local:
	$(RM) -rf index.yaml seshat-1.0.0.tgz
