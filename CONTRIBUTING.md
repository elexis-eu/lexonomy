# Contributing to Lexonomy

We would be delighted if you contribute to Lexonomy and make it even
better than it is today!

- [Question or Problem?](#question)
- [Issues and Bugs](#issue)
- [Feature Requests](#feature)
- [Submission Guidelines](#submit)
- [Coding Rules](#rules)
- [Commit Message Guidelines](#commit)
- [Signing the CLA](#cla)
- [Code of Conduct](#coc)


## <a name="question"></a> Got a Question or a Problem?

Do not open issues for support questions, as we want to keep GitHub
issues for bug reports and feature requests. You have a much better chance of
getting an answer to your question on the [elexis-lexonomy Google
Group][elexis-lexonomy-group].


## <a name="issue"></a> Found a Bug?
If you find a bug, you can help us by [submitting an issue](#submit-issue) to
our [GitHub Repository][github]. Even better, you can [submit a Pull
Request](#submit-pr) with a fix.


## <a name="feature"></a> Missing a Feature?
You can *request* a new feature by [submitting an issue](#submit-issue) to our GitHub
Repository. If you would like to *implement* a new feature, please submit an issue with
a proposal for your work first.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker, maybe an issue for
your problem already exists and the discussion might inform you of workarounds
readily available.

Before fixing a bug we need to understand and confirm it. In order to
understand bugs, we will ask you to provide necessary information. 

You can file new issues by selecting from our [new issue
templates](https://github.com/elexis-eu/lexonomy/issues/new/choose) and filling
out the issue template.


## <a name="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as
you are working:

* We follow the following style guides
  - [JavaScript standardjs.com Style][js-style-guide] for JavaScript
  - [PEP 8 - Style Guide for Python Code][py-style-guide] for Python
* Features or bug fixes **should be tested** by one or more specs.
* All public API methods **must be documented**.


## <a name="commit"></a> Commit Message Guidelines

We have a few ideas about how git commit messages should be formatted. We
think, this leads to **more readable messages** that are easy to follow when
looking through the **project history**. We also use some git commit messages
to **generate the [change log][CHANGELOG]**.

### Commit Message Format
Each commit message consists of a **subject**, a **body** and a **footer**.

```
<subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message should not be longer 100 characters! This allows
the message to be easier to read on GitHub as well as in various git tools.

[Samples](https://github.com/elexis-eu/lexonomy/commits/master)


### Subject
The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* do not capitalize the first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not
"changed" nor "changes".  The body should include the motivation for the change
and contrast this with previous behavior.

### Footer
The footer should contain a [closing reference to an
issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if
any.


## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull
requests. The CLA must have been signed for code changes to be accepted. 
It won't take long, we promise!

* [For individuals][individual-cla].
* [For corporations][corporate-cla].


## <a name="coc"></a> Code of Conduct

Help us keep Lexonomy open and inclusive. Please read and follow our [Code of Conduct][coc].


[elexis-lexonomy-group]: https://groups.google.com/forum/#!forum/elexis-lexonomy
[js-style-guide]: https://standardjs.com/rules.html
[py-style-guide]: https://www.python.org/dev/peps/pep-0008/
[CHANGELOG]: https://github.com/elexis-eu/lexonomy/blob/master/CHANGELOG.md
[individual-cla]: FIXME
[corporate-cla]: FIXME
[coc]: https://github.com/elexis-eu/lexonomy/blob/master/CODE_OF_CONDUCT.md
