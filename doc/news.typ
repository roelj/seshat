#import "config.typ": *
#let chapter_text = [
#silent-chapter[News] <news>

#silent-section[Release notes for `v26.9` (2026-09-28).] <release-26-09>

The September release of 2026 consists of 104 commits made by 4 authors.
We recommend upgrading to `v26.9` due to various security fixes and
a lot of bug fixes.

Furthermore, this release takes important steps towards reducing the
dependency footprint for Seshat by the removal of `jQuery` and `DataTables`.

#silent-subsection[New features]

- Add support for binding on Unix sockets
  (#commitLink("7030264ff89da7e616bd344f0e2e97c2de9889aa")).

#silent-subsection[Bugfixes]

- Fix TemplateNotFound error in `record_uri`
  (#commitLink("3fcbc6b2043aa080c20aac4cbfc01544204a5dea")).
- Fix dark-mode color theme (
  #commitLink("f8c6a3e64509e92232b2f97f6de685235de7da0d"),
  #commitLink("647dd7e38e42f282b9dea24562533a77c891f12a"),
  #commitLink("9d516875f2e83759f605bf8e22b6b9081619248b"),
  #commitLink("e23861a8613d0fd7d54f819b4e3669d1a572076e")).
- Fix returning a HTTP 500 error in `api_v3_dataset_publish`
  (#commitLink("66916be83bca8459b1fef8c130332cf28165bdd4")).
- Fix erroring when logging an error in `api_v3_dataset_upload_file`
  (#commitLink("338b324fc17ddb5f0eb2288ca1d1991c9bd18755")).
- Fix 'api_dataset_version_update_thumb' when using numeric IDs
  (#commitLink("671b747370abafb7f3497b66f289d6ddf86334e7"))
- Fix returning a HTTP 500 error in `api_v3_datasets_search`
  (#commitLink("0251cef4796902a261a4e959ce7e5feeef00690f")).
- Fix start-up crash when not specifying an e-mail port
  (#commitLink("1885559198146a0f66ad723b473a33ad41b2a8f9")).
- Avoid stringifying None into names in `refresh_group_configuration`
  (#commitLink("8daa2c1aa565fe25b08ff037a53b69b7a3190a49")).
- Fix collapsed menu state on narrow to wide resize in the documentation
  (#commitLink("0518fbef2871df68602c7d57c508b0f44cb7c1bb")).
- Implement form feedback on the "request access" form
  (#commitLink("f9555b886d3ba174cae86180eca8edff95090c24")).
- Detect circular inclusion of config files
  (#commitLink("5ebf7de2ad77d6c0d4a03b1d0169f09232d9d26d").
- Don't crash on startup  when "static-pages" has no "resources-root"
  (#commitLink("84ea854721908c4597db7334bc1a017efaa9b4bd")).

#silent-subsection[Security]

- Fix privilege escalation through `/v3/profile`
  (#commitLink("244c22ff7a0b8a70259e8d884968d8a7e4512b0b")).
- Fix privilege escalation through upload tokens
  (#commitLink("a0549ff9c2a67117a18383f27b4d47f48e08222f")).
- Normalize paths in zip files and disable following symbolic links
  (#commitLink("ca5e77b8c2d0f8f4d2bce7d586a61e201abe7549")).
- Don't disclose authors in full-content embargo publications
  in the latest datasets overview
  (#commitLink("dbee94d317c1604188b8695eb6424116be766b19")).
- Disallow downloading of non-public files through version ambiguity
  (#commitLink("299e5af3c45a8e440f736b40cc4d4072e1d0e026")).
- Fix leaking a restricted or embargoed Git repository through CodeMeta
  (#commitLink("f115d5e6e880d2764d7171a07c43b95cfd439dcf")).
- Fix leaking e-mail addresses through `/v3/accounts/search`
  (#commitLink("68f20b362280f1b46726e2758c204565d29bb012")).
- Tighten validation of "collection_id" in `api_collection_versions`
  (#commitLink("f43ca5cc2a9328c4737a10bfe9ebbebb3d5f3825")).
- Tighten validation of licenses in `api_v3_datasets_search`
  (#commitLink("4c25ffcdd46153b8e0c35ebcd7d55d2c2a9fa3d3")).
- Validate "version" as numeric value in `ui_export_citation`
  (#commitLink("0deb85e4550b99b3beabaeaac145daef31a06dfb")).
- Fix SPARQL injection via datetime values
  (#commitLink("3f347a77016e2531a3dda0b03c27130b8d150a78")).
- Fix HTML injection through image filenames
  (#commitLink("d710c3866a9e1c10111e2936abe77cc596329292")).
- Fix checking for the right privileges when deleting a file
  (#commitLink("5caa15962f7db234b0e2d901534fc731770787b2")).
- Require 2-factor authentication for institutional reviewers
  (#commitLink("0d5c80959292145423084185144d72d0c81e1efa")).
- Fix arbitrary overwriting of OCI images
  (#commitLink("a4a521102859acc37f0d1fa507e4222e1d70d829")).
- Set `HttpOnly` flag for cookies
  (#commitLink("11eedb42edeaaea13aaa8871d599a0fadb0bf051")).
- Only trust forwarded HTTP headers from a pre-configured proxy server
  (#commitLink("7ecda429e81f9f43f5a4f98145a15386a14e07cf")).

#silent-subsection[Incremental improvements]

- Eliminate code duplication
  (#commitLink("f00f13422e0a84012d05884a23bac48d121621e3"),
   #commitLink("44c62fa6d44b9412968d4b87212918f88b8e91de")).
- Remove `jQuery` dependency
  (#commitLink("ff9201e2b4f541dabc3d79600adcb9345f17856a"),
   #commitLink("0136eb6903c93d9d050750cd8d1a331c846a9a76"),
   #commitLink("c806bfecbb2e5f769c0fbec3583d1fc10d3386fb"),
   #commitLink("545e38f9cca91c4497891bffe0773c07f0943f7e"),
   #commitLink("6708d73b732c4ad053b34764dd02dddaa5baeb58"),
   #commitLink("698d2e8ae13d3b392a20ef6febe5fbc06fab006e"),
   #commitLink("112579689c84224831502c08016e6d11d588ae0a"),
   #commitLink("abb5d8b905c15849a13ea01bba8bff9a1289f6f0"),
   #commitLink("2cf5d98322381a914ac5e2376b6bc29508acf8cc"),
   #commitLink("ed217ae4cfb21284ce9849524ca8dd34756e57cf"),
   #commitLink("8d723c830f797eb390bdcb9a848df959e32f992b"),
   #commitLink("f5d117c31f87f444a0423db68f717a810e284580"),
   #commitLink("ddad31dd07607753f179b35b2a555fbf3a41d826"),
   #commitLink("9c22cf3340de27c93aa9e2b04015c4600b3381f8"),
   #commitLink("92c9f802697ac55938083bced68a5b2545987c4a"),
   #commitLink("51cf0db6380a8174a7e96bdc0f9e8264b4d10135"),
   #commitLink("8c4a215abe7165cca8f17d5277a62d1e00afb021"),
   #commitLink("d09cf8e846cd9801043fb2f1eab65b9d2be83777"),
   #commitLink("4be93e627589d38db8e55a5dae7ada7c0e3e0ee9"),
   #commitLink("4d57d0754809f65092c2fb3dc91525a484f5af85"),
   #commitLink("9f056b88eab56d30f084778ab6eb0ab0de6aaf12"),
   #commitLink("9f9f96e231b6ae162e0a20fa54af077a141305f8"),
   #commitLink("d55b89d93040935b87c86856a9a14712c8c6d908"),
   #commitLink("815ecbf84e68ee2fd14a8dd630a27e214ba9bbec")).
- Remove `DataTables` dependency
  (#commitLink("0f77e2d92295d86ace4310f223140197a63c87be")).
- Replace references graph with SBOM graph in the documentation
  (#commitLink("51e1b4039259d645063f0a50497cbaa50bac07b7")).
- Improve start-up time when waiting for SPARQL endpoint to come up
  (#commitLink("99bad61484a4f430cfd46fb49da3778d537e05b6")).
- Move cache invalidation to after state changes
  (#commitLink("7feafae228b41eacf4d73e325b7db5b528bb4280"),
   #commitLink("17613433908f048301054e9dfed7f36a098b69b6")).
- Reduce HTML output size of the documentation
  (#commitLink("2fb8d693208e267f5cffc1220812dedd6160c888"),
   #commitLink("7046630b2f62eed5abb21ba22ac4406a07a1240d"),
   #commitLink("1b4da288b0ab7937725397c40fabceb00634fcee")).
- Improve readability on mobile devices
  (#commitLink("7e97565c8853cebefdf39562867dd37a530caee3")).

#silent-section[Release notes for `v26.8` (2026-09-03).] <release-26-08>

The August release of 2026 consists of 74 commits made by 4 authors.
We recommend upgrading to `v26.8` due to various security fixes and
a lot of bug fixes.

Thank you to our new contributor
#link("https://codeberg.org/piotrekgelert")[\@piotrekgelert].
More eyes and perspectives are always appreciated.

#silent-subsection[New features]

- Implement dark-mode theme
  (#commitLink("fc60b0e008a4e7691ecdae6d6f021b13565de3d8"),
   #commitLink("ca8dfb0ce8d991ed8481eb1382af1520e7a75523"),
   #commitLink("4075430183956a54392f1eb7912680e98bdc979c"),
   #commitLink("118c15853b3167d13271ab7338dcf0ad66b8d40b"),
   #commitLink("b1f39bb0c2d705b699d7ba940e61cc818082745c"),
   #commitLink("a55549858918c785138738916501256d0d95d624")).
- Implement beginning of Projects spaces
  (#commitLink("e7995d7533eff9987142c9ef9b61ddbe12735f2e"),
   #commitLink("231675295c38e9b5cfffe755643a10128a5530bd"),
   #commitLink("2504ae51fe6697cd2d7e9e8ea9e67656f3aa848b"),
   #commitLink("83929c6783d7c097568acf2f9bdea8eacaa67f6e"),
   #commitLink("b9df35c34d3aa254f3bef3aa7cbffb3531b71559"),
   #commitLink("854a42c1f26a2a2769f1723f9453532b8d9b5d72")).

#silent-subsection[Bugfixes]

- Add missing files from the release distribution tarball
  (#commitLink("38aeb2046e1515a5e5786d9db5f2a74441b2241d"),
   #commitLink("ac507e2fe94f9c00cf462862c7b6158a3c470283"),
   #commitLink("f9354fa74d70ab7e5ac20f3f882242b13cc34033"),
   #commitLink("032c5c20c75bbf195116d110229b0e1310668b18")).
- Avoid showing `None` in citations
  (#commitLink("039b22fd5683f1cd2a2503b1fd7c537107f9ff49")).
- Fix `custom-css` configurable option
  (#commitLink("62a161eefcff6ae94aa96ae5f8d695eefbca59d7")).
- Fix file lookups in S3-only instances
  (#commitLink("e927744c63d8e0c0dcd36b65c0931fe1109c225f")).
- Fix rendering `custom-html` on the portal page
  (#commitLink("8ead48b3c8b9c72f960ce2c1e02af39b4adbbeb5")).
- Fix label associations and add `aria-label` attributes throughout the
  templates
  (#commitLink("fe1844ee5d875df43999457f49d08fa2bde19b82"),
   #commitLink("b4d3518659e1e98401723b66cbf0dce3dff6b1aa"),
   #commitLink("bb7f921242e02de56b2d242e3c189a19317477f2"),
   #commitLink("d2e23493ef89c061cae5cbdaa4b20bd4ed58dadf"),
   #commitLink("829c185deb7d4f8bb778cedf43f81817318f8b21")).
- Fix invalid HTML in the templates
  (#commitLink("f26521ed915a66b3510441a029ccb70bd586b067"),
   #commitLink("78482f98808a1f3e3eb2a5d71495c89da440c16e"),
   #commitLink("f8f8e6aac37806641532db0945294481ef10f9a9"),
   #commitLink("263c4779fc75c975f541ab21d89657cf1ea13e57")).
- Fix the `exclude` parameter of `api_private_datasets_search`
  (#commitLink("68d9853ea57ab5632ccd93226df5b09f48f45912")).

#silent-subsection[Security]

- Validate `dataset_uuid` in `api_v3_datasets_assign_reviewer`
  (#commitLink("12fe5c95570e5ff7609715004736131801f7e3c2")).
- Validate `container_uuid` in `api_v3_repair_md5s`
  (#commitLink("25a1efb5baaf3adabb61883c359c40349f2b21de")).
- Validate versions to integers
  (#commitLink("071d38da5857dcd484fe13a5f2879eeecd98b0fd")).
- Avoid HTML-injection in the feedback form
  (#commitLink("ad38420562f1f57bce6e9ca585edbb9315167b9a")).
- Escape dynamic values before injecting them into `jQuery.html`
  (#commitLink("e667ddf14ecf588518b33f7e21d831faef2aab47")).

#silent-subsection[Incremental improvements]

- Ensure temporary files for thumbnails are always cleaned up
  (#commitLink("97f9bc6ff7d2529095b115fa5c96cba79b02d1ff")).
- Avoid duplicated validation of `order_direction` for collection API calls
  (#commitLink("7d19092628763f131b1f79e037df53ff5c12a2f5")).
- Report error kind instead of HTTP code in `error_400`
  (#commitLink("8be34afbd8066abe5b10fccb13413eedd301418b")).
- Test `xml_root` for presence rather than truthiness
  (#commitLink("3ebd784e6a988643aaad0754360014ec6e7dde69")).
- Add a Helm cron job to make daily online full backups
  (#commitLink("225bad8c8e0d46caf7fb9ec5ebb12ed26cf67130")).
- Improve displaying the website on mobile devices
  (#commitLink("341be655b259ed53ffdc1a18761fb66c6cba0ae0")).
- Avoid super-linear backtracking in `trim_single_word` and remove the
  regular expression from `parse_organizations`
  (#commitLink("c45af54bfe889d9a3e6c1c494bf5766a10dcb6d7"),
   #commitLink("1792f939d39ff2159bd7ce6524581587c4636b09")).
- Add PyPI installation instructions to the README
  (#commitLink("3ac55223d59f4f2609d0ba230d28c47162042332"),
   #commitLink("f6c97e571cb49bcf19ad6ad29fe1a41017f04b4f")).
- Avoid constructing a full list in `parse_search_terms`
  (#commitLink("48d7c52c5cf11665f812fe64348475fabe856e61")).
- Refactor `pretty_print_size` and consolidate the geolocation field
  handling in `convenience`
  (#commitLink("d94f96f293bdb6d4479fd3d76cee4a15d4bcb201"),
   #commitLink("ab3535b93ce121b6d9dcf4ecf543d61f45f9e537"),
   #commitLink("0dd4b6c6d5ab67ac55d6769b70424c500218cef7")).
- Refactor the validation exceptions in `validator`
  (#commitLink("9c9635926170fe82955c5ba28ad643f9418cb0c6")).
- Generalize `token_from_cookie` to `value_from_cookie`
  (#commitLink("cd40e3fb3e965d49037015dd299bd24c2b6c040c")).
- Remove more jQuery in favor of plain Javascript
  (#commitLink("af2dcc6e52e33ec40975976ee0422e89b4043d2d"),
   #commitLink("499b31c2438c507cc1c5471de5b185845819b3bd"),
   #commitLink("9e92295e8e36f17169a0a20e469847fd37fcf8d3"),
   #commitLink("a2532deb16177ce8514e6efe7329f4e7b089aa77"),
   #commitLink("e91c83c490ea5ae1ba1d217ef0a8f0c7650e8c83")).
- Avoid HTML-escaping values in the JSON-LD metadata
  (#commitLink("8399879e8a400a47f278e3fb687c62b1bff67294"),
   #commitLink("3d5b9ee3a579074a8d3391ff1bcccf763ce5b7b5")).
- Send e-mail as UTF-8 instead of ISO-8859-1
  (#commitLink("0aeb0d6df0e143f3c524bd57b8cb1c9769882091")).

#silent-section[Release notes for `v26.7` (2026-08-02).] <release-26-07>

The July release of 2026 consists of 40 commits made by 3 authors.
It primarily contains bugfixes and clean-ups.

But other than the usual progress, this month's release is the first release
of Seshat that is also published on
#link("https://pypi.org/project/seshat/")[PyPI].  This is due to
the kindness and effort from Kirk Strauser
(#link("https://github.com/kstrauser")[\@kstrauser]).  Thank you Kirk for
enabling us to publish Seshat on PyPI!

#silent-subsection[New features]

- Add `custom-css` configuration option
  (#commitLink("fa25d3d28b8ed2192a799d340a6df47412138e47")).
- Add API calls for projects
  (#commitLink("1c73c4a943b6fc5a2a033faa17c71e2070c1fd61"),
   #commitLink("e7595b90dc72d277850f23931c49e49f04d1fc0f"),
   #commitLink("8551ec8c317570c17de571b555a47b5277133cf9"),
   #commitLink("39e285a13be1a9a91f32d8a901e5786891dddd8d")).

#silent-subsection[Bugfixes]

- Don't crash Seshat when ORCID is unreachable on start-up
  (#commitLink("3feabc4356037fed5aa3604513a7ad0d0ff89278")).
- Let `sparql_suffix` set `LIMIT` and `OFFSET` independent of values for `ORDER`
  (#commitLink("cb609cb0ff61ee294ac369d274622d412396dce7")).
- Avoid race conditions in creating cache files
  (#commitLink("2fa19766572f8972f6dc3b471bb933666e153420")).
- Fix session check in `ui_activate_session`
  (#commitLink("ee3f817ac0c1a021e3bcd5d4c07aad1142deb1d0")).
- Close connection to e-mail server in all error paths
  (#commitLink("f252052559874e9e4b7a0b58eee9dc5b0decb900")).
- Resume interrupted S3 transfers at correct offset
  (#commitLink("b0ef1fce6e526cba1b4ac8730a30520528752ec4")).
- Improve date validator
  (#commitLink("7147534f48a6201e1761b95e459296d54ac2c46b")).
- Don't crash when cache location is not configured
  (#commitLink("c146333ddd58b125c82e1e2b8ff149a56576abef")).
- Avoid returning HTTP 500 errors
  (#commitLink("300f153e13287fe800ece0afd92d2b78799e2c48"),
   #commitLink("7b7c43fc85b8ae5103ba0b74241d5215258b6a1c")).
- Reduce critical section in `api_v3_dataset_submit`
  (#commitLink("4a7ee933bd8ac88f821f6521b60d7218c3473c59"),
   #commitLink("a3ef2eeccc9f6bb34a0db8f78d7c2f1a1d874510")).
- Propagate the `error_list` in `paging_to_offset_and_limit`
  (#commitLink("8d142b17fa60d5f64706038be80a7d8e6aca7afb")).
- Avoid stringifying None in `make_citation`
  (#commitLink("408cd470968c4ae09c0d061cd41d8c6c29461589")).
- Reject non-string values in `order_direction`
  (#commitLink("399c411f98848f3703db914d7fdf64cf43ca9f8a")).
- Implement HTTP 503 error for `LockAcquisitionTimeout`
  (#commitLink("7604303738a8aef620b59a9a83cf340c2fc7796e")).
- Handle decoding errors in `ui_admin_sparql`
  (#commitLink("baccd4d8717c5021878173dbe18407ceb8693df6")).
- Avoid divide-by-zero in `api_v3_admin_files_integrity_statistics`
  (#commitLink("a5b96d36585c7fdf55818c9a825c2c86a95525fd")).

#silent-subsection[Security]

- Check permissions returned by database for `__needs_collaborative_permissions`
  (#commitLink("aeff8c0b6b1d23b4f076e4e0a764a17e49f7d1c3")).
- Validate input values in `api_collections_search`
  (#commitLink("53e2e6aad1909eacfc9fe6e4a6a53c02bcc1e994")).
- Put an upper bound on frames in animated GIF thumbnails
  (#commitLink("8fa54481f3a7415fd5bb1217914e70234d2d20f7")).
- Validate `impersonate` parameter in `impersonated_account_uuid`
  (#commitLink("1493c2b6cefec287f368547ec65e88dfd5575b63")).
- Validate category IDs in `__default_dataset_api_parameters`
  (#commitLink("2a4227e1419e9a0058a8a7975ff8245524d111cc")).

#silent-subsection[Incremental improvements]

- Simplify color rendering
  (#commitLink("a0a4ead2a3ddf9fea105e8d710de28039fcc071d")).
- Remove unused CSS styling
  (#commitLink("cddafc0a923c6242a7206449eb68c64fec541e61")).
- Simplify `split_string` implementation
  (#commitLink("9e8f11f2f7da17c83e07d170a756d87612c42d06")).
- Remove `mfa_tries` property
  (#commitLink("7559a11af93765f9882ff063b34b1ec7697e869d")).
- Use f-string formatting in `uuid_short_decode`
  (#commitLink("db1f34406f94bdcd1a995b5e4d9cf1ad5578f395")).
- Ensure `obtain_orcid_read_public_token` always returns
  (#commitLink("ea4edd3d32e2381744744d942dee7f847fab58d0")).

#silent-section[Release notes for `v26.6` (2026-07-05).] <release-26-06>

Due to holidays and hand injuries the release slipped by a week.
It is nevertheless a solid incremental improvement over `26.5`.

The June release of 2026 consists of 40 commits made by 3 authors.

#silent-subsection[New features]

- Add Helm chart for Kubernetes deployments
  (#commitLink("412111ae736e3050e6a6073827ec1762ae447fd8")).
- Add ability to run using Waitress
  (#commitLink("9d989f58c919587d8929f80a157f356d4ca9db5d")).
- Enable configuring custom HTML on the the portal page
  (#commitLink("a2bc0f89fd9850324c4166eb12a49d029021adb6")).

#silent-subsection[Bugfixes]

- Fix bug in saving profile information
  (#commitLink("a12cabbf0039f13256f61d6a8d9e54ae0dfb4bc1")).
- Limit summary statistics to published work
  (#commitLink("f0a6b75b19962ac67445e68396a8816c379c15ed")).

#silent-subsection[Security]

- Fix path-traversal bug in OCI registry endpoints
  (#commitLink("f60f945fc1edb693c3765917925dd79a1d7f5e33")).
- Fix missing input validation in `/v3/datasets/<uuid>/authors/<uuid>`
  (#commitLink("88f8df7738e6df43b9e3002366da5de43f118063")).

#silent-subsection[Incremental improvements]

- Improve performance of reading SPARQL responses
  (#commitLink("bbf9b2de8dfee897f937cd05aacec30f6b6cd98f")).
- Refactoring
  (#commitLink("0f5cbf9a155349f8e5e92019bf6516db943edbe8"),
  #commitLink("6f41a1c4f01e59988a40ab4ba979761ac6db913b"),
  #commitLink("ed6306f278bcbb8d7b959ed2a99de5322fb92ca4"),
  #commitLink("ba7595683c1928f82c5d96728b313d2b6c762b6c"),
  #commitLink("29f83365b9d608f3f32e2b1c2ca115330722a2ac"),
  #commitLink("98ce370b5e0efc3309dc2ef165612761e7f4cb43")).
- Documentation improvements
  (#commitLink("228371c95934466b8294517185ed1622791e22f5"),
  #commitLink("29f150cc68ba6d55310027fa67e69d2fbe4a0391"),
  #commitLink("600c302b72f8b9c9b9c3b2f32c38999d82fff79b"),
  #commitLink("5dabc2d28441d8626751979a9d13f02f090bbc96"),
  #commitLink("cb86ee985ee06a591d4d04c3f4a39cd6ae1de403"),
  #commitLink("9113dbd21e17b1ed78bdedf347591c975e9dd963"),
  #commitLink("7d8132ea7ccb6e8f6a612fc96b13e879c4140156")).

#silent-section[Release notes for `v26.5` (2026-05-30).] <release-26-05>

The May release of 2026 consists of 39 commits made by 3 authors.

#silent-subsection[New features]

- Add OCI registry v2 API
  (#commitLink("199b30be5da07cbb3d77bbd60d31b0d6b0c2175c"),
  #commitLink("92760e5a05bcd466cfc77a1692b86d342d4fe4c5"),
  #commitLink("5046a01315a13f8e3c4ed33f941fd6d276ad5b02"),
  #commitLink("d88892d9aebc5c910be26ee7df01bb20768d234c")).
- Add a v3 API call to revoke API tokens from the dashboard
  (#commitLink("f5eba830e0bed146a23d285dcbea0025e3bb075a"),
  #commitLink("bda7af831862a93e5363fc72d88157bc544d9e14")).
- Add a `disable-account-creation` configuration option
  (#commitLink("524ccdf9bad97b6d6a529e466463c8a2997e5579")).
- Add a dark-mode theme to the HTML documentation
  (#commitLink("90097098e27f9b072ecac249e018fad009a0e4fe"),
  #commitLink("480b383af13a40da1dcfdf17029228053847ec73")).

#silent-subsection[Bugfixes]

- Restore logging in via an external identity provider by relaxing the
  cookie's `SameSite` attribute during the login redirect
  (#commitLink("776bbf88866b271e0d7b61b8400d252dc6848e78")).
- Prevent duplicate account records when logging in with ORCID
  (#commitLink("c5a0c63015da2ec509ae80d1c9e5e7b5dd38cb69")).
- Return the proper error in `api_v3_dataset_upload_file` instead of
  silently ignoring it
  (#commitLink("bc1cfbb8a839332062a85547c344c92f1118a812")).
- Install the systemd service file and example configuration into the
  standard system locations for distribution packages
  (#commitLink("90acbcfaf7cbce246e1b30f480e0cac4c08e1c3d"),
  #commitLink("555a0e55fc9c2c8e7d1562b0c991a2e46237ede2"),
  #commitLink("30bd6d86c019eb913a15bad9268031ec910f6526")).
- Use predictable links to chapters in the documentation
  (#commitLink("99fe2dba4113a824ce20de9a51e8195242e71626")).

#silent-subsection[Incremental improvements]

- Update project website and e-mail addresses
  (#commitLink("722238f2e8f5b8f80f017f107abe5678ac1ad6b1"),
  #commitLink("7a4fc5c538239b183883d4f85135d29531b2589a"))
- Consistently use rounded corners on chapters in the documentation
  (#commitLink("9738ff43361aa796c8ac44850bee14c0e9d56c5c")).

#silent-subsection[Technical debt]

- Remove the OpenDAP-to-DOI mapping functionality
  (#commitLink("b8d3f6240295d68964362d1365384b7afdceee45")).
- Remove obsolete endpoints, including `/portal`, `/browse`, the account
  home page, and the collection private-link delete endpoint
  (#commitLink("10f2d7912172ebfe46887d011468e3b82b7e9935"),
  #commitLink("2f479a60045d850903f1b019c5b290079a3ec36d"),
  #commitLink("4b9bbf29bff9879002e31e25f0e36a7e5760da38")).
- Finish moving `sparql_is_up` to the configuration module
  (#commitLink("9829cfed56d9b1973f3ac1b5fa935b0428182e2a"),
  #commitLink("b21f9dd5eb97d8ead25c2fc103a4c6884f97ca18")).
- Remove dead code and address linter complaints
  (#commitLink("b50bd84b84e008ffb0e11c228613d5365c67246f"),
  #commitLink("e3b8b247423d05056e17d7abf0f20ffa538dfe0a")).
- Remove the unused "AUTHORS" lock
  (#commitLink("9655448a3364c332d4b3d17c8ca0b80beaaeeded")).
- Remove a legacy license from the license list
  (#commitLink("8f72508d17cfbbcdc53fcdf80f9f29b34902999e")).

#silent-section[Release notes for `v26.4` (2026-04-30).] <release-26-04>

After a delay of 10 months, we are delighted to announce the
April release of 2026. It consists of 167 commits made by 4 authors.

This is a special moment, because this is the first release under
the new name: Seshat.  In Egyptian mythology, Seshat is the true keeper
of wisdom; the "Mistress of the House of Books," goddess of writing,
measurement, and record.  She was venerated long before Djehuty, and the
scribal domains he is now celebrated for were hers first.  She measured
the foundations of temples with her own cord and kept the archives of
what was true.  Djehuty's later fame is largely inherited renown, built
on what Seshat had already established.

#silent-subsection[New features]

- Add folder uploading via drag-and-drop in the depositor UI
  (#commitLink("de693d0e484bc4b3baced1924c67dda62c124f90"),
  #commitLink("41fa6d401022746b972ec1087cbbe68c926bc8c9")).
- Bring collection private links on par with dataset private links
  (#commitLink("6ec74fcc8bff0cbef2579fb53e8dd6ce7a5ff0d8"),
  #commitLink("337dd990a6c517331dfd57ca12bd0ae29492d5fb"),
  #commitLink("ce72a1fee5bac852f04ba8b3dd11765ecaa67810"),
  #commitLink("8133eed8143e7bf142cb4fb7951d986094edab05"),
  #commitLink("444fde680e30b91838f731d451453e1f7aa85f6c"),
  #commitLink("3a1db7b31a62f495b36a56826281056866ebecda")).
- Display banner automatically when database is down
  (#commitLink("cfeec92cf2b83b9cd3064e47c90a84b4a61637bb")).
- Add ability to build a Debian package.
  (#commitLink("9b240c39de77af338b855e78efe1afb8c4f8a9d8"),
  #commitLink("110bb308c712d465cd2c8ee4cc422de95026d33d"),
  #commitLink("339648c32abaaa8d3df347f7a081264dea66b5be"),
  #commitLink("9951c0356869d69cbc49a9676584668b42027689"),
  #commitLink("2d584f812cd329225aa8390dbfd77caa03fb4aae"),
  #commitLink("fc1d3980484070f3524ff43c975e897effe6f2a8"),
  #commitLink("4273b51d2a40516773642b6cc452d913a4b3a656")).
- Make cloud-native deployments more convenient to implement
  (#commitLink("aa4633db2da9900deac0affb9709ae557e301780"),
  #commitLink("408de87dc7082ce0e933d28f4a97b6fd5ec9c965"),
  #commitLink("9981890cace3363455c851f9702c071a76bbdcb7")).
- Document multi-instance and feature-isolation deployments
  (#commitLink("63fe1a3954e5b7f0d8168f12148c0cd4a8db4660")).

#silent-subsection[Security]

- Constrain resource usage upon cloning a Git repository
  (#commitLink("d2f0d61ec9faddc765c7db4524c10378d48a53c1")).
- Do not resolve symbolic links when producing a ZIP file
  (#commitLink("e27148dde2317d37669cf87b8b0c8af37f67302e"),
  #commitLink("96d7eed0bfc8be59a69efe5df4253c4c4b3b2321")).
- Validate the value of the "Git-Protocol" HTTP header
  (#commitLink("a0b63f501ad3021086badeca88f0551bd705c60a")).
- Avoid creating Git repository directories before input validation
  (#commitLink("0de6bba24ebf4551be72eedc3fdb51031d25a3b1")).
- Strictly validate the "order" value in 'sparql_suffix'
  (#commitLink("2bc0f0ac9167a18b037e9d7201d12da1eec7946e")).
- Prevent SPARQL injection of key in search API
  (#commitLink("42e48983c5d8c912c0df0e9d84df2fc56cf089ad")).
- Prevent SPARQL injection of faking an operator in search API
  (#commitLink("dc327f196693a58fd55f904846f186180cc39d4b")).
- Add `SameSite=Strict` attribute when setting cookies
  (#commitLink("8edd18b1141508fb84c9db9eff00d4ce1d90fdcb")).

#silent-subsection[Bugfixes]

- Restore compatibility with Python 3.9
  (#commitLink("dde1766d29c28eafa6b76fc7839e4940435abaa3")).
- Avoid creating invalid expiry dates for private links
  (#commitLink("dbf3b3e0d0d3faa6557a2cfeceacd25220667a30")).
- Clean up temporary directory of a Git clone when an error occurs
  (#commitLink("4cbb2856f37233d34279b6a57df9d2a18c6e4a3e")).
- Fix rendering of DOI in private viewing
  (#commitLink("d93ff4b3195f129e2dff2d7641c8cb7f71e19602")).
- Preserve updates on statistics upon rebuilding the database
  (#commitLink("811c5a95986cd64eed6e190c458e42a04cbeb140")).
- Restore styling of the maintenance page
  (#commitLink("5d8aa1db947623399236ed499191da6166045fef")).
- Always clean up the temporary directory when zipping a Git repo fails
  (#commitLink("9b31d5f51d929e3c1633aeb9decb2d01bcdfd444")).
- Repair ability to remove references with quotes and ampersands
  (#commitLink("ab2bd85b29c6e218e3991466a3a326d287a5cd16")).
- Avoid SPARQL FILTER bug in Virtuoso when querying private links
  (#commitLink("b584dcbee0871242364e6b47b6ee145110d6f5fe")).
- Avoid displaying error messages when querying an empty Git repository
  (#commitLink("5523164c82e904345470a6d6f56ef0e013056202")).
- Don't assume 'last_name' is set
  (#commitLink("87cabf943b3140527f3f9505371836764fff61e4")).
- Fix error message in 'api_v3_dataset_upload_file'
  (#commitLink("345c3dc657207a98b058d69410c8761ac2254e48")).
- Produce valid HTML on the dataset page
  (#commitLink("332345080fac02b740e2111eeb064227c75ceb5a")).

#silent-subsection[Incremental improvements]

- Simplify steps to install `seshat`
  (#commitLink("0a6cf96856eee63559ba8a2a8537e65d946a8db6")).
- Rename project to `seshat`
  (#commitLink("5b12bf64e494779e8fe0577c6d037a0dcac80359"),
  #commitLink("d3c2d88c030fb61f8dc7988266933e854b0b6c01"),
  #commitLink("b2901d8628cac34f2e1bb07492c9b2a517289348"),
  #commitLink("68b2cf0737f6c6b30edcb99cd021ba9373736157"),
  #commitLink("defdb8c2576df772b81a7492348ef4afae6abd15"),
  #commitLink("0abcac39d9fd66c606302f647180bbfc34b7dfb1"),
  #commitLink("379aad157a44a58b10c69aa109b15c1c6082f276"),
  #commitLink("f5bf0b6a0cb87453951fe1a98a2b680bfa72de01"),
  #commitLink("998414a456267cc290dafb7d4d8d2ab8c2020d5a"),
  #commitLink("c71577a2a608cb7f7e0193d10fe86b2b0c309dff")).
- Add a manpage
  (#commitLink("542a053d5348943ca8e4d4b9bdaa688a769092b4")).
- Migrate documentation from LaTeX to Typst
  (#commitLink("a0194d0451b6611c74c3b4fd0084ceac718b616c"),
  #commitLink("7629ff826f939e0612cf772ac1111ee4af98cc72"),
  #commitLink("932b85cc16432f7b40453d78432c8827a7fce261"),
  #commitLink("f6164b16fbad3246914c8f6de856f62c44afd31b")).
- Improve documentation theming and navigation
  (#commitLink("cbdae4306e30a2b3c67aa4fbca6e917fc33baf07"),
  #commitLink("b162e054b1d56315b6af82d95d7f14245e81ffbc"),
  #commitLink("c0ec49b47b7df4e2fb92bdc5fc40458ed84e2f34"),
  #commitLink("6890793cb8580d6a97ec225699aef32b356cd5bf"),
  #commitLink("b74da37f6fe9efb0f3031662fe90c1658adc8429"),
  #commitLink("b585cadaf63e763d8a8fc87bde51d20681c257c5"),
  #commitLink("09755468dc3a670593db00aa768e066766df5349"),
  #commitLink("1e325628bdc2941cc19d760a1aec92a4fd51d972"),
  #commitLink("fdbbdc337d5ae30ec89bcdc697c3ae6f4b16939b")).
- Update Quill to 2.0.3
  (#commitLink("86bdc5c5fa4703d2d7f7847b1007fb55f3d5b44e"),
  #commitLink("03136bed4e35c1b60b3e4133b2410b8fd4a31309")).
- Make deleting datasets and collections HTTP `DELETE` operations.
  (#commitLink("f36ae865a1b0edff393aeff93456858f68c000fd"),
  #commitLink("239b851393d19e2035c9a84b6fd3961ae69f8935")).
- Refactor inline JavaScript on the My Datasets page
  (#commitLink("0a706e3ed9d92af7a48075ae988fe60b72e9b898")).
- Reduce duplicated code for 'new_author' and 'new_funding'
  (#commitLink("83e63483466eb2b0fcc273151c8e8f492729739e"),
  #commitLink("8e7a3626425454b3106838c2b2894ccb98ebb73d")).
- Various small JavaScript cleanups
  (#commitLink("d5322b5767650c370104013c4ecfa7a848e641d0"),
  #commitLink("1928b5a52d189b718cf79fbd58da9f8b1e234a77"),
  #commitLink("ec8f82a20d57ba2496a93e687378c1c531b06b19"),
  #commitLink("72ffe9c19f89e36f5eb6dfa7787372a742d13a47"),
  #commitLink("14516add8332889a65ddf424bdf06ff54bcd9dc6")).
- Clean up HTML templates
  (#commitLink("b284b938d94a2626739313c44dc2c7a9feb20c1f"),
  #commitLink("65d9a8b68ab06ca8d1df379ad14b1c02695bfa10"),
  #commitLink("0bdf999c9b82f7f51b6d123dcde0935da5b4c940"),
  #commitLink("89065c2f0dfa810d63c7655c6d37b10517310396"),
  #commitLink("b0aca1801863b9625f542c0abd4bca2b14e41940"),
  #commitLink("2cf6823578326da3caba70cce991474059fd82d8")).
- Unify timestamp format in the WSGI layer
  (#commitLink("0e9c5cd76f16bd657750b787e7ff11f87d346e69")).
- Avoid implicit variable use in a 'map' call inside a loop
  (#commitLink("a67bf3aa5bf414b797f13f5e6c968c81282fbf9c")).
- Apply minor Python and linter cleanups
  (#commitLink("0ce3563cbb08f21f26530230229e41662a220b5f"),
  #commitLink("57a7798fdd5a01fd17b088547f7b223b039a2a5a"),
  #commitLink("13c52e8851b3164a5703ed83476ec0ae35f05437"),
  #commitLink("652c9f1d4a96376b662ffa32f9a38327275992dd")).
- Include "python-pip" in the Windows installation instructions
  (#commitLink("cc603327a94d980c5cc371b4da11909069a40c5d")).
- Directly refer to the documentation for API usage
  (#commitLink("51860bfbd735dbe7f304244b44af22a79461db27")).
- Improve the build system for RPM packaging
  (#commitLink("54ff3755079fd5e1c085986c7ffb5b4d93588482"),
  #commitLink("a476312f9d5e62c280a7bacba7d5df9e18ee8595"),
  #commitLink("1630171799519be962e71ba7de22072d299d84d7"),
  #commitLink("b95c123140eadcdb65ef2556638eab6c3236c7ec"),
  #commitLink("34f7c789fec05a99f16529c35bcab50fd8389784")).
- Improve the build system in general
  (#commitLink("6c74d8e4bee21c74cf30aaabbf59deed1a27ee13"),
  #commitLink("4ee1e78728271f92d68dc99001a27441b47836d4"),
  #commitLink("c3c52f2533108dc9e04aa8b10f96559a0e25c353"),
  #commitLink("3914b5d57d1e3166c33c9791e8aeed7f10d9f8df")).

#silent-subsection[Technical debt]

- Remove the "backup" subcommand
  (#commitLink("e688f1cd70df2928c7124fb2dea5593447786e04")).
- Remove hard-coded 4TU.ResearchData-isms
  (#commitLink("18e3e79f267c0d71bc4da59b827e5d7f0e5b5cb4"),
  #commitLink("b0bd9d974f5d8347fdb70fc989d7469361d26377"),
  #commitLink("e08c1f0197c7ed66e1013928a5ccd26d5d1eae61"),
  #commitLink("1edd40f52e83d920aa03a8545918e37aed8bd18e")).
- Link to `choosealicense.com` in help text
  (#commitLink("404f713f601276ab31b8e05991f90e6c49a8b6f3")).

#silent-section[Release notes for `v25.6`.] <release-25-6>

The June release of 2025 consists of 15 commits made by 3 authors.

#silent-subsection[New features]

- Add initial support to display a CodeWorks badge
  (#commitLink("4b3d5212b5bd0d26cd6e928b9bf9c9e23a4e4439")).
- Add auto-completion support for keywords
  (#commitLink("032445341f6a066ba15cd37579dfd866ed4948a4")).

#silent-subsection[Bugfixes]

- Return empty list upon error in #code("/v3/datasets/<uuid>.git/contributors")
  (#commitLink("5a7c70c0662f4cd2c7b3fc2a67a771e311c6512d")).
- Avoid duplicating entries in the funding autocompletion
  (#commitLink("a53887390a9bee48a2ba3bf9d76f050e4e285c49")).

#silent-subsection[Incremental improvements]

- Improve documentation (#commitLink("3458987dbb65b284334d6303615a4ef5c1c546db"),
  #commitLink("9edb43e9c09024c1195ae5cd2a4deedc837daf3e"),
  #commitLink("f15e95f9dad16a3369db42e90f04c65edb946771")).
- Improve the caching system (#commitLink("4b1c054f7dd7dd564f4de12d1bd114852b1e288b"),
  #commitLink("4cee56a6fd01226f4982c5b9378180fc7a8fd5ca")).
- Introduce permission to recalculate statistics
  (#commitLink("5c6beab7792da231c53c180c8b0be33eebdc5620")).
- Improve contrast of the "connect with ORCID" button
  (#commitLink("c1b4d1bfcc3d1074d2137119b53c7766f2fe3d2f")).

#silent-section[Release notes for `v25.5`.] <release-25-5>

The May release of 2025 consists of 14 commits made by 3 authors.

This release contains a security fix for a SPARQL injection found by Thomas
Thelen and a security fix for a HTML injection found by Anass Ksiber. Many
thanks to both for reporting and assisting in resolving these vulnerabilities.

#silent-subsection[UI revisions]

- Introduce an "Interoperability" section with links to the RO-Crate
  metadata API and the IIIF manifest
  (#commitLink("2a49687d0fab911f52b461f806dd7eadcc15df30")).

#silent-subsection[Security]

- Properly escape session cookie value
  (#commitLink("da1cbf2b15155ce4541ab7ca81f3102067fb749f")).
- Avoid possibility of HTML injection in the search page
  (#commitLink("4f479f6869a2b7eeaf7cd78832419014eddf06f8")).

#silent-subsection[Bugfixes]

- Avoid re-creating the Handle configuration
  (#commitLink("80f1f2e3e06b2b85cede6b17e75793bb0ab2d670")).
- Ensure the v2 API respects the depositing-domains property
  (#commitLink("45941d2d9217ff2c389a0072002249dac64c5645")).
- Don't show file metadata for restricted datasets in RO-Crate
  output (#commitLink("b81c730ec7d36e88f3cb4461c2920c5ec2d79f6c")).
- Improve render quality of PDF files in the IIIF Image API
  (#commitLink("6556bf2ff6d7dd57ea8630199e7738dfbd49686f"),
  #commitLink("ffb35961a7bc24477913ca428c44001543342e8a")).
- Document acceptable parameters for various API endpoints
  (#commitLink("b5dea019bcaaa1e3beae643ab8ed4c8776e0e532")).
- Distribute missing files in the release tarball
  (#commitLink("76b29514e469a28ad3bfc080a2711672aa0f3765")).

#silent-subsection[Technical debt]

- Simplify the #code("dist-docker") target
  (#commitLink("7b08aae0f3c44447869d7dab53bbb65678ce3747")).

#silent-section[Release notes for `v25.4`.] <release-25-4>

The April release of 2025 consists of 51 commits made by 4 authors.

#silent-subsection[New features]

- Implement IIIF Presentation API
  (#commitLink("1eb35f4f424e379462a34a9f032a14d74892d052"),
  #commitLink("b052e5dc7a0a469a5f49d3d6d035fe45f37b4dc5"),
  #commitLink("9dca2ffa5dfec843bfde15a3c61eacdfd3d38ecb"),
  #commitLink("68f2bbacd960aae7a7bbb185562033c78dc191d2"),
  #commitLink("ed0a39e19ea25709cb577ecfb7f41e4d4e004433"),
  #commitLink("8f975910f69b9e4f484eefaf59e02e7a9b5ca527"),
  #commitLink("ce43c4590a3668e10bc0826cd5925169d235cc7f"),
  #commitLink("a4b43cdd778402ad890b48ad42b77f2965d377cc")).
- Implement tiles property for IIIF Image API
  (#commitLink("e9453e1ec43514a2fc1a7a6256ee17203f38a82a")).
- Implement #code("static-resources-cache") option
  (#commitLink("1529d961aa833fb388809ebb02c6e2d0455411d4")).

#silent-subsection[Security]

- Harden the `Content-Security-Policy` as an extra layer of defence against
  cross-site scripting (#commitLink("3c2c5329089a41d2f4637fed9c0c1de19c5669ef"),
  #commitLink("ce428d824c0f7e30a85054970f62fa0734011d26"),
  #commitLink("4a1abf60e94e07ff6db748c447dc1ed1508a33a5"),
  #commitLink("da39ace8eec25d3a4646b288c2d9156022fd7063"),
  #commitLink("1bcc4f92dbda97bd38328c2f00c843996d3c9418"),
  #commitLink("13c06ef7bd5465adeda52e8fff9fe8d0620547c1"),
  #commitLink("b5434f969275314f4180f28fcf88de1bf1b79c3b"),
  #commitLink("7a157070a9ffcf62e5d0426dbc21ee405248a274"),
  #commitLink("9d84583c80ec001f461bf113bfc52c5045bb3c39")).

#silent-subsection[Bugfixes]

- Ensure ZIP files of Git repositories are bit-reproducible
  (#commitLink("586c3045883c2b13ebec1c6a7aa88f740b39f40e")).
- Fix alignment of search results when viewed as a list
  (#commitLink("2463ebbcff89e8ddb18c06925b2dcfa6520af938")).
- Document the institution API endpoints
  (#commitLink("fc27ddf7ab963c964d7ebcbb2e2803f780de19e7")).
- Show reviews for institutional reviewers based on the group rather
  than accounts (#commitLink("6ef0eca6c4c498c651e25e3f178dd1dec9e1c91e")).

#silent-subsection[Technical debt]

- Code clean-ups (#commitLink("02ce6b383d2f83cbdb04daaa212f27f4dd0633ba"),
  #commitLink("a1e7c2fe62c0011a214fc7e7edb999ffade3463a"),
  #commitLink("1a3adcfccc8f309d17815f00a51559bf75a9412a"),
  #commitLink("c61f2724723965f4783a1af7ae86e3218e7bcce0"),
  #commitLink("9d6307afa163954ad496007306f65c921ea6773e"),
  #commitLink("a4e5b38a75a019d09b6175a3fc485c16496a4c31"),
  #commitLink("e60e6f3734bc8ec8d32b8d92d0fd375a57aa44e9"),
  #commitLink("51817a2b540adb44bd1b1db8d17b90b3f20f529b"),
  #commitLink("96d338254309ae683935fe9d423a59c0cc39cecd"),
  #commitLink("2de1e417fbc658b79e1f3ba6fb1406fc7cc7c044"),
  #commitLink("35afe28e959f3275489223f028d8d33f2e91e2da"))

#silent-section[Release notes for `v25.3`.] <release-25-3>

The March release of 2025 consists of 57 commits made by 2 authors.

This release contains various bugfixes, minor UI revisions, minor feature
updates, and contains the foundation for an extra security layer to prevent
cross-site scripting vulnerabilities.

The release date slipped a couple of days because yours truly wanted to
give last-minute changes a little bit of time to make sure no regressions
occurred before formalizing the release.

#silent-subsection[New features]

- Implement API endpoints for reviewers
  (#commitLink("1de7f680840ec882752de1fe53004a4bed16f568"),
  #commitLink("038e931b96eeabb72d4f0c305c0dc0ee2afab696"),
  #commitLink("2f5963553910929ef479eadeb1c770780fd8df93")).
- Report number of search results in the #code("/v2/articles/search") endpoint.
  (#commitLink("a8917a837e9d5d70a618ff50fd29bb7cc959febd")).
- Add #code("SoftwareSourceCode") to RO-Crate output
  (#commitLink("79cf0b32ada27780ef0efadc0d20556c8717eb84")).

#silent-subsection[UI revisions]

- Revise the "Cite" and "Collect" buttons on landing pages
  (#commitLink("b0b9dbd1f21e1aec464985daff7c5af100bc5346")).
- Remove the need for a "save URL" button in the dataset metadata form
  (#commitLink("a853085c98417bcfe8b50d0e41e56a61ef31456e")).
- Revise the versions drop-down menu on landing pages
  (#commitLink("e5b89ce23eec6e1284a22db4802d05e459f29454")).
- Fix tile scaling on the main page for different zoom levels
  (#commitLink("7a30bfa47ef1c3977180dcc4b0ec31f7ff06e89a")).

#silent-subsection[Security]

- Addressed a Cross-Site-Scripting vulnerability in the search functionality
  (#commitLink("40b12a5597407a3d67eec5a5cb570d0725197d92")).
- Only display e-mail address of authors to the creators of such records.
  (#commitLink("05a56fa18367da28e2366a90e92a43af4639dc5f")).

#silent-subsection[Bugfixes]

- Fix author ordering for collections.
  (#commitLink("244017a014a4b4d36c8b4d21709996fdf24af635")).
- Fix bug in cached responses in the IIIF Image API implementation
  (#commitLink("88d68c78783a654864e4264c6b60a01793d58e44")).
- Fix bug with proportional scaling in the IIIF Image API implementation
  (#commitLink("05d5c7a8550e63c395a75c73b873b1b70c08bedd")).
- Fix various bugs with rendering HTML entities and tags.
  (#commitLink("d3667ed8bcee0028ceee945351af1182d67d3e99"),
  #commitLink("3b19d7de8c647be71708252c6de123a93fecc327"),
  #commitLink("08e4fc77a90b780b491ca9aa701fa758b43f4a5a"),
  #commitLink("3a1f3dde5e0e72518c2860afeda8c45eca112e6f")).
- Avoid a divide-by-zero situation with quota usage calculation
  (#commitLink("cefde15ddb393507004e7f69d8c2658650a88fa2")).
- Fix creating datasets with repeated fields using the v2 API
  (#commitLink("74fe025dbc8b6369920ee7a5fe2f3cea35b2e358"),
  #commitLink("87127c1f818110d68644e668388f1c61535f5525")).
- Fix setting default fields when creating a dataset using the API
  (#commitLink("7f183389d608121c46cd168cbe40681b72789f71")).
- Fix returning Git statistics for empty Git repositories
  (#commitLink("be3630a63cfc3f933be9b130b0825602d5898e98"),
  #commitLink("2cffe955a2f4a95afb56cb41016559fbce8bbc53"),
  #commitLink("c3227a768dd1cd476105f8a86e1de3a752af336f")).

#silent-subsection[Technical debt]

- Work towards a stricter Content-Security-Policy by avoiding inline use
  of #code("style") attributes, #code("script") elements, and event handlers
  (#commitLink("b862fdf3d558e9ef030f36ce34d2564999fd94c6"),
  #commitLink("18b3bbe3e721f0154365fb0ed1252620b516fe8d"),
  #commitLink("f08542ecb8f554950bd8387b01b16640cfc70935"),
  #commitLink("1c248a1e238b0fc4bce3766fb7a196d631beec95"),
  #commitLink("99cf348f833b2180425778f900d280d83706dee1"),
  #commitLink("7524bbbd26f4ecee67165d44437b2ad41f1d5919"),
  #commitLink("4d6696335e3fb8a2e01d4b3b5d9176b70c8190be")).
- Avoid hard-coded versions in the documentation for the RPM download links
  (#commitLink("21be87dc0efdf5615eefe339ee1ae9c67df6e0c2")).
- Avoid repetitive text in the documentation by using macros
  (#commitLink("088f8a13cf79b47adb731b3d24c672695198c863"),
  #commitLink("f3dc9c8cd6a84af0c830fcc905d73eaef03828bc")).
- Build Docker images with C development libraries to work around
  "xmlsec" build issues.
  (#commitLink("2c03cb3cb02bfc85279986f7508291349bf5c609")).

#silent-section[Release notes for `v25.2`.] <release-25-2>

The February release of 2025 consists of 75 commits made by 2 authors.

The major new features in this release are initial support for RO-Crate
and direct support for S3 buckets. The release was delayed to include an
important security fix for a Cross-Site-Scripting vulnerability found
by Aaron Liebig. Many thanks for reporting and assisting in resolving
this vulnerability.

#silent-subsection[New features]

- Implement initial support for RO-Crates
  (#commitLink("5ffee87a7b9cfefacea984deb4c78f5007581e8e"),
  #commitLink("96ee261fff36d08e7a2bd2f882a7a7e98d434c75")).
- Implement support for S3 buckets via #code("boto3")
  (#commitLink("1077e2503c1e9e338849c5dee250a1e6483137b4"),
  #commitLink("67fe48dbc538d2f00bf687504451e60611021287"),
  #commitLink("2e5394b417518efbff5accbbe06f65cf7ba896cb"),
  #commitLink("09e20e40551404e0957f1fd2f742ffa156442294"),
  #commitLink("30209a7544a35d2da700e8f02d86f30bcb651082"),
  #commitLink("7e6d147fce19329126c91f2a056070d54e1b093f")).
- Implement ability to extract/replay log entries
  (#commitLink("a5a2c090389776346944b47554c129f4e686f97e")).

#silent-subsection[Security]

- Addressed a Cross-Site-Scripting vulnerability
  (#commitLink("38e89a0c8ef351bdb524ff8bcb30b44b3ba8d04f")).

#silent-subsection[Bugfixes]

- Improve rendering for accessibility
  (#commitLink("a3e456cf172c52b41b071133d9d71883e606c786"),
  #commitLink("7cb7654fcb751cd303bf447abde95a7b57f36d7c"),
  #commitLink("11bba959809595d1fc233be6ddd3cba4575a97fc"),
  #commitLink("c74ef45f1523a4e0a4905021a31996a40e4ced97")).
- Apply user interface updates
  (#commitLink("b2c213ac9db2d306c8c874c0c8d60367414ba33b"),
  #commitLink("3f13e0c7592125911e9d1dfe442c13c80f2e8c1b"),
  #commitLink("98606dfcc2e8ddf5d8574f7476b13dd688c314cf"),
  #commitLink("858f7b7aa5dca16bf3a1043e581f16b42951a569"),
  #commitLink("d4db446034d81d9961ea2e4d888a1d685dbde2ab"),
  #commitLink("c327f196f6f2eed3cbbad4d1f3c2136a3cb5898c"),
  #commitLink("22107051ea5a31a8c3e5488f59936baee782b7a1"),
  #commitLink("c87550cc5a176c0d9b706f6da6ee8de2c907a83d"),
  #commitLink("6642dcf94bd118659cd0541485dbc032b3497561")).
- Enhance the documentation
  (#commitLink("57192bbb83aec6512dbcbdf4c26203ebe18fe099"),
  #commitLink("3a864f07a09e9d16997208b5cb32b6aedc7c18e4"),
  #commitLink("be65be335b4807bedbc89f6b1ed5683969001a3a"),
  #commitLink("ea4e623dbe2dd66091595cdb551cb6a32e175c75"),
  #commitLink("1c6267ec4e4c21c66344b3ad1481049743542259"),
  #commitLink("8d4d81266a2efc210d74bbe5e923821fb9cd278d")).
- Show precise error messages when input validation fails in the
  edit-dataset and edit-collection forms
  (#commitLink("bfd2110f7a5de061cc9921ef4c184be433fbbab3")).

#silent-subsection[Technical debt]

- Remove #code("urllib3") as explicit dependency
  (#commitLink("672eaff0c058b3e71dabed0161faf505a5beb141")).
- Prevent comments in query templates from being sent to the SPARQL
  endpoint (#commitLink("9ac703556e8f20a36c1fda6f5b77e165695e9001")).

#silent-section[Release notes for `v25.1`.] <release-25-1>

The January release of 2025 consists of 85 commits made by 3 authors.

In this release we included an RPM package for Enterprise Linux 9. This RPM
depends on packages in the
#link("https://docs.fedoraproject.org/en-US/epel/")[Extra Packages for Enterprise Linux (EPEL) repository].

#silent-subsection[New features]

- CodeMeta API output is more complete
  (#commitLink("91ed59d8650f70022131ede59d388bb1a5b76cd0"),
  #commitLink("860edfec55ffa24be3609bc24c87a78e70587236"),
  #commitLink("3f150a246a4978d51df0ab658cba42c78a3b26a2"),
  #commitLink("5daa47e5f97a39cf2dc27eceb8314de0d0284b62")).
- A second port to bind the web service on can now be configured
  (#commitLink("dff68a6d6bbf3f7548803857deeb1adb6cf9f320")).
- Enable searching by author (#commitLink("18a242fcde0f0bfa6036021c20d4eca91602d5a8"),
  #commitLink("fe09578657d71894cec45cad36b4a62c10165a8b")).
- Enable institution reviewing (#commitLink("cbd1092cccfacaf8d3191d1130fc1b34154b555b"),
  #commitLink("cb67f83bfa4749c3c468b430efe82f3fb4c34efc")).
- Improve indexability by search engines
  (#commitLink("cc58483902f0760673c2a91567991b18829b112a"),
  #commitLink("20fe6fd9a5c6952af9368eae00755cc248c3c0a1")).

#silent-subsection[Bugfixes]

- Related versions of a dataset are communicated to DataCite
  (#commitLink("1539117be2a7679bafa5a94366f79a832bd759c1")).
- HTML output of the documentation is responsive to browser widths
  (#commitLink("934ed9310f1153960b95aff4944a0a729d153549")).
- Restore ability to create new collection versions
  (#commitLink("545de472c734161d223d94aa61b0d025eea07fec")).
- Display embargoed datasets in the search results
  (#commitLink("c86dcf85bee8af42988346cc12511341f1d3c6fc")).
- Fixed building RPM packages (#commitLink("1f629fa0d0ea5acbb45b1ea5652f9cfe8bc431f3"),
  #commitLink("e4c10571a8da9c6b5c63e48d3bd1bce700ab0311")).
- Fixed HTTP `PUT` behavior for `/v2/account/collections/<id>/articles`
  (#commitLink("107ea693e170689b83213e668f9e75b59f9348c3")).

#silent-subsection[Technical debt]

- Unified the development environment instructions between GNU/Linux,
  Windows and macOS (#commitLink("8921d35c1a0909e331b4737b6c0bb6713fb77743"),
  #commitLink("ca9b5831c19948f098106917c34bc4ff383543d2")).
- Run-time configurable properties are stored in a separate module
  (#commitLink("a8e353db6e29342adb038950eacf350e89dda7bf")).
- Improve error handling (#commitLink("bdf77edd810bb9d22c111b11e34e265c3e286f31"),
  #commitLink("23c3b53d297b11bacab08d2436b723637773a78d"),
  #commitLink("609c9864e357101f39e0dfb8cfc0b045889d9d17")).
- Embed simplified 'zipfly' (#commitLink("0fe0904a2aa25fc19094ee2c57a1b1d6fda4b4ad")).

#silent-section[Release notes for `v24.12`.] <release-24-12>

#silent-subsection[New features]

- Add specific logging for when the server would respond an HTTP 500 error
  (#commitLink("1dcd141f7c75e82a5f970d0ac8ddba7e8915bf9c")).

#silent-subsection[Bugfixes]

- Fix a problem with downloading Git repositories as ZIP
  (#commitLink("a8c2da4c544b10a493d67c515a5fca191222ba29")).
- Avoid returning an internal server error when using paging in the API
  (#commitLink("2629ef56ff43946067edf7e147f48867830691f6")).
- Fix lay-out bug on the landing pages
  (#commitLink("a3ff6a54ee80359ad3d2299e968ab28766b86505")).
- Fix bug when filtering on groups in the API
  (#commitLink("187f4344f5d0e50bcf7063f28dda9bfccc8229ae")).

#silent-subsection[Technical debt]

- Refactor parts of the codebase (#commitLink("0370836d5bdff62f04f5815893658284aff3ca48"),
  #commitLink("dd7602a66691840ffe6c2d444a36dd4256c23627"),
  #commitLink("aa8eda2fc0b5cf65cd38d4002d358e65312a845d"),
  #commitLink("3fb51635c82ad612681db5a3244d93e62cd8f616"),
  #commitLink("dd6ccca45a7505b96e002a2bb79fc75b5384570c"),
  #commitLink("58c1fcedcec678d27c1d0daf9559dfab45fdb8f6"))
- Reduce build-system files (#commitLink("e73966fede6e1e2fc8ea2256f107b650a23400a0")).
- Bump the minimal required Python version to 3.9
  (#commitLink("208c7e08f6162fd78a456079e079d5f609f67e68")).
]

#render_chapter(chapter_text, "News")
