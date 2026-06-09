# Copying and distribution of this file, with or without modification,
# are permitted in any medium without royalty provided the copyright
# notice and this notice are preserved.  This file is offered as-is,
# without any warranty.

AUTOMAKE_OPTIONS        = subdir-objects
SUBDIRS                 = .

docdir                  = ${pkgdatadir}
doc_NAME                = seshat
doc_PDF                 = $(doc_NAME).pdf
doc_HTML                = index.html
doc_TYPST               = $(doc_NAME).typ
dist_doc_DATA           =

EXTRA_DIST              = $(doc_TYPST)                             \
                          api.typ                                  \
                          config.typ.in                            \
                          contact.typ                              \
                          contributing.typ                         \
                          introduction.typ                         \
                          knowledge-graph.typ                      \
                          news.typ                                 \
                          running-seshat.typ                       \
                          references.bib                           \
                          toc-scroll-helper.js                     \
                          figures/account.svg                      \
                          figures/author.svg                       \
                          figures/category.svg                     \
                          figures/collaborators.svg                \
                          figures/collection-container.svg         \
                          figures/collection.svg                   \
                          figures/dataset-container.svg            \
                          figures/dataset.svg                      \
                          figures/file.svg                         \
                          figures/funding.svg                      \
                          figures/institutiongroup.svg             \
                          figures/privatelink.svg                  \
                          figures/rdf-list-abbrev.svg              \
                          figures/references-graph.svg             \
                          figures/typed-literals-notation.svg      \
                          figures/typed-notation.svg               \
                          figures/favicon.png


if HAVE_TYPST
dist_doc_DATA           += $(doc_PDF) $(doc_HTML)

$(doc_PDF):
	@$(TYPST) compile $(doc_TYPST) $(doc_PDF)
	@printf "Generated $(doc_PDF).\n"

$(doc_HTML):
	@$(TYPST) compile --features html --format=html $(doc_TYPST) $(doc_HTML)
	@printf "Generated $(doc_HTML).\n"

all: $(doc_PDF) $(doc_HTML)
else
if HAVE_PREBUILT_DOCS
dist_doc_DATA           += $(doc_PDF) $(doc_HTML)
endif
endif

docs-clean:
	$(RM) -rf $(doc_PDF) $(doc_HTML)

clean-local: docs-clean
