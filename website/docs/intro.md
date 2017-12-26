# Gentle introduction to Lexonomy

[Lexonomy](/) is a free tool for writing and publishing dictionaries and other dictionary-like things. Lexonomy runs in your web browser and all data is stored on the server, so you don't have to install anything on your computer. This page will give you a brief introduction to Lexonomy, showing you how to create a simple dictionary and how to publish it on the web.

Creating a new dictionary
----------------------

First of all, you need to sign up for a Lexonomy account. [Go here](/signup/) to find out how. Once you have an account you can log in by clicking on *anonymous user* in the top-right corner.

![Screenshot](/docs/01-01.png)

When you're logged in, the Lexonomy home page has a section titled *Your dictionaries*. That section is empty at first but there is a link to create a new dictionary.

![Screenshot](/docs/01-02.png)

Don't be shy about creating a new dictionary, you will always be able to delete it later and you can create as many as you want. Also, your dictionary will not be publicly visible until you decide you want it to be. If this is your first time doing this, it is recommended that you select a template in the drop-down list, such as *simple monolingual dictionary*.

![Screenshot](/docs/01-03.png)

Voilà, your dictionary is ready! Click the URL to go to its homepage.

![Screenshot](/docs/01-04.png)

Editing entries
---------------

Click the *Edit* link on your dictionary's homepage and you will be taken to Lexonomy's editing interface. This is where you create and edit entries.

![Screenshot](/docs/02-01.png)

There is a list of entries on the left-hand side. If you had selected a template while creating your dictionary, you will see one or two sample entries here that have been created for you automatically. You can delete the sample entries if you want, and you can create as many new entries as you want. There is no upper limit to the number of entries your dictionary can contain. But for now, click one of the sample entries to see it displayed.

![Screenshot](/docs/02-02.png)

What you're looking at here is a pretty-printed rendering of the entry. This is what it will look like if you decide to make your dictionary public later. To edit the entry, click the *Edit* button at the top.

![Screenshot](/docs/02-03.png)

Now it gets interesting! What you have here is the underlying structure of the entry, with things like headwords and senses and parts of speech marked up explicitly with XML (Extensible Markup Language). You don't need to be an XML expert to use Lexonomy, but you do need to understand that every entry in Lexonomy is a small XML document which consists of **elements**. Each element has a name such as `headword` and consists of an **opening tag** such as `<headword>`, a **closing tag** such as `</headword>`, and text or other elements between them. The tags are there to tell us what the various pieces of text mean. You can click on any piece of text between tags and a textbox will appear allowing you to change it.

![Screenshot](/docs/02-04.png)

Sometimes, when you click on a piece of text between tags, you will be given a choice from a list instead of a free-form textbox. This is because Lexonomy knows what is supposed to go inside each element and acts accordingly.

![Screenshot](/docs/02-05.png)

If you do something Lexonomy doesn't like, such as leaving the text inside an element blank, Lexonomy will tell you by displaying a little warning triangle. You can click the warning triangle to read a description of the error.

![Screenshot](/docs/02-06.png)

Besides clicking on text, you can click on the element names themselves. A menu will come up listing all the actions you can perform on that element. This is how you add new examples to senses (more accurately: new `example` elements inside `sense` elements) and so on.

![Screenshot](/docs/02-07.png)

Notice how Lexonomy always only offers you choices that "make sense": it lets you add new examples inside senses but not inside other elements, and so on. This is because, again, Lexonomy knows what an entry is supposed to be structured like and makes sure the structure is always adhered to. This may sound limiting but it isn't, it promotes consistency: all your entries will be guaranteed to have the same structure. And besides, you can decide yourself what the structure is supposed to be. That's what we will get to next, so keep on reading.

Configuring your dictionary
---------------------------

Click the *Configure* link and Lexonomy will take you to its configuration interface. This is where you can set up various things that affect the entire dictionary.

![Screenshot](/docs/03-01.png)

One of the things you can change is the dictionary's name and description: you'll find those under *Name and description* (logically enough). Don't forget to click the *Save* button if you change anything there!

![Screenshot](/docs/03-02.png)

Another thing you have control over is who has access to the dictionary and who can make changes there, beside yourself. This can be found under *Users*. You will see your own e-mail address listed there. This means that you have access to this dictionary. To add another user, type their e-mail address into the text box and click *Add*. Again, don't forget to click the *Save* button afterwards.

![Screenshot](/docs/03-03.png)

Once you've saved the user list, any users on that list will have access to your dictionary – provided they have a Lexonomy account. The next time they log in, they will see the dictionary listed under *Your dictionaries* on the Lexonomy homepage.

Users can have different privileges and you can control what those are. That's what the checkboxes uderneath the e-mail addresees mean: by ticking them on or off, you grant or deny access to the four sections of Lexonomy: *Edit,* *Configure,* *Download* and *Upload*. Be careful about *Configure:* users who have access to this can do what you're doing now, which means they could even remove you as a user or downgrade your access privileges. If you have a team of people collaborating on a single dictionary, it's a good idea that only one of them has access to the configuration interface.

Configuring the structure and formatting of entries
---------------------------------------------------

Another thing you have control over in the configuration interface is the structure of entries: what elements are allowed to be there, what content is supposed to be inside them and so on. You'll find all that under *Entry structure* in the *Configure* section.

![Screenshot](/docs/04-01.png)

You may get the impresion that this part of Lexonomy is overwhelmingly complex. Don't let that bother you, it's not for beginners. If you have started your dictionary from a template, everything here has already been set up for you and you don't need to come near it. If, on the other hand, you have worked with XML Schemas or DTDs (= Documents Type Definitions) or similar things before, you will find this familiar: Lexonomy's formalism for specifying the structure of entries is about as expressive as a DTD.

A similar surprise (or non-surprise perhaps) awaits you under *Entry formatting* (we're still in the *Configure* section). This is where you tell Lexonomy what your entries should look like to the end-user: which parts should be in which font and so on. If you have worked with CSS (= Cascading Stylesheets) or XSL (= Extensible Stylesheet Language) before, you will be at home here. If not, leave the worrying to us and start your dictionary from a template.

![Screenshot](/docs/04-02.png)

One last warning before we move on. At the beginning of your project when the dictionary is empty, you can change the entry structure as much as you want. Later on, though, once you've created some entries, you need to tread carefully. Don't make changes that would disturb entries you've created already. For example, do not rename elements that are already in use in the entries, and do not change the hierarchy of parent and child elements. That would cause your existing entries to become "invalid" (there will be warning triangles everywhere) and you will have to correct them manually one by one. The rule of thumb is, do add but do not take away.

Publishing you dictionary
-------------------------

Lexonomy is not just a tool for writing dictionaries, it is a tool for making dictionaries publicly available on the web too. Doing that is almost effortless, you just need to change a few things in the configuration: go into *Public access* in the *Configure* section and change the access level from *Private* to *Public*.

![Screenshot](/docs/05-01.png)

From the moment you click the *Save* button, your dictionary will be publicly viewable.

![Screenshot](/docs/05-02.png)

When you visit the dictionary's homepage now, you will notice that it has changed: it now contains a searchbox and a few other things that allow people to search and browse the dictionary.

![Screenshot](/docs/05-03.png)

You can of course change the dictionary back to *Private* any time. One thing you need to be aware of is that when making a dictionary public, you're making it available under an open-source licence. The exact type of licence is up to you and can be selected in *Public access* in the *Configure* section, as you've probably noticed. All the options available there are open-source licences which allow other people to reuse your data freely, without the restrictions of copyright (the only thing they are legally required to do is acknowledge you publicly as the author of the data). This is a trade-off Lexonomy asks you to make: you can use Lexonomy for free and there are no restrictions, but in return, you must make your data available freely to the world.

Conclusion
----------

This brings us to the end of this introduction. Lexonomy has a number of other features which we did not cover here, of which the most important is the ability to download your entire dictionary (under the *Download* link). It is a good idea to this regularly, as a form of backup. If for any reason the server failed and your data got lost, you would be able to recover everything from your latest download. Do bear in mind that Lexonomy doesn't provide any guarantees and we do not make any backups on the server, so it is up to you to take care of that.

Another interesting feature is the ability to upload existing data into Lexonomy instead of creating all entries by hand. This is available under the *Upload* link. It is an advanced feature, though, and you would be well advised to shy away from it unless you know exactly what you're doing. The data you're uploading must be in XML and must comply exactly with the entry structure as specified in your configuration.

And finally, a feature you will probably come to appreciate later is that your Lexonomy dictionary can be paired up with [Sketch Engine](https://www.sketchengine.co.uk/), a popular corpus query system. Lexonomy has a feature which allows you to "pull" example sentences and other things from a Sketch Engine corpus and, vice versa, Sketch Engine has a feature that allows you to "push" an entire pre-generated dictionary into Lexonomy (and then post-edit it there). You will find options for configuring all that in the *Configuration* section.

In the unlikely event that you haven't had enough yet, you can read more about Lexonomy in the paper [Introducing Lexonomy: an open-source dictionary writing and publishing system](/docs/elex2017.pdf). But most importantly, keep building great dictionaries!
