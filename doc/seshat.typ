#import "config.typ": *
#show link: underline
#show link: set text(fill: rgb("#000"))
#show outline.entry.where(level: 1): set text(fill: rgb("#000"), weight: "bold")
#show outline.entry.where(level: 2): set text(fill: rgb("#111"))
#show outline.entry.where(level: 3): set text(fill: rgb("#222"))
#show outline.entry.where(level: 3): set text(fill: rgb("#333"))

#set text(lang: "en", font: "New Computer Modern")
#set par(justify: true, leading: 0.52em)
#set heading(numbering: "1.1")
#set page(numbering: "1", paper: "a4", margin: (x: 2.0cm, y: 2.0cm))
#set document(
    title: [Documentation of Seshat: a data and software repository system.],
    author: "Roel Janssen <rrejanssen@gmail.com>",
    date: datetime.today(),
)

#let target = dictionary(std).at("target", default: () => "paged")
#context if target() == "html" {
    html.elem("style")[
        #set smartquote(enabled: false)
        :root {
          -\-text-color: \#111;
          -\-background-color: \#f9f8fd;
	  -\-block-background: \#fff;
          -\-chapter-header-color: \#312b63;
          -\-sidebar-chapter-color: \#b6b0dd;
          -\-toc-header-color: \#312b63;
          -\-toc-header-text-color: \#f9f8fd;
	  -\-h2-fg-color: \#fff;
          -\-h3-bg-color: \#ebeaf2;
          -\-h4-bg-color: \#f2f1f8;
          -\-table-header-bg-color: \#4d448b;
          -\-code-bg-color: \#f8f7fc;
          -\-code-border-color: \#dedde9;
          -\-figure-border-color: \#dedde9;
          -\-figure-bg-color: \#f7f6fb;
          -\-chapter-border-color: \#dedde9;
          -\-nav-sub-border-bg-color: \#dedde9;
          -\-nav-sub-hover-bg-color: \#f0eef6;
          -\-nav-sub-odd-bg-color: \#f8f7fc;
          -\-nav-sub-even-bg-color: \#fff;
          -\-nav-sub-text-color: \#7c2c5e;
          -\-nav-sub-sub-text-color: \#2c3e7c;
          -\-text-anchor-color: \#7c2c5e;
          -\-nav-sub-hover-text-color: \#a86687;
          -\-nav-sub-sub-hover-text-color: \#6678a8;
	  -\-background-pattern-color: \#f3f3f3;
        }
	\@media (prefers-color-scheme: dark) {
	:root {
	  -\-text-color: \#e6e4f0;
	  -\-background-color: \#14121c;
	  -\-block-background: \#1a1826;
	  -\-chapter-header-color: \#1f1a3d;
	  -\-sidebar-chapter-color: \#4a4380;
	  -\-toc-header-color: \#1f1a3d;
	  -\-toc-header-text-color: \#e6e4f0;
	  -\-h2-fg-color: \#e6e4f0;
	  -\-h3-bg-color: \#2a2640;
	  -\-h4-bg-color: \#221f33;
	  -\-table-header-bg-color: \#2f2866;
	  -\-code-bg-color: \#1c1929;
	  -\-code-border-color: \#34304a;
	  -\-figure-border-color: \#34304a;
	  -\-figure-bg-color: \#1c1929;
	  -\-chapter-border-color: \#34304a;
	  -\-nav-sub-border-bg-color: \#34304a;
	  -\-nav-sub-hover-bg-color: \#2a2640;
	  -\-nav-sub-odd-bg-color: \#1c1929;
	  -\-nav-sub-even-bg-color: \#221f33;
	  -\-nav-sub-text-color: \#d8a0c0;
	  -\-nav-sub-sub-text-color: \#a0b4d8;
	  -\-text-anchor-color: \#d8a0c0;
	  -\-nav-sub-hover-text-color: \#a86687;
	  -\-nav-sub-sub-hover-text-color: \#6678a8;
	  -\-background-pattern-color: \#1a1826;
	}
	img { filter: invert(0.92) hue-rotate(180deg); }
	}
        \@font-face { font-family: 'SourceSans'; src: url('/static/fonts/SourceSansPro-Regular.ttf') format('truetype'); font-weight: normal; font-style: normal; }
        \@font-face { font-family: 'SourceSans-Italic'; src: url('/static/fonts/SourceSansPro-Italic.ttf') format('truetype'); font-weight: normal; font-style: italic; }
        \@font-face { font-family: 'SourceSans-Bold'; src: url('/static/fonts/SourceSansPro-Bold.ttf') format('truetype'); font-weight: bold; font-style: normal; }
        \@font-face { font-family: 'Fira Code'; src: url('/static/fonts/FiraCode-Regular.woff2') format('woff2'); font-weight: normal; font-style: normal; }
        html { width: 100%; margin: 0em; padding: 0em; background: repeating-linear-gradient(90deg, var(-\-background-pattern-color) 0, var(-\-background-pattern-color) 5%, transparent 0, transparent 50%), repeating-linear-gradient(180deg, var(-\-background-pattern-color) 0, var(-\-background-pattern-color) 5%, transparent 0, transparent 50%); background-size: 1em 1em; background-color: var(-\-background-color); }
        body { font-family: 'SourceSans', sans-serif; margin: 12pt auto 0pt auto; max-width: 1099pt; min-width: 720pt; }
	code { font-family: 'Fira Code', monospace; }
        \@media (max-width: 1099pt) {
          .table-of-contents { margin: auto auto 1em auto; max-width: 1099pt; min-width: 720pt; width: 820pt; background: var(-\-block-background); color: var(-\-text-color); padding: 0em; border: solid 1pt var(-\-chapter-border-color); border-radius: 1em 1em .5em .5em; }
          .chapter { margin: auto auto 1em auto; }
          section[role=doc-endnotes] { margin-left: auto; color: var(-\-text-color); }
        }
        \@media (min-width: 1099pt) {
          .chapter { margin-left: 279pt !important; }
          .table-of-contents { position: fixed; height: auto; overflow-y: auto; width: 265pt; min-width: 265pt; max-width: 265pt; display: inline-block; border: solid 1pt var(-\-chapter-border-color); padding: 0em; margin: 0em; background: var(-\-block-background); color: var(-\-text-color); border-radius: .5em; }
          nav > ol > li > ol > li > ol > li > span > a,
          nav > ol > li > ol > li > ol > li > div > span { display: none; }
          nav > ol > li > ol > li > span >a,
          nav > ol > li > ol > li > div > span > a { font-size: 0.9em; }
          section[role=doc-endnotes] { margin-left: 279pt; color: var(-\-text-color); }
	  .table-of-contents > nav > ol > li > ol { display: none; }
	  .table-of-contents nav > ol > li > ol a, .table-of-contents nav > ol > li > ol span { text-decoration: none !important; }
	  .table-of-contents nav > ol > li > ol > li { border: solid 1px var(-\-nav-sub-border-bg-color); border-radius: .4em; padding: 2px 2px 2px 6px; margin-bottom: 5px; }
	  .table-of-contents nav > ol > li > ol > li:nth-child(even) { background: var(-\-nav-sub-even-bg-color); }
	  .table-of-contents nav > ol > li > ol > li:nth-child(odd) { background: var(-\-nav-sub-odd-bg-color); }
	  .table-of-contents nav > ol > li > ol > li:hover { background: var(-\-nav-sub-hover-bg-color); }
          #chapter-toc-css(9)
        }
        .table-of-contents p { padding: 0em 0em 0em 1em; margin-bottom: 0em; }
        .table-of-contents ol { margin: 0em; padding: 1em 0em 1em 0em; line-height: 1.3em; }
        .table-of-contents ol ol { margin: 0em; padding: 0em 1em 0em 1em; }
        .table-of-contents h2 { background: var(-\-toc-header-color); color: var(-\-toc-header-text-color); padding: .75em; margin: 0em; border-radius: .25em .25em 0 0; }
        nav > ol { margin-top: 0em; }
        nav > ol > li { margin: 0em; }
        nav > ol > li > div > span > a,
        nav > ol > li > span > a { display: inline-block; width: calc(100% - 2em); background: var(-\-h4-bg-color); padding: .5em 1em .5em 1em; margin: .3em 0 .3em 0; font-size: 1.2em; color: var(-\-text-color); }
        nav > ol > li > ol > li > span > a,
        nav > ol > li > ol > li > div > span > a { display: block; color: var(-\-nav-sub-text-color); }
        nav > ol > li > ol > li > span > a:hover,
        nav > ol > li > ol > li > div > span > a:hover { color: var(-\-nav-sub-hover-text-color); }
        nav > ol > li > ol > li > ol > li > span > a { color: var(-\-nav-sub-sub-text-color); }
        nav > ol > li > ol > li > ol > li > span > a:hover { color: var(-\-nav-sub-sub-hover-text-color); }
        .center { text-align: center; }
        img { display: block; max-width: 760pt; margin: 1em auto 1em auto; }
        figure { background: var(-\-figure-bg-color); border: solid 1pt var(-\-figure-border-color); border-radius: .5em; }
        figcaption { text-align: center;  border-top: solid 1pt var(-\-figure-border-color); border-radius: 0em 0em .5em .5em; background: var(-\-h3-bg-color); padding: .5em; }
        .chapter { margin: auto auto 1em auto; max-width: 1099pt; min-width: 720pt; width: 820pt; background: var(-\-block-background); color: var(-\-text-color); padding: 0em; border: solid 1pt var(-\-chapter-border-color); border-radius: .5em; }
        .chapter p, .chapter pre, .chapter table { padding: 0pt 12pt 0pt 12pt; }
        .chapter h2 { background: var(-\-chapter-header-color); color: var(-\-h2-fg-color); padding: .75em; margin: 0em; border-radius: .25em .25em 0em 0em; }
        .chapter h3 { font-size: 1.25em; padding: .25em 1em .25em 1em; background: var(-\-h3-bg-color); }
        .chapter h4 { font-size: 1.10em; padding: .25em 1em .25em 1em; background: var(-\-h4-bg-color); }
        .chapter h5 { font-size: 1.0em; padding: .25em 1em .25em 1em; background: var(-\-h4-bg-color); }
        .chapter h6 { font-size: 1.0em; padding: .25em 1em .25em 1em; background: var(-\-h4-bg-color); }
        .chapter pre { background: var(-\-code-bg-color); margin: 0pt 10pt 0pt 10pt; padding: 10pt; border-radius: 5pt; border: solid 1pt var(-\-code-border-color); }
        table { width: 100%; margin: 0em 1em 0em 0em; border-collapse: separate; border-spacing: 0em; border-radius: .5em;}
        table tbody tr td { border: solid 1pt var(-\-table-header-bg-color); padding: .25em; border-top: none; border-left: 0; }
        table thead tr th { background: var(-\-table-header-bg-color); color: var(-\-h2-fg-color); padding: .5em .25em .5em .25em; }
        table thead tr th:first-child { border: solid 1pt var(-\-table-header-bg-color);  border-radius: 0.5em 0.5em 0em 0em; }
        table thead tr th:last-child { border: solid 1pt var(-\-table-header-bg-color); border-radius: 0.5em 0.5em 0em 0em; }
        table thead tr th { text-align: left; }
        table thead tr:first-child th:first-child { border-radius: 0.5em 0 0 0; }
        table thead tr:first-child th:last-child { border-radius: 0 0.5em 0 0; }
        table tbody tr:last-child td:last-child { border-radius: 0 0 0.5em 0; }
        table tbody tr:last-child td:first-child { border-radius: 0 0 0 0.5em; }
        table tbody tr:nth-child(even) { background: var(-\-h4-bg-color); }
        table tbody tr td:first-child { border-left: solid 1pt var(-\-table-header-bg-color); }
        section[role=doc-endnotes] ol { padding-left: .5em; }
	a { color: var(-\-text-anchor-color); }
    ]
}

// Title page & Table of Contents
// ----------------------------------------------------------------------------
#context if target() == "paged" {
    page(numbering: none)[
        #align(center + horizon)[
            #image("figures/logo.svg")
            #text(size: 28pt, weight: "bold")[`seshat`]
            #v(1em)
            #text(size: 16pt)[A data and software repository system]
            #v(2em)
            #line(length: 60%)
            #v(2em)
            #text(size: 14pt)[Roel Janssen]
            #v(2em)
            #text(size: 12pt)[#datetime.today().display("[month repr:long] [day], [year]")]
        ]
    ]
    page(numbering: "i")[
        #heading(outlined: false, numbering: none)[Table of Contents]
        #outline(title: none, indent: 1.5em, depth: 3)
    ]
}
#context if target() == "html" {
    html.elem("div", attrs: (class: "table-of-contents"))[
        #html.elem("h2")[#html.elem("code")[seshat]]
        #html.elem("p")[This document is also available as #html.elem("a", attrs: (href: "seshat.pdf"))[PDF].]
        #outline(
            title: none,
            indent: 1.5em,
            depth: 3,
        )
    ]
}

#context if target() == "paged" {
    set page(numbering: "1")
    counter(page).update(1)
}

#include "introduction.typ"
#pagebreak-when-paged()
#include "running-seshat.typ"
#pagebreak-when-paged()
#include "knowledge-graph.typ"
#pagebreak-when-paged()
#include "contributing.typ"
#pagebreak-when-paged()
#include "api.typ"
#pagebreak-when-paged()
#let bib = bibliography("references.bib", style: "apa")
#render_chapter(bib, "Bibliography")
#pagebreak-when-paged()
#include "contact.typ"
#pagebreak-when-paged()
#include "news.typ"

#context if target() == "html" {
  html.elem("script", read("toc-scroll-helper.js"))
}
