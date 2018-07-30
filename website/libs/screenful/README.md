# Screenful

`Screenful` is a set of JavaScript-and-CSS templates you can use to rapidly build web-based front-ends for editing arbitrary records in an arbitrary dataset. I use it in my own projects such as [Lexonomy](http://www.lexonomy.eu/) and [Ardán](http://ardan.gaois.ie/) and it cuts my front-end dev time from days to hours. Existing applications include a UI for editing dictionaries, a UI for editing a database of digitized photographs, and a UI for editing a database of people.

Examples:

- `Screenful.Navigator` is a template for a UI in which you have a list of entries on the left-hand side of the screen and an editor on the right. Your users can navigate around the list of entries and click on them to open them in the editor. You have to configure the UI with a few lines of JavaScript and provide a server-side hookup, `Screenful.Navigator` takes care of the on-screen interactivity and all the behind-the-scenes AJAX calls.

- `Screenful.Editor` is a template for a UI in which your user edits a single entry. It is typically used as an iframed editor inside `Screenful.Navigator` but can be used on its own too. You need to provide a server-side CRUD interface (*Create Read Update Delete*) and a few lines of JavaScript for configuration, `Screenful.Editor` takes care of everything else.

Screenful is work in progress. Check back later when I've found the time to write some proper documentation. In the mean time, you can look at the examples in the `test` directory to get some idea.
