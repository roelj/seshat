#import "config.typ": *

#let chapter_text = [
= Introduction <introduction>

The `seshat` project implements a data and software repository system.  With
this software you can publish data and create citeable objects from it.

In the eyes of a data repository, data isn't fully described by its bytes.
Data has provenance, authors, usage conditions, and multiple ways of working
with it.  For example, a photograph was taken with an intent, by a person,
with a photocamera, with a specific lense, and a specific focus-point.
Furthermore, when sharing the photograph, its viewers may want to view it
in a specific format, or in a specific size.  And the author of the photo
may want to specify the conditions under which it may be (re)used. The
`seshat` data repository attempts to provide the means to capture the story
behind the bytes, and attempts to provide the means to re-use the data in a
way its author(s) and user(s) wish.

One example of providing the means to capture the story behind the data
can be found in the case of software.  Software that runs on a computer is
the product of its developmental history, and the product of its runtime
environment.  So in `seshat` we implemented Git to capture the development
history of the software. Moreover, in `seshat` we implemented the OCI
registry API so that container-based workflows have a good starting point
to run software.

== The structure of this document

This manual describes both the technicalities of getting an instance up and
running, as well as how to use it thereafter.  This is part of the Free
Software philosophy at the core of `seshat`: As a user of this software you
have the rights to run your own instance of it, to study its workings, to
modify it, and to redistribute your modified version of it.

On the other hand we strive to make it so that to run the software you don't
_need_ to modify its source code by making it extensively configurable and
offering pre-compiled and packaged versions of the software.
]
#render_chapter(chapter_text, "Introduction")
