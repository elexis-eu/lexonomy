#!/usr/bin/python3

from collections import defaultdict
import datetime
import itertools
import json
import os
import os.path
from pyexpat import ParserCreate
import sqlite3
from sqlite3 import Connection
import hashlib
import random
import string
import smtplib, ssl
from typing import Any, Callable, Iterable, List, Literal, Optional, Tuple, TypedDict, Union, Set
from typing_extensions import NotRequired
import urllib
from bs4 import BeautifulSoup, Tag
import shutil
import markdown
import re
import secrets
import pathlib
from icu import Locale, Collator
import requests

class ConfigTitling(TypedDict):
    headword: NotRequired[str]
    """(xema) Element ID whose text to use as entry headword. Use the first text content in the entry if not supplied"""

    headwordSorting: NotRequired[str]
    """(optional) alternative (xema) ID for element to use for sorting."""

    sortDesc: bool
    """invert sort order?"""

    numberEntries: int
    """number of entries to load in the sidebar by default. defaults to 1000 (when frontend generates config)"""

    locale: str
    """collator locale to use for sorting"""

    headwordAnnotationsType: Literal['simple', 'advanced']
    """"Which of headwordAnnotations or headwordAnnotationsAdvanced to use. If advanced and headwordAnnotationsAdvanced is empty, fall back to normal headwordAnnotations property"""

    headwordAnnotations: NotRequired[List[str]]
    """List of element IDs (not names!) whose text to put in the entry's title"""

    headwordAnnotationsAdvanced: NotRequired[str]
    """a format string like "<some_html>%(element_name)</some_html><some_more_html>%(another_element_name)</some_more_html>"
    %() escape-codes will be substituted with the text contents of the first element with that name in the entry"""

class ConfigSearchability(TypedDict):
    searchableElements: NotRequired[List[str]]
    """List of element names whose text to extract and index as searchable strings for entries"""

class ConfigLinksEntry(TypedDict):
    """Elements listed here can be used as target of cross-reference link.
    For each element, specify unique identifier in the form of placeholders <tt>'%(element)'</tt>.
    Eg. element <tt>entry</tt> can have identifier <tt>%(lemma)-%(pos)</tt>, element <tt>sense</tt> can have identifier <tt>%(lemma)-%(number)</tt>.
    Optionally, specify element you want to show as preview when selecting links.</p>"""

    linkElement: str
    """Element name .e.g. "entry"""""

    identifier: str
    """a format-string with sequences like %(element_name)"""

    preview: str
    """(optionally) element you want to show as preview when selecting links."""

class ConfigFlaggingEntry(TypedDict):
    key: str
    "Keyboard shortcut" # TODO document format
    name: str
    "Value in the flag element e.g. \"unpublished\""
    label: str
    "User friendly label"
    color: str
    "Css color string, usually in the format of #RRGGBB. Color of a small icon next to entries with this flag in the entry list."

class ConfigFlagging(TypedDict):
    flag_element: str
    "Name of the element in which to store the flag. Element doesn't have to exist, if it doesn't the entry does not have a flag."
    flags: list[ConfigFlaggingEntry]

class ConfigXemaElementChild(TypedDict):
    min: int
    max: Optional[int]
    name: str
    """An ID in xema["elements"] where the child info is held."""

class ConfigXemaAttributeValue(TypedDict):
    value: str
    caption: str

class ConfigXemaAttribute(TypedDict):
    optionality: Literal["optional", "obligatory"]
    filling: Literal["txt", "lst"]
    values: Optional[List[ConfigXemaAttributeValue]]

class ConfigXemaElement(TypedDict):
    elementName: Optional[str]
    """When supplied, use this as xml tag instead of the key in the xema["elements"].
        This can be useful when the xml contains elements with the same name that require a different configuration.

        E.G.:
        xema = {
            elements: {
                some_element: { }, # no name is set, so we use the key as xml element: <some_element>...</some_element>
                some_other_element: { elementName: "some_element" } # now we have an elementName property, so use that: <some_element>...</some_element>
            }
        }

        But now how to know which ID matches with an element, since multiple configured elements can set the same elementName?
        Check the parent. Only one of a parent children (i.e. siblings) should ever have a given elementName.
     """
    filling: Literal["inl", "txt", "chd", "emp"]
    values: List[str]
    children: List[ConfigXemaElementChild]
    attributes: dict[str, ConfigXemaAttribute]


class ConfigXema(TypedDict):
    root: str
    elements: dict[str, ConfigXemaElement]

# Keys are duplicated in the entry, using the linkElement property: so { "entry": {"linkElement": "entry", ...etc} }
ConfigLinks = dict[str, ConfigLinksEntry]
class ConfigSubbingEntry(TypedDict):
    attributes: NotRequired[dict[str, str]]
    """A dictionary containing: { [name of attribute]: "required value of attribute" } (if empty value - only prescence of attribute is checked, any value is accepted)
        The attributes property is NotRequired because this setting didn't always exist, and so it won't be there in old configs.
    """

ConfigSubbing = dict[str, dict[str, Any]] # values are empty dicts for now

class ConfigIdent(TypedDict):
    "Dictionary info: title, description etc."
    title: str
    blurb: str
    lang: str
    handle: str
    "Link to external metadata handle?. Usually empty string?"

class ConfigUsersUser(TypedDict):
    "User information in the context of the current dictionary"
    canEdit: bool
    canConfig: bool
    canDownload: bool
    canUpload: bool

ConfigUsers = dict[str, ConfigUsersUser]

class ConfigPublico(TypedDict):
    "Publishing information of a dictionary"
    public: bool
    licence: str

# Alternative syntax due to illegal key names
ConfigMetadata = TypedDict('ConfigMetadata', {
    'dc.title': NotRequired[str],
    'dc.language.iso': NotRequired[str],
    'dc.rights': NotRequired[str]
})

class ConfigDownload(TypedDict):
    xslt: NotRequired[str]
    "xslt to apply to exported/downloaded entry xml"

class ConfigKontext(TypedDict):
    url: str
    corpus: str

class ConfigAutoNumbering(TypedDict):
    """Given an element to count, and a place to put the number of occurances (or """

    element: str
    """Element to count, or where to evaluate string_template.
        Unless 'target' property is set, any contents of this element are also replaced with the result (so either the count or the evaluated string_template).
    """
    target: NotRequired[str]
    """(optional) Alternative place to put the Value, can be a child element or an attribute.
        Attributes are denoted by a leading '@', so '@some_attribute'. The attribute is added to the element denoted by the 'element' setting.
        Child elements are just the name of the target element, so 'some_child_element'.
        Element and attribute are created if missing.
    """

    type: NotRequired[Literal["string", "number"]]
    """Whether to write numbers or use the string_template to create a textual ID. Defaults to 'number'"""
    string_template: Optional[str]
    """Only used if type == "string".
        The format string to use to generate textual ids - takes the shape of %(some-element) $(@some-attribute).
    """
    number_globally: NotRequired[bool]
    """Only used if type == 'number'
        Whether to keep incrementing the IDs, or restart at 0 every entry
    """
    number_next: NotRequired[int]
    """Only used if type == 'number' and 'number_globally' == True
        The next number to output. Should be saved across runs
    """
    overwrite_existing: NotRequired[bool]
    """Whether to overwrite existing values in the target element/attribute.
        Does not apply when auto_apply = True and type = "number" and number_globally = True, as that would case ids to increase every single time an entry is updated.
    """
    auto_apply: NotRequired[bool]
    "Whether to automatically perform this autonumbering on entry saving, or only as a one-off manual operation"




class Configs(TypedDict):
    titling: ConfigTitling
    subbing: ConfigSubbing
    searchability: ConfigSearchability
    links: ConfigLinks
    flagging: ConfigFlagging
    xema: ConfigXema
    xemplate: Any # TODO add typing information.
    users: ConfigUsers
    "Keyed by user email address"
    ident: ConfigIdent
    publico: ConfigPublico
    metadata: ConfigMetadata
    download: ConfigDownload
    kontext: ConfigKontext
    autonumbering: dict[str, ConfigAutoNumbering]

# Other types
class IsoCode(TypedDict):
    code: str
    code3: str
    lang: str

class Language(TypedDict):
    code: str
    language: str

class DictionaryLink(TypedDict):
    # A little unsure about this type. Documented what was set in the function.
    sourceDict: str
    sourceHeadword: str
    sourceID: str
    "ID of an entry in the dictionary. Textual for some reason (see crossref.sqlite.schema)"
    sourceSense: str
    sourceUrl: str
    "Lexonomy URL path to the source entry, usually something like 'http://lexonomy.tld/${sourceDict}/${sourceID}'"
    targetDict: str
    confidence: float
    targetLang: str
    "Can be empty"
    targetDictConcept: bool
    "Some sort of switch that indicates what the rest of the link object represents? I.E. 'is the target a concept?'"
    targetSense: str
    targetHeadword: str
    targetID: str
    targetURL: str
    sourceDictTitle: str
    targetDictTitle: str

class ListedUser(TypedDict):
    id: str
    "user email"
    title: str
    "also user email"

class UserList(TypedDict):
    entries: List[ListedUser]
    total: int

class Historiography(TypedDict):
    uploadStart: NotRequired[str]
    "str(datetime.datetime.utcnow())"
    filename: NotRequired[str]
    "Path of the newly uploaded file (after saving as tempfile on the server) when uploading a dictionary and purging the old data."

class HistoryEntry(TypedDict):
    entry_id: int
    revision_id: int
    content: str
    "xml content"
    contentHtml: str
    "html content"
    action: Literal["create", "update"]
    when: int
    "UTC time? DATETIME in sqlite"
    email: str
    "Can be empty"
    historiography: Historiography

class RelatedEntry(TypedDict):
    "Related entry in dictionary - parent- or child/sub-entry "
    id: int
    title: str
    doctype: str

class EntryFromDatabase(TypedDict):
    id: int
    title: str
    sortkey: str
    flag: str
    """Flag is "" when entry not flagged."""
    doctype: str
    "Xml name of the root node"
    subentries: List[RelatedEntry]
    parententries: List[RelatedEntry]
    # Optionals
    xml: NotRequired[str]
    tag: NotRequired[Tag]
    html: NotRequired[str]
    titlePlain: NotRequired[str]

class User(TypedDict):
    email: str
    ske_username: Optional[str]
    ske_apiKey: Optional[str]
    loggedin: bool

currdir = os.path.dirname(os.path.abspath(__file__))
siteconfig = json.load(open(os.environ.get("LEXONOMY_SITECONFIG",
                                           os.path.join(currdir, "siteconfig.json")), encoding="utf-8"))
for datadir in ["dicts", "uploads", "sqlite_tmp"]:
    pathlib.Path(os.path.join(siteconfig["dataDir"], datadir)).mkdir(parents=True, exist_ok=True)
os.environ["SQLITE_TMPDIR"] = os.path.join(siteconfig["dataDir"], "sqlite_tmp")

defaultDictConfig = {
    "editing": {
        "xonomyMode": "nerd",
        "xonomyTextEditor": "askString"
    },
    "searchability": {
        "searchableElements": []
    },
    "xema": {
        "elements": {}
    },
    "titling": {
        "headwordAnnotations": []
    },
    "flagging": {
        "flag_element": "",
        "flags": []
    }
}

prohibitedDictIDs = ["login", "logout", "make", "signup", "forgotpwd", "changepwd", "users", "dicts", "oneclick", "recoverpwd", "createaccount", "consent", "userprofile", "dictionaries", "about", "list", "lemma", "json", "ontolex", "tei"];

# db management
def getDB(dictID: str) -> Connection:
    if os.path.isfile(os.path.join(siteconfig["dataDir"], "dicts", dictID+".sqlite")):
        conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], "dicts", dictID+".sqlite"))
        conn.row_factory = sqlite3.Row
        conn.executescript("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=on")
        return conn
    else:
        raise FileNotFoundError(f"Database for dictionary {dictID} not found")

def getMainDB():
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], 'lexonomy.sqlite'))
    conn.row_factory = sqlite3.Row
    return conn

def getLinkDB():
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], 'crossref.sqlite'))
    conn.row_factory = sqlite3.Row
    return conn

# SMTP
def sendmail(mailTo: str, mailSubject: str, mailText: str):
    if siteconfig["mailconfig"] and siteconfig["mailconfig"]["host"] and siteconfig["mailconfig"]["port"]:
        if siteconfig["mailconfig"]["secure"]:
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"], context=context)
        else:
            server = smtplib.SMTP(siteconfig["mailconfig"]["host"], siteconfig["mailconfig"]["port"])
        message = "Subject: " + mailSubject + "\n\n" + mailText
        server.sendmail(siteconfig["mailconfig"]["from"], mailTo, message)
        server.quit()


# config
def readDictConfigs(dictDB: Connection) -> Configs:
    configs = {"siteconfig": siteconfig}
    c = dictDB.execute("select * from configs")
    for r in c.fetchall():
        configs[r["id"]] = json.loads(r["json"])
    for conf in ["ident", "publico", "users", "kex", "kontext", "titling", "flagging",
                 "searchability", "xampl", "thes", "collx", "defo", "xema",
                 "xemplate", "editing", "subbing", "download", "links", "autonumber", "gapi", "metadata", "autonumbering"]:
        if not conf in configs:
            configs[conf] = defaultDictConfig.get(conf, {})

    users = {}
    for email in configs["users"]:
        users[email.lower()] = configs["users"][email]
    configs["users"] = users

    for key in configs.keys():
        if type(configs[key]) is dict:
            configs[key] = defaultdict(lambda: None, configs[key])

    return configs

# auth
def verifyLogin(email: str, sessionkey: str):
    conn = getMainDB()
    now = datetime.datetime.utcnow()
    yesterday = now - datetime.timedelta(days=1)
    email = email.lower()
    c = conn.execute("select email, ske_apiKey, ske_username, apiKey, consent from users where email=? and sessionKey=? and sessionLast>=?", (email, sessionkey, yesterday))
    user = c.fetchone()
    if not user:
        return {"loggedin": False, "email": None}
    conn.execute("update users set sessionLast=? where email=?", (now, email))
    conn.commit()
    ret = {"loggedin": True, "email": email, "isAdmin": email in siteconfig["admins"],
           "ske_username": user["ske_username"], "ske_apiKey": user["ske_apiKey"],
           "apiKey": user["apiKey"], "consent": user["consent"] == 1}
    return ret

def verifyLoginAndDictAccess(email: str, sessionkey: str, dictDB: Connection):
    ret = verifyLogin(email, sessionkey)
    configs = readDictConfigs(dictDB)
    dictAccess = configs["users"].get(email)
    if ret["loggedin"] == False or (not dictAccess and not ret["isAdmin"]):
        return {"loggedin": ret["loggedin"], "email": email, "dictAccess": False, "isAdmin": False}, configs
    ret["dictAccess"] = dictAccess or {}
    for r in ["canEdit", "canConfig", "canDownload", "canUpload"]:
        ret[r] = ret.get("isAdmin") or (dictAccess and dictAccess[r])
        ret["dictAccess"][r] = ret[r]
    return ret, configs

# also used as default sort key and default title/entry label
DEFAULT_HEADWORD = "?"


# utils

def xema_get_element_name_from_id(xema: ConfigXema, elementID: str) -> str:
    """Xema elements no longer keyed by their xml tag name. Now keyed by an arbitrary ID. Util function to convert one to the other."""
    return xema["elements"].get(elementID, {}).get("elementName", elementID) or elementID

def xema_get_id_from_element_name(xema: ConfigXema, elementName: str, parentElementID: Optional[str] = None) -> str:
    """Xema elements no longer keyed by their xml tag name. Now keyed by an arbitrary ID. Util function to convert one to the other.
    Parent is used to disambiguate (because multiple elements may specify the same elementName value, but elementName is unique among siblings.
    That means if you use this without specifying the parent, and the elementName is not the entry's root node, you're doing it wrong.
    """

    # Since there mayb be multiple elements where this is true, use the parent to disambiguate (if supplied).
    parentElement: Optional[ConfigXemaElement] = xema["elements"].get(parentElementID) if parentElementID else None
    if parentElement:
        for childConfig in parentElement["children"]:
            childElementID = childConfig["name"]
            childElementName = xema["elements"].get(childElementID, {}).get("elementName") or childElementID # use name if supplied, ID becomes fallback name otherwise
            if childElementName == elementName:
                return childElementID

    # No parent supplied, or not found: return the root if it matches
    if root := xema.get("root"):
        if xema["elements"].get(root, {}).get("elementName", root) == elementName:
            return root

    # Root also didn't match: check all elements to see which it is (maybe an orphan element? (not the root, but no parent either.))
    for thisElementID, thisElement in xema["elements"].items():
        thisElementName = thisElement.get("elementName", thisElementID) # again, use name of this element if supplied in the config, use the ID otherwise
        if thisElementName == elementName:
            return thisElementID

    # Nothing in the entire Xema uses the requested elementName - so the config is technically in an invalid state. Use a sensible default I guess.
    return elementName

def parse(xml: str) -> Tag:
    """Parse the xml and return the entry its root node. Expects to be passed xml with a single root node."""
    # We roll our own builder because all existing beatifulsoup parsers have some drawback that make them unusable in our context:
    # 1. lxml lowercases and expands self-closing elements e.g. <Test/> -> <test></test>
    # 2. lxml-xml removes unbound namespaces e.g. <mynamespace:element> -> <element> when mynamespace is not declared.
    #    which can often happen because we're not processing entire documents, only fragments,
    #    and so the element where the namespace was declared (usually the dictionary root) is not part of the xml string here.
    #    It's bad behavior to just remove random user namespaces, especially as the dictionary may be from a toolset that relies on them.
    # 3. html does...many things, lowercase elements, mess with attributes, etc. It's not an xml parser after all.

    # So what we do:
    # Treat namespace prefixes as if they're just part of the element or attribute name.
    # This means that to match a namespaced element, the query should just include the prefix: e.g. xml.findAll('lxnm:subentryParent')

    # There are a few (small) drawbacks to this method, listed here:
    # 1. we cannot tell what uri a namespace prefix is bound to, so it may be possible there is a "lxnm" namespace DIFFERENT from the lexonomy one,
    #    we then erroneously assume elements in that namespace are ours, and use them, IF they have the same name as ours.
    #    However I consider this bad-faith input, so we will disregard this possibility.
    # 2. Since we're not namespace-aware, if sections of the xml are put in a namespace without using "namespace:" prefixes, we miss that, and assume they are in the global namespace.
    #    Example:
    #    <entry>
    #        <headword>example</headword>
    #        <some_other_content xmlns="foo"> <!-- this and everything inside is "foo" namespace, but lexonomy doesn't know because no "foo:" prefix  -->
    #            <headword>headword in the "foo" namespace.</headword>
    #        </some_other_content>
    #    </entry>
    b: Any = BeautifulSoup()

    p = ParserCreate("utf-8")
    def start_element(name: str, attrs: Any):
        b.handle_starttag(name, attrs=attrs, nsprefix=None, namespace=None, sourceline=p.CurrentLineNumber, sourcepos=p.CurrentColumnNumber)
    def end_element(name: str):
        b.handle_endtag(name)
    def char_data(data: str):
        b.handle_data(data)
    p.StartElementHandler = start_element
    p.EndElementHandler = end_element
    p.CharacterDataHandler = char_data
    p.Parse(xml)
    return list(b.children)[0]

def doSql(db: Connection, sql: str, param: Any = None):
    """Convenience to enable easy logging of sql statements during development"""
    return db.execute(sql, param)

def deleteEntry(dictDB: Connection, configs: Configs, id: int, email: Optional[str]):
    """"
        Delete an entry (or subentry).
        When deleting a subentry, any parent entries will be patched to remove the link with the subentry.
        Why is the link deleted instead of replaced with a copy of the subentry contents?
            well: otherwise, after the parent is updated, the subentry would just automatically re-create itself from the inserted content
    """

    for parent in doSql(dictDB, "select entries.id, xml from entries left join sub on entries.id = sub.parent_id where sub.child_id=?", (id, )).fetchall():
        parentXml = parse(parent["xml"])
        parentId = parent["id"]
        for reference in parentXml.find_all("lxnm:subentryParent", attrs={"id": id}):
            reference.decompose() # removes the element
        createEntry(dictDB, configs, parentXml, email="system@lexonomy", id=parentId) # annnd - update! Going through the whole process ensures that we always run all relevant code, even when more is added in the future.

    # tell history that I have been deleted:
    dictDB.execute("insert into history(entry_id, action, [when], email, xml) values(?,?,?,?,?)",
                (id, "delete", datetime.datetime.utcnow(), email, None))
    doSql(dictDB, "delete from entries where id=?", (id, )) # rows in the "sub" table linking with any parents should cascade.
    dictDB.commit()

def get_xslt_transformer(xsl: Optional[str]) -> Callable[[str], Optional[str]]:
    """
    Compile the xslt, return a function that runs it on the passed xml and returns the result.
    The returned function will return None when: xslt cannot be parsed/xml cannot be parsed/no xslt was supplied.

    Example: getXsltTransformer(myOptionalXslt)(myXml) or myXml # get and run transformer, return the untransformed xml if something went wrong.\
    """
    import lxml.etree as ET

    def no_op(xml: str): # match arguments with actual transform function.
        pass

    if xsl:
        try:
            xsl_dom = ET.XML(xsl.encode())
            xslt = ET.XSLT(xsl_dom)
        except:
            return no_op
    else:
        return no_op

    def run_xslt(xml: str) -> Optional[str]:
        """Run the xslt if possible, otherwise return None"""
        try:
            xml_dom = ET.XML(xml)
            html_dom = xslt(xml_dom)
            html_string = ET.tostring(html_dom, xml_declaration=False, encoding="utf-8").decode("utf-8")
            return html_string
        except:
            return
    return run_xslt

class SortableEntry(TypedDict):
    sortkey: str
    id: int

def sortEntries(configs: Configs, sortables: List[SortableEntry], reverse: bool = False) -> List[SortableEntry]:
    "Sort the entries in the list by their sortkey. Uses the collator specified in the titling config. The list sorted in-place and returned for convenience."
     # sort by selected locale
    collator = Collator.createInstance(Locale(configs.get("titling", {}).get("locale", "en") or "en"))
    sortables.sort(key=lambda x: collator.getSortKey(x["sortkey"]), reverse=reverse)
    return sortables

def searchEntries(
    dictDB: Connection, 
    configs: Configs, 
    
    doctype: str, 
    flag: Optional[str],
    searchtext: Optional[str], 
    modifier: Optional[Literal["start", "wordstart", "substring", "exact"]] = "start", 
    sortdesc: Union[str, bool] = False, 
    limit: Optional[int] = None,
) -> Tuple[int, List[SortableEntry]]:
    """Retrieve entries sorted by sortkey. Optionally filtered by their headword.

    Args:
        dictDB (Connection):
        configs (Configs):
        doctype (str): doctype of the entries to retrieve. Usually the root element, but might be different when requesting subentries.
        flag (Optional[str]): find only entries with the given flag
        searchtext (Optional[str]):
        modifier (Optional[Literal["start", "wordstart", "substring", "exact"]], optional): Defaults to "start".
        sortdesc (Union[bool, str], optional): Reverse the usual sort order? The usual sort order is determined by ConfigTitling["sortDesc"]
        limit (Optional[int], optional): Limit the returned results to this number (when > 0)
    Returns:
        Tuple[int, List[SortableEntry]]: the total number of results, and the limited list of results.
    """
    if not searchtext:
        searchtext = ""
        modifier = None # can't search parts of words when not searching at all.
    searchtext = searchtext.lower()
    
    if type(sortdesc) == str:
        sortdesc = sortdesc == "true"
    if configs["titling"].get("sortDesc", False): # if default sort is inverted also invert descending
        sortdesc = not sortdesc

    # Special case: when searching wildcard (i.e. retrieve all entries) and the dictionary is large (>2000) entries.
    # Don't read all entries before sorting and limiting, but use a shorter path.
    if not searchtext or not modifier:
        params = (doctype, flag) if flag else (doctype, )
        total = dictDB.execute(f"select count(*) as total from entries where doctype = ? {'and flag = ?' if flag else ''}", params).fetchone()["total"]
        if total > 2000:
            results: list[SortableEntry] = []
            for rf in dictDB.execute(f"select id, sortkey from entries where doctype = ? {'and flag = ?' if flag else ''} order by sortkey limit 200", params).fetchall():
                results.append({"id": rf["id"], "sortkey": rf["sortkey"]})
            sortEntries(configs, results, reverse=sortdesc)
            return total, results

    where = " where doctype = ? "
    params = (doctype, )

    if flag:
        where = where + " and flag = ? "
        params = params + (flag, )

    if modifier == "start":
        where = where + " and s.txt like ? "
        params = params + (searchtext+"%", )
    elif modifier == "wordstart":
        where = where + " and (s.txt like ? or s.txt like ?) "
        params = params + (searchtext + "%", "% " + searchtext + "%")
    elif modifier == "substring":
        where = where + " and s.txt like ? "
        params = params + ("%" + searchtext + "%",)
    elif modifier == "exact":
        where = where + " and s.txt=? "
        params = params + (searchtext, )
    else: # default: searchtext not used
        pass

    sql = f"select distinct e.id, e.sortkey from searchables as s inner join entries as e on e.id=s.entry_id {where} group by e.id order by s.level"
    results: List[SortableEntry] = []
    for r in dictDB.execute(sql, params).fetchall():
        results.append({"id": r["id"], "sortkey": r["sortkey"]})

    results = sortEntries(configs, results, reverse=sortdesc)
    total = len(results)
    if (limit is not None and int(limit) > 0):
        results = results[0:int(limit)]
    return total, results

def readEntries(dictDB: Connection, configs: Configs, ids: Union[int, List[int], List[SortableEntry]], xml: bool=True, tag: bool=False, html: bool=False, titlePlain: bool = False, sortdesc: Union[str, bool] = False) -> List[EntryFromDatabase]:
    """Read entries from the database, optionally returning some computed values with them.
    Entries requiring an update (due to changed config or related entries) are updated prior to returning.
    Entries are returned sorted according to their sortKey

    Args:
        dictDB (Connection):
        configs (Configs):
        ids (Tuple[int, List[int]]): either a single id or list of ids to retrieve. Maxes out at something like 500k, due to statement length limitations.
        xml (bool, optional): Also return the xml as string. Defaults to True.
        tag (bool, optional): Also return the xml as parsed. Defaults to False.
        html (bool, optional): Also return the html. This runs the xslt from the config, or otherwise generates a <script> tag that will transform the xml to html on the client side. Defaults to False.
        titlePlain (bool, optional): Also include the plain text of the entry. This requires the xml to be parsed, so is slow.
        sortdesc (Union[bool, str], optional): Reverse the usual sort order? The usual sort order is determined by ConfigTitling["sortDesc"]
    Returns:
        List[EntryFromDatabase]: List of the entries.
    """

    if not isinstance(ids, list):
        ids = [ids]
    if len(ids) > 0 and not isinstance(ids[0], int):
        ids = list(map(lambda x: x["id"], ids))

    if type(sortdesc) == str:
        sortdesc = sortdesc == "true"
    if configs["titling"].get("sortDesc", False): # if default sort is inverted also invert descending
        sortdesc = not sortdesc

    for r in doSql(dictDB, f"""select id, xml from entries where needs_update = 1 and id in ({",".join("?" * len(ids))})""", ids).fetchall():
        createEntry(dictDB, configs, r["xml"], "system@lexonomy", id = r["id"])
    dictDB.commit() # createEntry does not perform commit every call for performance sake.

    rows = doSql(dictDB, f"""
        WITH children_by_parent AS (
            select
            sub.parent_id,
            json_group_array(json_object(
                'id', entries.id,
                'title', entries.title,
                'doctype', entries.doctype
            )) as children
            from sub left join entries
            on sub.child_id = entries.id
            group by sub.parent_id
        ),
        parents_by_child AS (
            select
            sub.child_id,
            json_group_array(json_object(
                'id', entries.id,
                'title', entries.title,
                'doctype', entries.doctype
            )) as parents
            from sub left join entries
            on sub.parent_id = entries.id
            group by sub.child_id
        )

        SELECT
            entries.id,
            entries.doctype,
            entries.xml,
            entries.title,
            entries.sortkey,
            entries.flag,
            entries.needs_update,
            children,
            parents
            -- parent_id,
            -- child_id
        FROM entries
        left join children_by_parent on entries.id = children_by_parent.parent_id
        left join parents_by_child on entries.id = parents_by_child.child_id

        where entries.id in ({",".join("?" * len(ids))})
    """, ids).fetchall()

    # If required, load transformer outside of loop
    run_xslt = get_xslt_transformer(configs.get("xemplate", {}).get("_xsl", "")) if html else None

    entries: List[EntryFromDatabase] = []
    for row in rows:
        ret: EntryFromDatabase = {
            "id": row["id"],
            "title": row["title"],
            "sortkey": row["sortkey"],
            "flag": row["flag"],
            "subentries": json.loads(row["children"] or "[]"),
            "parententries": json.loads(row["parents"] or "[]"),
            "doctype": row["doctype"]
            # "success": True
        }
        if xml:
            ret["xml"] = row["xml"]
            ret["content"] = row["xml"] # type: ignore - compatibility with screenful. TODO remove
        if tag or titlePlain:
            parsedXml = parse(row["xml"])
            if tag:
                ret["tag"] = parsedXml
            if titlePlain:
                ret["titlePlain"] = get_entry_title(parsedXml, configs)[0]
        if html:
            ret["html"] = get_entry_html(dictDB, configs, row["xml"], run_xslt)
        entries.append(ret)
    sortEntries(configs, entries, sortdesc)  # type: ignore - SortableEntry is a subset of Entry so this always works
    return entries

def get_entry_html(dictDB: Connection, configs: Configs, xml: str, run_xslt: Any) -> str:
    "Run the xslt on the xml, or - failing that - return a <script> tag that will transform it clientside using the Xemplatron. Result should be used with 'element.innerHTML = ...'"
    if not run_xslt:
        run_xslt = get_xslt_transformer(configs.get("xemplate", {}).get("_xsl", ""))

    xml = str(resolveSubentries(dictDB, xml))
    safeXml = re.sub(r"[\n\r]", "", re.sub(r"'", "\\'", xml))
    return run_xslt(xml) or f"""
        <script type='text/javascript'>
            $('#viewer').html(Xemplatron.xml2html(
                '{safeXml}',
                {json.dumps(configs["xemplate"])},
                {json.dumps(configs["xema"])}
            ));
        </script>"""

def fixup_namespaces(xml: Tag):
    xml.attrs['xmlns:lxnm'] = 'http://www.lexonomy.eu/'

def get_entry_id(xml: Tag, dictDB: Connection, maybeID: Optional[int] = None) -> tuple[int, bool]:
    """
    Ensure the entry has a row in the database, and the entry root has an attribute @xml:id with the row ID.

    The ID is determined as such (first match):
    - 1. if an ID is passed, that will always be used, and the entry's xml will be updated to have that ID
    - 2. if no ID is passed, but the xml root has an @lxnm:id attribute, that will be used
    - 3. if no ID is passed and xml doesn't have @lxnm:id, a new id will be created and added to the xml.

    Returns ID, is new ID in database
    """
    if maybeID is not None: # id is passed in - update the xml to reflect.
        xml.attrs["lxnm:id"] = str(maybeID)
        id = None

    id = xml.attrs.get('lxnm:id') # check if xml has an id, if not, create one. (entryID is legacy)
    if id is None:
        id = xml.attrs.get('lxnm:entryID') # id used to be stored in lxnm:entryID once upon a time: legacy support
    if id is not None:
        try:
            id = int(id)
        except:
            print(f"Invalid ID (non-number) {id} in to-be-imported entry: replacing...")
            if "lxnm:id" in xml.attrs:
                del xml.attrs["lxnm:id"]
            if "lxnm:entryID" in xml.attrs:
                del xml.attrs["lxnm:entryID"]
            id = None

    isNewEntry: bool = False
    if id is None: # let db create one
        id = doSql(dictDB, "insert into entries(doctype, xml, title, sortkey) values(?, ?, ?, ?)", ("", "", "", "")).lastrowid
        isNewEntry = True
    else:
        # ensure row exists
        isNewEntry = doSql(dictDB, "insert into entries(id, doctype, xml, title, sortkey) values(?,?,?,?,?) on conflict(id) do nothing", (id, "", "", "", "")).rowcount > 0

    xml.attrs["lxnm:id"] = str(id)
    if "lxnm:entryID" in xml.attrs: # delete legacy id attribute
        del xml.attrs["lxnm:entryID"]
    return id, isNewEntry

def presave_subentries(dictDB: Connection, configs: Configs, entryXml: Tag, entryID: int, email: str):
    """
    Ensure this entry has all subentries properly extracted and referenced through xml and database.
    Also flag any parent entries for needs_update.

    1. Find elements that should be a subentry (their tag is in the subbing config)
    2. Extract the element and its childen, and store it as a separate entry in the database
    3. Add back a <lxnm:subentryParent id="{idOfTheSeparateEntry}"/> xml placeholder element in this entry
    4. Fixup any remaining invalid references
        1. If the target has been updated and is still a valid subentry otherwise:
            Fixup the title and doctype on the <lxnm:parentEntry>
        2. If the entry it points to exists in the database, but is no longer allowed to be a subentry (due to changed attributes, doctype, etc?):
            replace it with a copy of that xml (removing lexonomy bookkeeping attributes in the copy)
        3. If it points to an entry that doesn't exist in the database:
            delete the tag.
            Keeping the tag is not an option, because we cannot save a link to a nonexistant entry due to referential constraints in the database.
            If we would keep the tag, but not save the reference in the database, that would give issues if the missing subentry was later created, perhaps by automatic assignment of an id.

    Finally save all parent->child references in the database.

    NOTE: changes stay within this entry.
    If this entry was once a subentry, but is now no longer (due to config changes), parents of this entry will need a separate update,
    this function will only modify subentries inside this entry, not modify entries that have this entry as subentry.
    """

    config = configs["subbing"]
    def turnChildElementIntoSubentry(parentEntry: Tag, subentry: Tag) -> int:
        """
            Save the child in the database, giving it an ID automatically.
            Then in the parent, replace the child xml with <lxnm:subentryParent id=${childID}/> and store the link between parent and child in the sub database.
            NOTE: the link is not registered in the database 'sub' table yet - that happens in a batch operation
        """
        subentryID, subentryXml, _, _ = createEntry(dictDB, configs, subentry, email)
        if subentryXml:
            subentryTitlePlain = get_entry_title(subentryXml, configs)[0]
            subentryDoctype = get_entry_doctype(subentryXml)
            new_tag = BeautifulSoup().new_tag("lxnm:subentryParent", attrs={
                "id": str(subentryID),
                "title": subentryTitlePlain,
                "doctype": subentryDoctype
            })
            subentry.replaceWith(new_tag)
        return subentryID

    def isActualSubentry(el: Tag, element_id: str):
        """Return True if this element is a subentry, i.e. it's in the sub config, and it has the required attributes."""
        if not el.name in config:
            return False
        required_attributes = config.get(element_id, {}).get("attributes", {}).items()
        if not(len(required_attributes)):
            return True # no attributes required - always good.
        # Find a matching attribute
        for name, requiredValue in required_attributes:
            if el.has_attr(name) and (not requiredValue or el.attrs.get(name) == requiredValue):
                return True
        # No matching attribute found, element has the correct <name>, but not the correct attributes.
        return False

    def isInsideOtherSubentry(el: Tag) -> bool:
        ancestor = el
        while (ancestor := ancestor.parent) != None and ancestor is not entryXml: # entry xml may not be root of doc, avoid looking at its parents (might happen in nested subentries)!
            ancestor_id = xema_get_id_from_element_name(configs["xema"], ancestor.name)
            if isActualSubentry(ancestor, ancestor_id):
                return True
        return False

    # 1. Replace subentries with <subentryParent> placeholder/standin elements
    # NOTE: gather first - then replace, as to avoid modifying the xml while we're iterating and throwing off BeatifulSoup
    nodesToTurnIntoSubentries: List[Tag] = []
    newSubentries: List[int] = []
    for element_id in config:
        element_name = xema_get_element_name_from_id(configs["xema"], element_id)
        for subentryElement in entryXml.select(element_name):
            if not isInsideOtherSubentry(subentryElement) and isActualSubentry(subentryElement, element_id):
                nodesToTurnIntoSubentries.append(subentryElement)
    for subentryElement in nodesToTurnIntoSubentries:
        subentryID = turnChildElementIntoSubentry(entryXml, subentryElement)
        newSubentries.append(subentryID)

    # 2. Gather all subentry IDs for this entry, excluding ones we just created (those are guaranteed to be valid)
    # So that we can validate them.
    # Only do this after new subentries have been extracted, or this query would also match a subentry in a subentry
    subentryIdsToValidate: Set[int] = set()
    for subentry in entryXml.findAll("lxnm:subentryParent"):
        subentryID = int(subentry.attrs["id"])
        if not subentryID in newSubentries: # new subentries are guaranteed to be correct in the datbaase already.
            subentryIdsToValidate.add(subentryID)

    validSubentryIDs = set(newSubentries)
    # 3 Replace invalid references with contents, delete if no contents in database.
    if len(subentryIdsToValidate): # avoid running a query we know won't return anything
        idplaceholder = ",".join("?" * len(subentryIdsToValidate))
        for r in doSql(dictDB, f"select * from entries where id in ({idplaceholder})", list(subentryIdsToValidate)).fetchall():
            # fixup subentry's xml before using it, if it needs it (maybe it has subentries of its own to do things with?)
            if r["needs_update"]:
                _, subentryXml, _, _ = createEntry(dictDB, configs, r["xml"], email, id=r["id"])
            else:
                subentryXml = parse(r["xml"])

            subentryID = int(r["id"])
            isValid = isActualSubentry(subentryXml, xema_get_id_from_element_name(configs["xema"], r["doctype"]))
            if isValid: # this <lxnm:subentryParent> may stay, but update its attributes anyway while we're here, so we're sure they are up to date.
                for subentry in entryXml.findAll("lxnm:subentryParent", {"id": subentryID}): # and place xml content in the parent entry
                    subentry.attrs["title"] = get_entry_title(subentryXml, configs)[0]
                    subentry.attrs["doctype"] = r["doctype"]
                subentryIdsToValidate.remove(subentryID) # mark this one done.
                validSubentryIDs.add(subentryID)
                continue
            else:
                del subentryXml.attrs["lxnm:id"] # remove lexonomy attributes since this is no longer a full entry now
                del subentryXml.attrs["xmlns:lxnm"]
                for subentry in entryXml.findAll("lxnm:subentryParent", {"id": subentryID}): # and place xml content in the parent entry
                    subentry.replaceWith(subentryXml)

            subentryIdsToValidate.remove(subentryID) # mark this one done.

        # Every ID we've not see so far has no backing entry in the database - so just remove it outright.
        for subentryID in subentryIdsToValidate:
            for subentry in entryXml.findAll("lxnm:subentryParent", {"id": subentryID}):
                subentry.decompose()

    # 4 Update subentry relations database.
    doSql(dictDB, "delete from sub where parent_id = ?", (entryID, ))
    tuples_of_parent_child_id = list(zip(itertools.repeat(entryID), validSubentryIDs))
    if len(tuples_of_parent_child_id):
        dictDB.executemany("insert into sub(parent_id, child_id) values(?,?)", tuples_of_parent_child_id)

    # Flag our parents they need an update (in case this is a subentry)
    doSql(dictDB, "update entries set needs_update=1 where id in (select distinct parent_id from sub where child_id = ?)", (entryID, ))

def get_entry_doctype(xml: Tag) -> str:
    """Get elementName of the root of the entry xml"""
    return xml.name

def get_text(xml: Tag, tagName: Optional[str] = None) -> Optional[str]:
    """
        If tagName and such an element exists: returns the first (non-whitespace) text content of the element.
        if tagName and such an element does not exist: None
        if no tagName: first non-whitespace text content of xml
        if no tagName and no text in the entire xml: None

        Only checks descendants of the xml node.
    """
    if tagName:
        for el in xml(tagName, string=True):
            textContent = str(el.string.strip()) # convert to python string and trim whitespace (or else whitespace-only strings would leak through.)
            if textContent:
                return textContent
    else:
        for txt in xml.stripped_strings:
            return str(txt)

def get_text_all(xml: Tag, tagName: str) -> List[str]:
    """
        If element provided: returns the first (non-whitespace) text content of the element. None is returned if element does not exist or doesn't have any meaningful text anywhere.
        If no element provided: returns the first none-whitespace text content in the document. None is returned if no meaningful text in the entire document.
    """
    ret: List[str] = []
    for el in xml.findAll(tagName, string=True): # only match those with text content
        textContent = str(el.string.strip()) # convert to python string and trim whitespace (or else whitespace-only strings would leak through.)
        if textContent:
            ret.append(textContent)
    return ret

def get_entry_headword(xml: Tag, configs: Configs) -> str:
    """
    Get the entry's headword.
    If no text is found at the element, the first non-whitespace text content of the document will be returned.
    If there is no text at all, a default placeholder is returned.
    """
    config: ConfigTitling = configs["titling"]
    headword_id = config.get("headword")
    headword_element_name = xema_get_element_name_from_id(configs["xema"], headword_id) if headword_id else None
    if headword_element_name and (val := get_text(xml, headword_element_name)):
        return val[0:255]
    elif val := get_text(xml):
        return val[0:255]
    else:
        return DEFAULT_HEADWORD

def get_entry_title(xml: Tag, configs: Configs) -> Tuple[str, str]:
    """
    Returns [title as plaintext, title as html]
    This will usually be the headword (and optionally some other things), unless specifically configured by the user (by using advanced mode).

    The title is used in two places:
    - as searchable (see presave_searchables) (the plaintext version).
    - in the list of all entries in the editor in the frontend (the html version).
    """
    # advanced process; do string-replacement in a format-string
    # format string looks like "some text %(elementName) some more text maybe %(anotherElementName)"
    # replace the %() sequences with the contents of the first (non-whitespace) element of the name.
    config: ConfigTitling = configs["titling"]
    titleParts: List[str] = []
    if (formatString := config.get("headwordAnnotationsAdvanced", "")) and config.get("headwordAnnotationsType") == "advanced":
        asHtml: str = formatString  # start with the format string as-is, replace placeholders as we go
        for elementFormatString in re.findall(r"%\([^)]+\)", formatString): # e.g. "%(elementName)"
            elementName = elementFormatString[2:-1] # strip the surrounding syntax %()
            if (text := get_text(xml, elementName)) != None:
                titleParts.append(text)
                asHtml = asHtml.replace(elementFormatString, text)

        if len(titleParts):
            return ' '.join(titleParts), asHtml

    # Run simple mode if we haven't returned yet (because advanced mode either disabled or didn't match anything)
    # start with the headword.
    headword = get_entry_headword(xml, configs)
    for element_id in config.get("headwordAnnotations", []):
        elementName = xema_get_element_name_from_id(configs["xema"], element_id)
        if (text := get_text(xml, elementName)) != None:
            titleParts.append(text)

    stringParts = [headword] + titleParts
    htmlParts = ["<span class='headword'>" + headword + "</span>"] + titleParts
    return ' '.join(stringParts), ' '.join(htmlParts)


def get_entry_sortkey(xml: Tag, configs: Configs) -> str:
    """
    Get the entry's sort key as defined by configs.titling.headwordSorting
    Fallbacks are in order:
    - the headword
    - the first text content in the entry
    - a placeholder string
    """
    config = configs["titling"]
    if config.get("headwordSorting") and (val := get_text(xml, config["headwordSorting"])):
        return val
    else:
        return get_entry_headword(xml, configs)

def get_entry_flag(xml: Union[str, Tag], configs: Configs) -> Optional[str]:
    """Read the flag from an entry, assumes the xml is from the database, and not from the user (and so has no unexpected issues)."""
    if isinstance(xml, str):
        xml = parse(xml)

    flag_element_id = configs.get("flagging", {}).get("flag_element")
    flag_element_name = configs.get("xema", {}).get("elements", {}).get(flag_element_id, {}).get("elementName", flag_element_id)
    flag_text = (get_text(xml, flag_element_name) or "") if flag_element_name else ""
    return flag_text

def find_path_to_element(xema: ConfigXema, current_element_id: str, target_element_id: str) -> Optional[list[str]]:
    """
    Find the (first) path to to the target element.
    The list is returned with the target element at the end. The list contains the xml names of the elements, not their IDS.
    The initial starting point element is NOT returned in the list.
    If any of the encountered elements have no config in the xema it is not considered further.
    """
    if elementConfig := xema["elements"].get(current_element_id): # if element has a definition in xema, check the children
        for c in elementConfig.get("children", []):
            child_id = c["name"] # confusing, but alas.. the child.name property is the key in the xema.elements object, so it is actually the ID of the child.
            child_name= xema_get_element_name_from_id(xema, c["name"])
            if child_id == target_element_id:
                return [child_name]
            elif path_to_target := find_path_to_element(xema, child_id, target_element_id):
                return [child_name] + path_to_target
            # doesn't lead to target, next child
        # nothing leads to target - dead-end.

def create_path_to_element(xml: Tag, path: list[str]) -> Tag:
    """
    Make sure the path exists within the entry, creating missing elements along the way.
    The list should not contain the current xml node, only the descendants to create.
        Ex: create_path_to_element(parse("<a><b></b></a>") , ["b", "c", "d"]) # ensure ./b/c/d exists
            xml is now "<a><b><c><d></d></c></b></a>"
    Returns the final node.
    """
    path = path.copy()
    current_element = xml
     # Find the element closest to the flag in the xml, adding unfound elements as we run across them.
    tagCreator = BeautifulSoup()
    while len(path):
        next_nearest_elementname = path.pop(0)
        if next_element := current_element.findChild(next_nearest_elementname):
            current_element = next_element
        else: # didn't find, add it!
            new_element = tagCreator.new_tag(next_nearest_elementname) # when doing the last entry in the list, the element should be the flag tag itself.
            current_element.append(new_element)
            current_element = new_element
    return current_element

def set_entry_flag(dictDB: Connection, entryID: int, flag: str, configs: Configs, email: str, xml: Optional[Union[Tag, str]] = None) -> Tuple[Optional[Tag], Optional[str]]:
    """
    Update or create the flag element's contents.
    Returns either [xml Tag, None] or [None, feedback], depending on success.
    Load the xml from the database if not passed in. Otherwise it is assumed the xml is from the database (so not just some unprocessed/unvalidated user input).
    Returns the updated xml.
    NOTE: If Tag is passed in - it is modified in place and returned.
    NOTE: XML and flag column in Database are always updated on success.
    NOTE: A history entry is created on success.
    NOTE: You must commit() after doing this.
    """

    # Gather all basic info: parsed xml, flag element name
    flag_element_id: str = configs["flagging"].get("flag_element")
    if not flag_element_id:
        return None, "Cannot set flag as no flags are configured."
    flag_element_name = xema_get_element_name_from_id(configs["xema"], flag_element_id)
    xema: ConfigXema = configs.get("xema", {"elements": {}})

    if not xml: # read xml from db if not supplied
        row = doSql(dictDB, "select id, xml from entries where id=?", (entryID,)).fetchone()
        if not row:
            return None, "Entry not found"
        xml = parse(row["xml"])
    elif isinstance(xml, str):
        xml = parse(xml)

    def updateFlag(entryRoot: Tag, the_flag_element: Tag):
        the_flag_element.clear()
        the_flag_element.append(flag) # add the string
        xmlstr = str(entryRoot)
        doSql(dictDB, "update entries set xml=?, flag=? where id=?", (xmlstr, flag, entryID))
        doSql(dictDB, "insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (entryID, "update", str(datetime.datetime.utcnow()), email, xmlstr, json.dumps({})))

        # if the user can search in the flag field (which we just modified), update the search table
        if flag_element_id in configs["searchability"].get("searchableElements", []):
            titleText, titleHtml = get_entry_title(entryRoot, configs)
            presave_searchables(dictDB, configs, entryRoot, entryID, titleText)

    # Note, we do not check the path to the flag element here.
    # We assume that when it exists, it is valid to use it, and the exact location does not matter very much
    if flag_element := xml.find(flag_element_name):
        updateFlag(xml, flag_element)
        return xml, None

    # flag not present. try and find where we should insert it, and do so.
    # Start looking from the actual entry root instead of schema root,
    # as it is possible this entry does not start at the schema root (such as when this is a subentry).
    root_element_id = xema_get_id_from_element_name(xema, xml.name)
    path_to_flag = find_path_to_element(xema, root_element_id, flag_element_id) or [flag_element_name] # if we can't find a path, add the flag directly below the root.
    flag_element = create_path_to_element(xml, path_to_flag)
    updateFlag(xml, flag_element)
    return xml, None


def presave_searchables(dictDB: Connection, configs: Configs, entryXml: Tag, entryID: int, entryTitleText: str):
    """
    Make the search database up-to-date for this entry.
    A searchable is a string that is indexed in the database and is used to quickly find entries based on the text contents of (some of) their elements.

    The entry title is always stored as searchable.
    The entry headword is always stored as a searchable.
    Additionally the text contents of all elements listed in configs.searchability.searchableElements
    """

    # Level 2 searchables: headword, plus everything in config - do this first so we can check we don't have duplicates.
    searchablesLevel2: Set[str] = set()
    searchablesLevel2.add(get_entry_headword(entryXml, configs))
    for element_id in configs["searchability"].get("searchableElements", []):
        element_name = xema_get_element_name_from_id(configs["xema"], element_id)
        for txt in get_text_all(entryXml, element_name):
            searchablesLevel2.add(txt)

    # Level 1: title and title lowercase - insofar as those are not in level 2
    searchablesLevel1: set[str] = set()
    if entryTitleText not in searchablesLevel2:
        searchablesLevel1.add(entryTitleText)
    if (entryTitleTextLower := entryTitleText.lower()) not in searchablesLevel2:
        searchablesLevel1.add(entryTitleTextLower)

    toInsert = list(
        itertools.chain(
            zip(itertools.repeat(entryID), searchablesLevel1, itertools.repeat(1)),
            zip(itertools.repeat(entryID), searchablesLevel2, itertools.repeat(2))
        )
    )

    doSql(dictDB, "delete from searchables where entry_id=?", (entryID,))
    if len(toInsert):
        dictDB.executemany("insert into searchables(entry_id, txt, level) values(?, ?, ?)", toInsert)

def split_template_string(template: str) -> list[str]:
    "Extract and return the templates from a template-string like %(some-element)"
    return re.findall(r"%\([^)]+\)", template) # pre-process

def eval_template_string(entry: Tag, current_element: Tag, template: str, split_template: Optional[list[str]] = None) -> str:
    """Replace templates %(some-element) and %(@some-attribute) with their text values.
        Unmatched templates are preserved.
        Elements are first matched inside current_element, and if that fails, on the entire entry.

    Args:
        entry (Tag): the entry, used as fallback when template string refers to an element that can't be found in/below the current_element
        current_element (Tag): element for which to evaluate the template
        template (str): complete template string
        split_template (list[str]): speedup for when calling this function in a loop, the pre-extracted templates from the string.

    Returns:
        str: the template string with templates replaced by their values
    """

    if not split_template:
        split_template = split_template_string(template)

    for pattern in split_template:
        if pattern[2] == '@': # if the pattern is %(@some-attribute), extract it
            attributeName = pattern[3:-1]
            text = current_element.attrs.get(attributeName) or entry
        else: # pattern is %(some_element)
            elementName = pattern[2:-1]
            text = get_text(current_element, elementName) or get_text(entry, elementName) # use descendants of the link element first, if that fails try entire entry
        if text:
            template = template.replace(pattern, text)
    return template

def presave_linkables(dictDB: Connection, configs: Configs, entryXml: Tag, entryID: int):
    """
    Purge outdated linkables, find new linkables, make linkables database up-to-date for this entry.
    Entry is not saved yet, only its xml is changed.

    A linkable is just an element with an @lxnm:linkable attribute.
    The frontend uses these to generate links to other places when displaying an entry.
    The backend is not concerned with this further, we just keep them consistent with the config and save them in the db for the frontend.

    entryID is passed in to prevent repeatitive database lookups during processing of (new or currently saving) entries.
    """

    xema = configs.get("xema", {"elements": {}})
    config_links = configs.get("links", {})

    # First remove all linkables, so we don't keep any stale entries around either in the entry or the database.
    doSql(dictDB, "delete from linkables where entry_id=?", (entryID,))
    for linkable in entryXml.findAll(attrs = {"lxnm:linkable": True}): # match all with linkable attribute
        del linkable.attrs["lxnm:linkable"]

    ret: List[Tuple[int, str, str, str]] = []
    for linkref in config_links.values():
        if type(linkref) is str:
            continue
        linkElement = xema_get_element_name_from_id(xema, linkref["linkElement"])

        identifierEscapes = split_template_string(linkref["identifier"]) # pre-process
        previewEscapes = split_template_string(linkref["preview"])
        for el in entryXml.findAll(linkElement):
            identifier = eval_template_string(entryXml, el, linkref["identifier"], identifierEscapes)
            preview = eval_template_string(entryXml, el, linkref["preview"], previewEscapes)
            el.attrs["lxnm:linkable"] = identifier
            ret.append((entryID, identifier, linkElement, preview))

    if len(ret):
        dictDB.executemany("insert into linkables(entry_id, txt, element, preview) values(?,?,?,?)", ret)

def get_next_autonumber_value(dictDB: Connection, element: str, target: Optional[str]) -> Optional[int]:
    """Scan all entries for values in the element or the attribute on the element (if supplied), returning the highest found number + 1

    Args:
        dictDB (Connection): the dictionary
        element (str): name of the element to scan
        target (Optional[str]): name of the actual container element or attribute, attribute should be prefixed with 'a'. See ConfigAutoNumber["target"].
    """

    target_is_attribute = False
    if target and target.startswith("@"):
        target_is_attribute = True
        target = target[1:]

    # """Get the next unused integer for an autonumber configuration."""
    highest = -1
    for e in dictDB.execute("select xml from entries"):
        entry = parse(e["xml"])
        for el in ([entry] + entry.findAll(element)) if entry.name == element else entry.findAll(element):
            existing_value = el.attrs.get(target) if target_is_attribute else get_text(el, target)
            if existing_value:
                try:
                    i = int(existing_value)
                    highest = i if i > highest else highest
                except:
                    pass
    highest += 1 # return NEXT number
    configs = readDictConfigs(dictDB)
    # since this is a long operation - just save it now.
    config = configs.get("autonumbering", {})
    if elementConf := config.get(element):
        elementConf["number_next"] = highest
        dictDB.execute("UPDATE configs SET json=? WHERE id=?", (json.dumps(config), "autonumbering"))

    return highest

def presave_autonumbering(dictDB: Connection, configs: Configs, entry: Tag, isAutoApplying: bool = True) -> bool:
    """Add automatically generated IDS/numbers to elements/attributes in the entry according to the config.
    If the next ID is persistent, the config is then written to the database with the updating running nummer.

    Args:
        dictDB (Connection): database
        config (list[ConfigAutoNumbering]): autonumbers to apply
        isNewEntry (bool): Is this a new entry, or an update to an existing entry? Used to skip refreshing numeric IDs on existing entries.
        isAutoApplying (bool): Are we autonumbering in the context of a user that pressed "autonumber my dictionary" or are we just processing a single entry during saving?

    Returns:
        true if the xml was changed
    """
    xema = configs["xema"]
    autonumbering = configs.get("autonumbering", {})

    touched_global_number = False
    touched_entry = False
    for c in autonumbering.values():
        # Be a little smart about this:
        # Only overwrite values when running auto_apply on a new entry, or when doing a manual run with overwrite true
        if not c.get("auto_apply") and isAutoApplying:
            continue

        # setup
        value_type = c.get("type", "number") # number or string
        element_to_number = xema_get_element_name_from_id(xema, c.get("element", ""))
        target = c.get("target") or None # Note: keep None if not valid, or get_text call later fails because it will look for empty string element or something.
        target_is_attribute = False
        if target and target.startswith("@"):
            target_is_attribute = True
            target = target[1:]

        if not element_to_number:
            continue

        if value_type == "number":
            next_number = int(c.get("number_next", 0)) if c.get("number_globally") else 0
            template = None
            template_parts = None
        else: # value_type == "string":
            next_number = 0
            template = c.get("string_template")
            template_parts = split_template_string(template) if template else None
            if not template_parts: # template string is empty, missing, or contains nothing to evaluate; skip.
                continue

        for el in ([entry] + entry.findAll(element_to_number)) if entry.name == element_to_number else entry.findAll(element_to_number):
            existing_value = el.attrs.get(target) if target_is_attribute else get_text(el, target)
            write_new_value = not existing_value or c.get("overwrite_existing")

            # Exception to the rule:
            # When in numeric mode, and numbers are globally unique, and we're auto-applying: don't overwrite
            # Doing that would cause new numbers to be assigned every time an entry is saved or otherwise touched.
            # Which would be completely useless from an ID standpoint, and also cause the numbers to grow rather quickly..
            # So only overwrite existing global numbers if not isAutoApplying
            # Local numbers are fine to overwrite, since they are usually the same, unless the entry added or removed the elements to count.
            # And in that case you probably DO want the ids to auto-update since they're more local index numbers instead of actual idenfitiers.
            if value_type == "number" and c.get("number_globally") and existing_value and isAutoApplying:
                write_new_value = False

            if not write_new_value:
                continue

            if value_type == "number":
                value = str(next_number)
                next_number += 1
            else:
                value = eval_template_string(entry, el, template, template_parts)

            touched_entry = True
            if target_is_attribute:
                el.attrs[target] = value
            elif target:
                targetEl = el.find(target) or create_path_to_element(el, [target])
                targetEl.clear()
                targetEl.append(value)
            else:
                el.clear()
                el.append(value)

        # After writing the values, save the current number so we can continue in later entries
        if value_type == "number" and c.get("number_globally"):
            c["number_next"] = next_number
            touched_global_number = True

    if touched_global_number:
        dictDB.execute("UPDATE configs SET json=? WHERE id=?", (json.dumps(autonumbering), "autonumbering"))

    return touched_entry

def createEntry(dictDB: Connection, configs: Configs, xml: Union[str, Tag], email: str, id: Optional[int] = None) -> Union[
    Tuple[int, Tag, Literal[True], Optional[Any]],
    Tuple[Optional[int], Optional[Tag], Literal[False], Any]
]:
    """
    Create or re-index an entry, ensuring the xml is conformant and the database is up to date.
    Returns in order: id, parsed xml, success (true/false), feedback as JSON object {"type": string, "info": string|int} when duplicate entry or otherwise error.
    NOTE: for efficiency during import, COMMIT is not called and is left to the caller.

    When ID is passed, it is used instead of whatever ID is contained in the xml. If no id is passed, extract the id from the xml, or, failing that, auto-assign an ID.
    """

    if isinstance(xml, str) or xml is None:
        try:
            xml = parse(xml)
        except:
            return id, None, False, {"type": "savingFailed", "info": "Invalid XML."}

    fixup_namespaces(xml)

    # Specific order: reserve ID in the database, then extract subentries
    # So that any element matching after this does not go into subentries
    id, isNewEntry = get_entry_id(xml, dictDB, id)
    presave_subentries(dictDB, configs, xml, id, email)

    doctype = get_entry_doctype(xml)
    titleText, titleHtml = get_entry_title(xml, configs)
    sortKey = get_entry_sortkey(xml, configs)
    flag = get_entry_flag(xml, configs)

    presave_searchables(dictDB, configs, xml, id, titleText)
    presave_linkables(dictDB, configs, xml, id)
    presave_autonumbering(dictDB, configs, xml, isAutoApplying=True)

    # Create/update the entry, save history
    xmlstr = str(xml)
    doSql(dictDB, "update entries set doctype=?, xml=?, title=?, sortkey=?, flag=?, needs_update=0 where id=?", (doctype, xmlstr, titleHtml, sortKey, flag, id))
    doSql(dictDB, "insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (id, "create" if isNewEntry else "update", str(datetime.datetime.utcnow()), email, xmlstr, json.dumps({})))

    # Report if headword exists.
    c = dictDB.execute("select id from entries where title = ? and id <> ?", (titleText, id))
    r = c.fetchone()
    feedback = {"type": "saveFeedbackHeadwordExists", "info": r["id"]} if r else None

    return id, xml, True, feedback

def generateKey(size: int=32):
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(size))

def generateDictId(size: int=8):
    return ''.join(random.choice("abcdefghijkmnpqrstuvwxy23456789") for _ in range(size))

def login(email: str, password: str):
    if siteconfig["readonly"]:
        return {"success": False}
    conn = getMainDB()
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    c = conn.execute("select email, apiKey, ske_username, ske_apiKey, consent from users where email=? and passwordHash=?", (email.lower(), passhash))
    user = c.fetchone()
    if not user:
        return {"success": False}
    key = generateKey()
    now = datetime.datetime.utcnow()
    conn.execute("update users set sessionKey=?, sessionLast=? where email=?", (key, now, email))
    conn.commit()
    return {"success": True, "email": user["email"], "key": key, "ske_username": user["ske_username"], "ske_apiKey": user["ske_apiKey"], "apiKey": user["apiKey"], "consent": user["consent"] == 1}

def logout(user: User):
    conn = getMainDB()
    conn.execute("update users set sessionKey='', sessionLast='' where email=?", (user["email"],))
    conn.commit()
    return True

def sendSignupToken(email: str, remoteip: str):
    if siteconfig["readonly"]:
        return False
    conn = getMainDB()
    c = conn.execute("select email from users where email=?", (email.lower(),))
    user = c.fetchone()
    if not user:
        token = secrets.token_hex()
        tokenurl = siteconfig["baseUrl"] + "#/createaccount/" + token
        expireDate = datetime.datetime.now() + datetime.timedelta(days=2)
        mailSubject = "Lexonomy signup"
        mailText = "Dear Lexonomy user,\n\n"
        mailText += "Somebody (hopefully you, from the address "+remoteip+") requested to create a new Lexonomy account. Please follow the link below to create your account:\n\n"
        mailText += tokenurl + "\n\n"
        mailText += "For security reasons this link is only valid for two days (until "+expireDate.isoformat()+"). If you did not request an account, you can safely ignore this message. \n\n"
        mailText += "Yours,\nThe Lexonomy team"
        conn.execute("insert into register_tokens (email, requestAddress, token, expiration) values (?, ?, ?, ?)", (email, remoteip, token, expireDate))
        conn.commit()
        sendmail(email, mailSubject, mailText)
        return True
    else:
        return False

def sendToken(email: str, remoteip: str):
    if siteconfig["readonly"]:
        return False
    conn = getMainDB()
    c = conn.execute("select email from users where email=?", (email.lower(),))
    user = c.fetchone()
    if user:
        token = secrets.token_hex()
        tokenurl = siteconfig["baseUrl"] + "#/recoverpwd/" + token
        expireDate = datetime.datetime.now() + datetime.timedelta(days=2)
        mailSubject = "Lexonomy password reset"
        mailText = "Dear Lexonomy user,\n\n"
        mailText += "Somebody (hopefully you, from the address "+remoteip+") requested a new password for the Lexonomy account "+email+". You can reset your password by clicking the link below:\n\n";
        mailText += tokenurl + "\n\n"
        mailText += "For security reasons this link is only valid for two days (until "+expireDate.isoformat()+"). If you did not request a password reset, you can safely ignore this message. \n\n"
        mailText += "Yours,\nThe Lexonomy team"
        conn.execute("insert into recovery_tokens (email, requestAddress, token, expiration) values (?, ?, ?, ?)", (email, remoteip, token, expireDate))
        conn.commit()
        sendmail(email, mailSubject, mailText)
        return True
    else:
        return False

def verifyToken(token: str, tokenType: Literal["recovery", "register"]):
    conn = getMainDB()
    c = conn.execute("select * from "+tokenType+"_tokens where token=? and expiration>=datetime('now') and usedDate is null", (token,))
    row = c.fetchone()
    if row:
        return True
    else:
        return False

def createAccount(token: str, password: str, remoteip: str):
    conn = getMainDB()
    c = conn.execute("select * from register_tokens where token=? and expiration>=datetime('now') and usedDate is null", (token,))
    row = c.fetchone()
    if row:
        c2 = conn.execute("select * from users where email=?", (row["email"],))
        row2 = c2.fetchone()
        if not row2:
            passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
            conn.execute("insert into users (email,passwordHash) values (?,?)", (row["email"], passhash))
            conn.execute("update register_tokens set usedDate=datetime('now'), usedAddress=? where token=?", (remoteip, token))
            conn.commit()
            # notify admins?
            if siteconfig.get('notifyRegister') == True:
                mailSubject = "Lexonomy, new user registered"
                mailText = "Hi,\n\n"
                mailText += "new user registered to Lexonomy at " + siteconfig["baseUrl"] + " :\n\n"
                mailText += "  " + row["email"]
                mailText += "\n\nYours,\nThe Lexonomy team"
                for adminMail in siteconfig["admins"]:
                    sendmail(adminMail, mailSubject, mailText)
            return True
        else:
            return False
    else:
        return False

def resetPwd(token: str, password: str, remoteip: str):
    conn = getMainDB()
    c = conn.execute("select * from recovery_tokens where token=? and expiration>=datetime('now') and usedDate is null", (token,))
    row = c.fetchone()
    if row:
        passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
        conn.execute("update users set passwordHash=? where email=?", (passhash, row["email"]))
        conn.execute("update recovery_tokens set usedDate=datetime('now'), usedAddress=? where token=?", (remoteip, token))
        conn.commit()
        return True
    else:
        return False

def setConsent(email: str, consent: bool):
    conn = getMainDB()
    conn.execute("update users set consent=? where email=?", (consent, email))
    conn.commit()
    return True

def changePwd(email: str, password: str):
    conn = getMainDB()
    passhash = hashlib.sha1(password.encode("utf-8")).hexdigest();
    conn.execute("update users set passwordHash=? where email=?", (passhash, email))
    conn.commit()
    return True

def changeSkeUserName(email: str, ske_userName: str):
    conn = getMainDB()
    conn.execute("update users set ske_username=? where email=?", (ske_userName, email))
    conn.commit()
    return True

def changeSkeApiKey(email: str, ske_apiKey: str):
    conn = getMainDB()
    conn.execute("update users set ske_apiKey=? where email=?", (ske_apiKey, email))
    conn.commit()
    return True

def updateUserApiKey(user: User, apiKey: str):
    conn = getMainDB()
    conn.execute("update users set apiKey=? where email=?", (apiKey, user["email"]))
    conn.commit()
    sendApiKeyToSke(user, apiKey)
    return True

def sendApiKeyToSke(user: User, apiKey: str):
    if user["ske_username"] and user["ske_apiKey"]:
        data = json.dumps({"options": {"settings_lexonomyApiKey": apiKey, "settings_lexonomyEmail": user["email"].lower()}})
        queryData = urllib.parse.urlencode({ "username": user["ske_username"], "api_key": user["ske_apiKey"], "json": data })
        url = "https://api.sketchengine.eu/bonito/run.cgi/set_user_options?" + queryData
        res = urllib.request.urlopen(url)
    return True

def prepareApiKeyForSke(email: str):
    conn = getMainDB()
    c = conn.execute("select * from users where email=?", (email,))
    row = c.fetchone()
    if row:
        if row["apiKey"] == None or row["apiKey"] == "":
            lexapi = generateKey()
            conn.execute("update users set apiKey=? where email=?", (lexapi, email))
            conn.commit()
        else:
            lexapi = row["apiKey"]
        sendApiKeyToSke(row, lexapi)
    return True

class JWTDataUser(TypedDict):
    id: str
    email: str
    username: str
    api_key: str

class JWTData(TypedDict):
    user: JWTDataUser

class JWTStatusOkay(TypedDict):
    success: Literal[True]
    email: str
    key: str

class JTWStatusError(TypedDict):
    success: Literal[False]
    error: str

def processJWT(user: User, jwtdata: JWTData) -> Union[JWTStatusOkay, JTWStatusError]:
    conn = getMainDB()
    c = conn.execute("select * from users where ske_id=?", (jwtdata["user"]["id"],))
    row = c.fetchone()
    key = generateKey()
    now = datetime.datetime.utcnow()
    if row:
        #if SkE ID in database = log in user
        conn.execute("update users set sessionKey=?, sessionLast=? where email=?", (key, now, row["email"]))
        conn.commit()
        prepareApiKeyForSke(row["email"])
        return {"success": True, "email": row["email"], "key": key}
    else:
        if user["loggedin"]:
            #user logged in = save SkE ID in database
            conn.execute("update users set ske_id=?, ske_username=?, ske_apiKey=?, sessionKey=?, sessionLast=? where email=?", (jwtdata["user"]["id"], jwtdata["user"]["username"], jwtdata["user"]["api_key"], key, now, user["email"]))
            conn.commit()
            prepareApiKeyForSke(user["email"])
            return {"success": True, "email": user["email"], "key": key}
        else:
            #user not logged in = register and log in
            email = jwtdata["user"]["email"].lower()
            c2 = conn.execute("select * from users where email=?", (email,))
            row2 = c2.fetchone()
            if not row2:
                lexapi = generateKey()
                conn.execute("insert into users (email, passwordHash, ske_id, ske_username, ske_apiKey, sessionKey, sessionLast, apiKey) values (?, null, ?, ?, ?, ?, ?, ?)", (email, jwtdata["user"]["id"], jwtdata["user"]["username"], jwtdata["user"]["api_key"], key, now, lexapi))
                conn.commit()
                prepareApiKeyForSke(email)
                return {"success": True, "email": email, "key": key}
            else:
                return {"success": False, "error": "user with email " + email + " already exists. Log-in and connect account to SkE."}


def dictExists(dictID: str) -> bool:
    return os.path.isfile(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))

def suggestDictId() -> str:
    dictid = generateDictId()
    while dictid in prohibitedDictIDs or dictExists(dictid):
        dictid = generateDictId()
    return dictid

def makeDict(dictID: str, template: str, title: str, blurb: str, email: str):
    if title == "":
        title = "?"
    if dictID in prohibitedDictIDs or dictExists(dictID):
        return False
    if not template:
        template = "blank"
    if not template.startswith("/"):
        template = os.path.join("dictTemplates", template + ".sqlite.schema")
    #init db schema
    schema = open(template, 'r').read()
    conn = sqlite3.connect(os.path.join(siteconfig["dataDir"], "dicts", dictID + ".sqlite"))
    conn.executescript(schema)
    conn.commit()
    #update dictionary info
    users = {email: {"canEdit": True, "canConfig": True, "canDownload": True, "canUpload": True}}
    dictDB = getDB(dictID)
    c = dictDB.execute("SELECT count(*) AS total FROM configs WHERE id='users'")
    r = c.fetchone()
    if r['total'] == 0:
        dictDB.execute("INSERT INTO configs (id, json) VALUES (?, ?)", ("users", json.dumps(users)))
    else:
        dictDB.execute("UPDATE configs SET json=? WHERE id=?", (json.dumps(users), "users"))
    ident = {"title": title, "blurb": blurb}
    c = dictDB.execute("SELECT count(*) AS total FROM configs WHERE id='ident'")
    r = c.fetchone()
    if r['total'] == 0:
        dictDB.execute("INSERT INTO configs (id, json) VALUES (?, ?)", ("ident", json.dumps(ident)))
    else:
        dictDB.execute("UPDATE configs SET json=? WHERE id=?", (json.dumps(ident), "ident"))
    dictDB.commit()
    attachDict(dictDB, dictID)
    return True

def attachDict(dictDB: Connection, dictID: str):
    configs = readDictConfigs(dictDB)
    conn = getMainDB()
    conn.execute("delete from dicts where id=?", (dictID,))
    conn.execute("delete from user_dict where dict_id=?", (dictID,))
    title = configs["ident"]["title"]
    conn.execute("insert into dicts(id, title) values (?, ?)", (dictID, title))
    for email in configs["users"]:
        conn.execute("insert into user_dict(dict_id, user_email) values (?, ?)", (dictID, email.lower()))
    conn.commit()

def cloneDict(dictID: str, email: str):
    newID = suggestDictId()
    shutil.copy(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"), os.path.join(siteconfig["dataDir"], "dicts", newID + ".sqlite"))
    newDB = getDB(newID)
    res = newDB.execute("select json from configs where id='ident'")
    row = res.fetchone()
    ident = {"title": "?", "blurb": "?"}
    if row:
        ident = json.loads(row["json"])
        ident["title"] = "Clone of " + ident["title"]
    newDB.execute("update configs set json=? where id='ident'", (json.dumps(ident),))
    newDB.commit()
    attachDict(newDB, newID)
    return {"success": True, "dictID": newID, "title": ident["title"]}

def destroyDict(dictID: str):
    conn = getMainDB()
    conn.execute("delete from dicts where id=?", (dictID,))
    conn.execute("delete from user_dict where dict_id=?", (dictID,))
    conn.commit()
    os.remove(os.path.join(siteconfig["dataDir"], "dicts/" + dictID + ".sqlite"))
    return True

def moveDict(oldID: str, newID: str):
    if newID in prohibitedDictIDs or dictExists(newID):
        return False
    shutil.move(os.path.join(siteconfig["dataDir"], "dicts/" + oldID + ".sqlite"), os.path.join(siteconfig["dataDir"], "dicts/" + newID + ".sqlite"))
    conn = getMainDB()
    conn.execute("delete from dicts where id=?", (oldID,))
    conn.commit()
    dictDB = getDB(newID)
    attachDict(dictDB, newID)
    return True

def getDoc(docID: str):
    path = os.path.join("docs", docID + ".md")
    if os.path.isfile(path):
        doc = {"id": docID, "title":"", "html": ""}
        html = markdown.markdown(open(path).read())
        title = re.search('<h1>([^<]*)</h1>', html)
        if title:
            doc["title"] = re.sub('<\/?h1>','', title.group(0))
        doc["html"] = html
        return doc
    else:
        return False

class DictInfo(TypedDict):
    id: str
    title: str
    hasLinks: bool
    lang: str
    currentUserCanEdit: NotRequired[bool]
    currentUserCanDelete: NotRequired[bool]
    size: NotRequired[int]
    broken: NotRequired[bool]
    author: NotRequired[str]
    licence: NotRequired[str]
    favorite: NotRequired[bool]

def getDictsByUser(email: str) -> list[DictInfo]:
    dicts: List[DictInfo] = []
    email = str(email).lower()
    conn = getMainDB()
    favs = []
    c = conn.execute("SELECT * FROM dict_fav WHERE user_email=?", (email,))
    for r in c.fetchall():
        favs.append(r['dict_id'])
    c = conn.execute("SELECT DISTINCT d.id, d.title FROM dicts AS d INNER JOIN user_dict AS ud ON ud.dict_id=d.id WHERE ud.user_email=? OR d.id IN (SELECT dict_id FROM dict_fav WHERE user_email=?) ORDER BY d.title", (email, email))
    for r in c.fetchall():
        info: DictInfo = {"id": r["id"], "title": r["title"], "hasLinks": False, "lang": "", "favorite": False}
        try:
            dictDB = getDB(r["id"])
            cc = dictDB.execute("select count(*) as total from entries")
            info["size"] = cc.fetchone()["total"]
            configs = readDictConfigs(dictDB)
            if configs["users"][email] and configs["users"][email]["canEdit"]:
                info["currentUserCanEdit"] = True
            if configs["users"][email] and configs["users"][email]["canConfig"]:
                info["currentUserCanDelete"] = True
            if configs["links"] and len(configs["links"])>0:
                info["hasLinks"] = True
            if configs["ident"] and configs["ident"]["lang"]:
                info["lang"] = configs["ident"]["lang"]
            if r["id"] in favs:
                info["favorite"] = True
        except:
            info["broken"] = True
        dicts.append(info)
    return dicts

def getPublicDicts() -> list[DictInfo]:
    conn = getMainDB()
    c = conn.execute("select * from dicts order by title")
    dicts: List[DictInfo] = []
    for r in c.fetchall():
        try:
            dictDB = getDB(r["id"])
            configs = readDictConfigs(dictDB)
        except:
            continue
        if configs["publico"]["public"]:
            cc = dictDB.execute("select count(*) as total from entries")
            size = cc.fetchone()["total"]
            configs = loadHandleMeta(configs)
            dictinfo: DictInfo = {"id": r["id"], "title": r["title"], "author": "", "lang": configs["ident"].get("lang"), "licence": configs["publico"]["licence"], "size": size, "hasLinks": False}
            if len(list(configs["users"].keys())) > 0:
                dictinfo["author"] = re.sub(r"@.*","@...", list(configs["users"].keys())[0])
            if title := configs["metadata"].get("dc.title"):
                dictinfo["title"] = title
            if iso := configs["metadata"].get("dc.language.iso"):
                langs = [t['lang'] for t in get_iso639_1() if t['code3'] == configs["metadata"]["dc.language.iso"][0]]
                dictinfo["lang"] = langs[0] if len(langs) > 0 else dictinfo["lang"]
            if configs["metadata"].get("dc.rights") and configs["metadata"].get("dc.rights") != "":
                dictinfo["licence"] = configs["metadata"].get("dc.rights")
            if configs["metadata"].get("dc.contributor.author") and len(configs["metadata"].get("dc.contributor.author")) > 0:
                dictinfo["author"] = '; '.join(configs["metadata"].get("dc.contributor.author"))
            dicts.append(dictinfo)
    return dicts

def getLangList() -> List[Language]:
    langs: List[Language] = []
    codes = get_iso639_1()
    conn = getMainDB()
    c = conn.execute("SELECT DISTINCT language FROM dicts WHERE language!='' ORDER BY language")
    for r in c.fetchall():
        lang: IsoCode = next((item for item in codes if item["code"] == r["language"]), {})
        langs.append({"code": r["language"], "language": lang.get("lang")})
    return langs

def getDictList(lang: str, withLinks: bool, loadHandle: bool=False):
    dicts: List[DictInfo] = []
    conn = getMainDB()
    if lang:
        c = conn.execute("SELECT * FROM dicts WHERE language=? ORDER BY title", (lang, ))
    else:
        c = conn.execute("SELECT * FROM dicts ORDER BY title")
    for r in c.fetchall():
        info: DictInfo = {"id": r["id"], "title": r["title"], "lang": r["language"], "hasLinks": False}
        try:
            configs = readDictConfigs(getDB(r["id"]))
            if configs["links"] and len(configs["links"])>0:
                info["hasLinks"] = True
            if loadHandle:
                configs = loadHandleMeta(configs)
                if configs["metadata"].get("dc.title"):
                    info["title"] = configs["metadata"]["dc.title"]
        except:
            info["broken"] = True
        if not withLinks or (withLinks == True and info["hasLinks"] == True):
            dicts.append(info)
    return dicts

def getLinkList(headword: str, sourceLang: str, sourceDict: str, targetLang: str) -> List[DictionaryLink]:
    links: List[DictionaryLink] = []
    linkDB = getLinkDB()
    if sourceDict and sourceDict != "":
        dicts = [{"id": sourceDict}]
    else:
        dicts = getDictList(sourceLang, True)

    for d in dicts:
        try:
            dictDB = getDB(d["id"])
        except IOError:
            dictDB = None
        if dictDB:
            query = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND s.txt LIKE ? AND s.level=1"
            c = dictDB.execute(query, (headword+"%", ))
            for entry in c.fetchall():
                info0 = {"sourceDict": d["id"], "sourceHeadword": entry["hw"]}
                if entry["entry_id"] and entry["entry_id"] != "":
                    info0["sourceID"] = entry["entry_id"]
                if entry["link_el"] == "sense" and "_" in entry["link_id"]:
                    lia = entry["link_id"].split("_")
                    info0["sourceSense"] = lia[1]
                    if not info0["sourceID"]:
                        info0["sourceID"] = lia[0]
                info0["sourceURL"] = siteconfig["baseUrl"] + info0["sourceDict"] + "/" + str(info0["sourceID"])
                # first, find links with searched dict as source
                if targetLang:
                    targetDicts: List[str] = []
                    for td in getDictList(targetLang, True):
                        targetDicts.append(td["id"])
                    query2 = "SELECT * FROM links WHERE source_dict=? AND source_id=? AND target_dict IN "+"('"+"','".join(targetDicts)+"')"
                else:
                    query2 = "SELECT * FROM links WHERE source_dict=? AND source_id=?"
                data2 = (d["id"], entry["link_id"])
                c2 = linkDB.execute(query2, data2)
                for r2 in c2.fetchall():
                    info = info0.copy()
                    info["targetDict"] = r2["target_dict"]
                    info["confidence"] = r2["confidence"]
                    try:
                        targetDB = getDB(r2["target_dict"])
                    except IOError:
                        targetDB = None
                    if targetDB:
                        info["targetLang"] = readDictConfigs(targetDB)['ident']['lang']
                        info["targetDictConcept"] = False
                        if r2["target_element"] == "sense" and "_" in r2["target_id"]:
                            lia = r2["target_id"].split("_")
                            info["targetSense"] = lia[1]
                        query3 = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt=? AND s.level=1"
                        c3 = targetDB.execute(query3, (r2["target_id"],))
                        for r3 in c3.fetchall():
                            info["targetHeadword"] = r3["hw"]
                            info["targetID"] = r3["entry_id"]
                            info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                            links.append(info)
                    else:
                        info["targetHeadword"] = r2["target_id"]
                        info["targetID"] = r2["target_id"]
                        info["targetDictConcept"] = True
                        info["targetURL"] = ""
                        info["targetSense"] = ""
                        info["targetLang"] = ""
                        links.append(info)
                # second, find links with search dict as target
                if targetLang:
                    query2 = "SELECT * FROM links WHERE target_dict=? AND target_id=? AND source_dict IN "+"('"+"','".join(targetDicts)+"')"
                else:
                    query2 = "SELECT * FROM links WHERE target_dict=? AND target_id=?"
                data2 = (d["id"], entry["link_id"])
                c2 = linkDB.execute(query2, data2)
                for r2 in c2.fetchall():
                    info = info0.copy()
                    info["targetDict"] = r2["source_dict"]
                    info["confidence"] = r2["confidence"]
                    try:
                        sourceDB = getDB(r2["source_dict"])
                    except IOError:
                        sourceDB = None
                    if sourceDB:
                        info["targetLang"] = readDictConfigs(sourceDB)['ident']['lang']
                        info["targetDictConcept"] = False
                        if r2["source_element"] == "sense" and "_" in r2["source_id"]:
                            lia = r2["source_id"].split("_")
                            info["targetSense"] = lia[1]
                        query3 = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt=? AND s.level=1"
                        c3 = sourceDB.execute(query3, (r2["source_id"],))
                        for r3 in c3.fetchall():
                            info["targetHeadword"] = r3["hw"]
                            info["targetID"] = r3["entry_id"]
                            info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                            links.append(info)
                    else:
                        info["targetHeadword"] = r2["source_id"]
                        info["targetID"] = r2["source_id"]
                        info["targetDictConcept"] = True
                        info["targetURL"] = ""
                        info["targetSense"] = ""
                        info["targetLang"] = ""
                        links.append(info)
        else:
            # source dictionary is "concept", use headword as target_id
            info0 = {"sourceDict": d["id"], "sourceHeadword": headword, "sourceID": headword, "sourceDictConcept": True, "sourceURL": "", "sourceSense": ""}
            # first, find links with searched dict as source
            if targetLang:
                targetDicts = []
                for td in getDictList(targetLang, True):
                    targetDicts.append(td["id"])
                query2 = "SELECT * FROM links WHERE source_dict=? AND source_id=? AND target_dict IN "+"('"+"','".join(targetDicts)+"')"
            else:
                query2 = "SELECT * FROM links WHERE source_dict=? AND source_id=?"
            data2 = (d["id"], headword)
            c2 = linkDB.execute(query2, data2)
            for r2 in c2.fetchall():
                info = info0.copy()
                info["targetDict"] = r2["target_dict"]
                info["confidence"] = r2["confidence"]
                try:
                    targetDB = getDB(r2["target_dict"])
                except IOError:
                    targetDB = None
                if targetDB:
                    info["targetLang"] = readDictConfigs(targetDB)['ident']['lang']
                    info["targetDictConcept"] = False
                    if r2["target_element"] == "sense" and "_" in r2["target_id"]:
                        lia = r2["target_id"].split("_")
                        info["targetSense"] = lia[1]
                    query3 = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt=? AND s.level=1"
                    c3 = targetDB.execute(query3, (r2["target_id"],))
                    for r3 in c3.fetchall():
                        info["targetHeadword"] = r3["hw"]
                        info["targetID"] = r3["entry_id"]
                        info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                        links.append(info)
                else:
                    info["targetHeadword"] = r2["target_id"]
                    info["targetID"] = r2["target_id"]
                    info["targetDictConcept"] = True
                    info["targetURL"] = ""
                    info["targetSense"] = ""
                    info["targetLang"] = ""
                    links.append(info)
            # second, find links with search dict as target
            if targetLang:
                query2 = "SELECT * FROM links WHERE target_dict=? AND target_id=? AND source_dict IN "+"('"+"','".join(targetDicts)+"')"
            else:
                query2 = "SELECT * FROM links WHERE target_dict=? AND target_id=?"
            data2 = (d["id"], headword)
            c2 = linkDB.execute(query2, data2)
            for r2 in c2.fetchall():
                info = info0.copy()
                info["targetDict"] = r2["source_dict"]
                info["confidence"] = r2["confidence"]
                try:
                    sourceDB = getDB(r2["source_dict"])
                except IOError:
                    sourceDB = None
                if sourceDB:
                    info["targetLang"] = readDictConfigs(sourceDB)['ident']['lang']
                    info["targetDictConcept"] = False
                    if r2["source_element"] == "sense" and "_" in r2["source_id"]:
                        lia = r2["source_id"].split("_")
                        info["targetSense"] = lia[1]
                    query3 = "SELECT DISTINCT l.entry_id AS entry_id, l.txt AS link_id, l.element AS link_el, s.txt AS hw FROM searchables AS s, linkables AS l  WHERE s.entry_id=l.entry_id AND l.txt=? AND s.level=1"
                    c3 = sourceDB.execute(query3, (r2["source_id"],))
                    for r3 in c3.fetchall():
                        info["targetHeadword"] = r3["hw"]
                        info["targetID"] = r3["entry_id"]
                        info["targetURL"] = siteconfig["baseUrl"] + info["targetDict"] + "/" + str(info["targetID"])
                        links.append(info)
                else:
                    info["targetHeadword"] = r2["source_id"]
                    info["targetID"] = r2["source_id"]
                    info["targetDictConcept"] = True
                    info["targetURL"] = ""
                    info["targetSense"] = ""
                    info["targetLang"] = ""
                    links.append(info)

    # add dictionary titles
    dictUsed = {}
    for link in links:
        dictTitle = link["sourceDict"]
        if link["sourceDict"] in dictUsed:
            dictTitle = dictUsed[link["sourceDict"]]
        else:
            try:
                dictDB = getDB(link["sourceDict"])
            except IOError:
                dictDB = None
            if dictDB:
                dictConf = readDictConfigs(dictDB)
                dictConf = loadHandleMeta(dictConf)
                if dictConf["metadata"].get("dc.title"):
                    dictTitle = dictConf["metadata"]["dc.title"]
                else:
                    dictTitle = dictConf["ident"]["title"]
                dictUsed[link["sourceDict"]] = dictTitle
        link["sourceDictTitle"] = dictTitle
        dictTitle = link["targetDict"]
        if link["targetDict"] in dictUsed:
            dictTitle = dictUsed[link["targetDict"]]
        else:
            try:
                dictDB = getDB(link["targetDict"])
            except IOError:
                dictDB = None
            if dictDB:
                dictConf = readDictConfigs(dictDB)
                dictConf = loadHandleMeta(dictConf)
                if dictConf["metadata"].get("dc.title"):
                    dictTitle = dictConf["metadata"]["dc.title"]
                else:
                    dictTitle = dictConf["ident"]["title"]
                dictUsed[link["targetDict"]] = dictTitle
        link["targetDictTitle"] = dictTitle

    return links

def listUsers(searchtext: str, howmany: int) -> UserList:
    conn = getMainDB()
    c = conn.execute("select * from users where email like ? order by email limit ?", ("%"+searchtext+"%", howmany))
    users: List[ListedUser] = []
    for r in c.fetchall():
        users.append({"id": r["email"], "title": r["email"]})
    c = conn.execute("select count(*) as total from users where email like ?", ("%"+searchtext+"%", ))
    r = c.fetchone()
    total = r["total"]
    return {"entries":users, "total": total}

# Admin functionality
def createUser(xml: str):
    from lxml import etree as ET
    root = ET.fromstring(xml)
    email = root.attrib["email"]
    passhash = hashlib.sha1(root.attrib["password"].encode("utf-8")).hexdigest();
    conn = getMainDB()
    conn.execute("insert into users(email, passwordHash) values(?, ?)", (email.lower(), passhash))
    conn.commit()
    return {"entryID": email, "adjustedXml": readUser(email)["xml"]}

def updateUser(email, xml):
    from lxml import etree as ET
    root = ET.fromstring(xml)
    if root.attrib['password']:
        passhash = hashlib.sha1(root.attrib["password"].encode("utf-8")).hexdigest();
        conn = getMainDB()
        conn.execute("update users set passwordHash=? where email=?", (passhash, email.lower()))
        conn.commit()
    return readUser(email)

def deleteUser(email: str):
    conn = getMainDB()
    conn.execute("delete from users where email=?", (email.lower(),))
    conn.commit()
    return True

def readUser(email: str):
    conn = getMainDB()
    c = conn.execute("select * from users where email=?", (email.lower(), ))
    r = c.fetchone()
    if r:
        if r["sessionLast"]:
            xml =  "<user lastSeen='"+r["sessionLast"]+"'>"
        else:
            xml =  "<user>"
        c2 = conn.execute("select d.id, d.title from user_dict as ud inner join dicts as d on d.id=ud.dict_id  where ud.user_email=? order by d.title", (r["email"], ))
        for r2 in c2.fetchall():
            xml += "<dict id='" + r2["id"] + "' title='" + clean4xml(r2["title"]) + "'/>"
        xml += "</user>"
        return {"email": r["email"], "xml": xml}
    else:
        return {"email":"", "xml":""}

def listDicts(searchtext, howmany):
    conn = getMainDB()
    c = conn.execute("select * from dicts where id like ? or title like ? order by id limit ?", ("%"+searchtext+"%", "%"+searchtext+"%", howmany))
    dicts = []
    for r in c.fetchall():
        dicts.append({"id": r["id"], "title": r["title"]})
    c = conn.execute("select count(*) as total from dicts where id like ? or title like ?", ("%"+searchtext+"%", "%"+searchtext+"%"))
    r = c.fetchone()
    total = r["total"]
    return {"entries": dicts, "total": total}

def readDict(dictId):
    conn = getMainDB()
    c = conn.execute("select * from dicts where id=?", (dictId, ))
    r = c.fetchone()
    if r:
        xml =  "<dict id='"+clean4xml(r["id"])+"' title='"+clean4xml(r["title"])+"'>"
        c2 = conn.execute("select u.email from user_dict as ud inner join users as u on u.email=ud.user_email where ud.dict_id=? order by u.email", (r["id"], ))
        for r2 in c2.fetchall():
            xml += "<user email='" + r2["email"] + "'/>"
        xml += "</dict>"
        return {"id": r["id"], "xml": xml}
    else:
        return {"id":"", "xml":""}

def clean4xml(text: str) -> str:
    "Escape the xml"
    return text.replace("&", "&amp;").replace('"', "&quot;").replace("'", "&apos;").replace("<", "&lt;").replace(">", "&gt;");

def markdown_text(text: str) -> str:
    "Render markdown as html"
    return markdown.markdown(text).replace("<a href=\"http", "<a target=\"_blank\" href=\"http")

def exportEntryXml(dictDB: Connection, dictID: str, entryID: int, configs: Configs, baseUrl: str):
    c = dictDB.execute("select * from entries where id=?", (entryID,))
    row = c.fetchone()
    if row:
        xml = row["xml"]
        attribs = " this=\"" + baseUrl + dictID + "/" + str(row["id"]) + ".xml\""
        c2 = dictDB.execute("select e1.id, e1.title from entries as e1 where e1.sortkey<(select sortkey from entries where id=?) order by e1.sortkey desc limit 1", (entryID, ))
        r2 = c2.fetchone()
        if r2:
            attribs += " previous=\"" + baseUrl + dictID + "/" + str(r2["id"]) + ".xml\""
        c2 = dictDB.execute("select e1.id, e1.title from entries as e1 where e1.sortkey>(select sortkey from entries where id=?) order by e1.sortkey asc limit 1", (entryID, ))
        r2 = c2.fetchone()
        if r2:
            attribs += " next=\"" + baseUrl + dictID + "/" + str(r2["id"]) + ".xml\""
        xml = "<lexonomy" + attribs + ">" + xml + "</lexonomy>"
        return {"entryID": row["id"], "xml": xml}
    else:
        return {"entryID": 0, "xml": ""}

def resolveSubentries(dictDB: Connection, xml: Union[str, Tag]) -> Tag:
    "Recursively replace subentry references (<lxnm:subentryParent>) with their contents."
    if type(xml) is str:
        xml = parse(xml)
    subs = xml.find_all("lxnm:subentryParent")
    for sub in subs:
        subentryID = int(sub.attrs["id"])
        r = dictDB.execute("select * from entries where id = ?", (subentryID, )).fetchone()
        sub.replace_with(resolveSubentries(dictDB, r["xml"]))

    return xml

def export(dictID: str, dictDB: Connection, configs: Configs, clean: bool = True) -> Iterable[str]:
    "Export all entries, (optionally) cleaning all lexonomy things."
    def prepare_for_export(xml: str) -> Tag:
        """Pre-process the xml to replace subentry references with their contents, and optionally remove all lexonomy bookkeeping.
            Return tag so we don't stringify and re-parse subentries.
        """
        tag = parse(xml)
        # Note: first search, THEN modify - don't modify while iterating.
        # 1. subentries - replace with their contents.
        subs = tag.find_all("lxnm:subentryParent")
        for sub in subs:
            subentryID = int(sub.attrs["id"])
            r = dictDB.execute("select * from entries where id = ?", (subentryID, )).fetchone()
            sub.replace_with(prepare_for_export(r["xml"]))
        if clean:
            # 2. linkables - remove the attribute
            for linkable in tag.find_all(attrs = {"lxnm:linkable": True}):
                del linkable.attrs["lxnm:linkable"]
            # 3. flags - remove if we shouldn't keep them
            if configs["flagging"]["flag_element"]:
                flags = tag.find_all(configs["flagging"]["flag_element"])
                for flag in flags:
                    flag.decompose()
            # 4. other bookkeeping attributes at the root - remove them.
            del tag.attrs["lxnm:id"]
            del tag.attrs["xmlns:lxnm"]
        return tag

    rootname = dictID.lstrip(" 0123456789") or "lexonomy"
    run_xslt = get_xslt_transformer(configs.get("download", {}).get("xslt", ""))

    yield "<"+rootname+">\n"
    for r in dictDB.execute("SELECT * FROM entries").fetchall():
        result = prepare_for_export(r["xml"]).prettify()
        result = run_xslt(result) or re.sub("><",">\n<",result)
        yield result
        yield "\n"
    yield "</"+rootname+">\n"

def readNabesByEntryID(dictDB: Connection, dictID: str, entryID: int, configs: Configs):
    """In a list of all entries of the root type, return the nearby entries of the target.
        E.G. id of entry "water" is inserted: return 8 previous and 15 following entries next to entry "water".
    """
    nabes: List[SortableEntry] = []
    c = dictDB.execute("select id, sortkey, from entries where doctype=? ", (configs["xema"]["root"],))
    for r in c.fetchall():
        nabes.append({"id": r["id"], "sortkey": r["sortkey"]})

    sortEntries(configs, nabes)

    #select before/after entries
    i = 0
    for n in nabes:
        if n["id"] == -1:
            break
        i += 1

    # Return the surrounding entries, excluding the target entry
    return readEntries(dictDB, configs, nabes[i-8: i] + nabes[i+1:i+15], xml=False)


def readNabesByText(dictDB: Connection, dictID: str, configs: Configs, text: str):
    nabes: list[SortableEntry] = []
    c = dictDB.execute("select id, sortkey from entries where doctype=? ", (configs["xema"]["root"],))
    for r in c.fetchall():
        nabes.append({"id": r["id"], "sortkey": r["sortkey"]})

    # insert a fake ID we can find again later
    nabes.append({"id": -1, "sortkey": text})
    sortEntries(configs, nabes)

    #select before/after entries
    i = 0
    for n in nabes:
        if n["id"] == -1:
            break
        i += 1

    # Return the surrounding entries, excluding the fake entry we put in the list
    return readEntries(dictDB, configs, nabes[i-8: i] + nabes[i+1:i+15], xml=False)

def readRandoms(dictDB: Connection):
    configs = readDictConfigs(dictDB)
    limit = 75

    c = dictDB.execute("select id, sortkey from entries where doctype=? order by random() limit ?", (configs["xema"]["root"], limit))
    ids_and_sortkeys: List[SortableEntry] = []
    for r in c.fetchall():
        ids_and_sortkeys.append({"id": r["id"], "sortkey": r["sortkey"]})

    return {
        "entries": readEntries(dictDB, configs, ids_and_sortkeys, titlePlain=True),
        "more": dictDB.execute("select count(*) as total from entries").fetchone()["total"] > limit
    }

def readRandomOne(dictDB: Connection, dictID: str, configs: Configs) -> EntryFromDatabase:
    id = dictDB.execute("select id from entries where doctype=? order by random() limit 1", (configs["xema"]["root"], )).fetchone()["id"]
    entries = readEntries(dictDB, configs, id, xml = True)
    return entries[0] if len(entries) > 0 else {
        "flag": "",
        "id": 0,
        "parententries": [],
        "subentries": [],
        "title": "",
        "xml": "",
        "sortkey": "",
    }

def purge(dictDB: Connection, email: str, historiography: Historiography):
    dictDB.execute("insert into history(entry_id, action, [when], email, xml, historiography) select id, 'purge', ?, ?, xml, ? from entries", (str(datetime.datetime.utcnow()), email, json.dumps(historiography)))
    dictDB.execute("delete from entries")
    dictDB.commit()
    dictDB.execute("vacuum")
    dictDB.commit()
    return True

def showImportErrors(filename: str, truncate: int):
    with open(filename+".err", "r") as content_file:
        content = content_file.read()
    if (truncate):
        content = content[0:truncate].replace("<", "&lt;")
        return {"errorData": content, "truncated": truncate}
    else:
        return content

class ExternalProcessStatus(TypedDict):
    progressMessage: str
    finished: bool
    errors: bool

def importfile(dictID: str, filepath: str, user: str, purge: bool = False, saveSurroundingContent: bool = False) -> ExternalProcessStatus:
    # TODO port to bgjob?
    dbpath = os.path.join(siteconfig["dataDir"], "dicts", dictID+".sqlite")
    args: list[str] = []
    if purge:
        args.append("-pp") # purge both entries AND history
    if saveSurroundingContent:
        args.append("-a")
    args.append("-u")
    args.append(user)
    args.append(dbpath)
    args.append(filepath)
    return _startSubprocess(subProcessID = filepath, scriptPath = os.path.join("adminscripts", "import.py"), args = args)

def _startSubprocess(subProcessID: str, scriptPath: str, args: list[str]) -> ExternalProcessStatus:
    "Start the subprocess if it is not already running or finished. Return the status of the process if is was already running."
    import subprocess
    import sys
    pidfile = subProcessID + ".pid"
    errfile = subProcessID + ".err"
    if os.path.isfile(pidfile + ".lock"):
        return _getProcessStatus(pidfile, errfile)

    open(pidfile + ".lock", "w").close()
    pidfile_f = open(pidfile, "w")
    errfile_f = open(errfile, "w")

    args = [sys.executable, scriptPath] + args # prepend executable.
    p = subprocess.Popen(args, stdout=pidfile_f, stderr=errfile_f, start_new_session=True, close_fds=True)
    return _getProcessStatus(pidfile, errfile)

def _getProcessStatus(pidfile: str, errfile: str) -> ExternalProcessStatus:
    """read the pidfile and errfile and return the status of the proces.
    When the pidfile ends with a line

    Args:
        pidfile (str): file path to the console output file
        errfile (str): file path to the error output file
    """
    if not os.path.exists(pidfile):
        return {
            "finished": True,
            "errors": False,
            "progressMessage": "Finished",
        }

    content = ''
    while content == '':
        with open(pidfile, "r") as content_file:
            content = content_file.read()
    pid_data = re.split(r"[\n\r]", content)
    finished = False
    if len(pid_data) > 1:
        if pid_data[-1] == "":
            progress = pid_data[-2]
        else:
            progress = pid_data[-1]
        if "100%" in progress:
            finished = True
            os.unlink(pidfile)
            os.unlink(errfile)
    else:
        progress = "Import started. Please wait..."
    errors = False
    if os.path.isfile(errfile) and os.stat(errfile).st_size:
        errors = True
    return {"progressMessage": progress, "finished": finished, "errors": errors}

def readDoctypesUsed(dictDB: Connection):
    c = dictDB.execute("select doctype from entries group by doctype order by count(*) desc")
    doctypes: list[str] = []
    for r in c.fetchall():
        doctypes.append(r["doctype"])
    return doctypes

def getLastEditedEntry(dictDB: Connection, email: str):
    c = dictDB.execute("select entry_id from history where email=? order by [when] desc limit 1", (email, ))
    r = c.fetchone()
    if r:
        return str(r["entry_id"])
    else:
        return ""

def getDictStats(dictDB: Connection):
    res = {"entryCount": 0, "needUpdate": 0}
    c = dictDB.execute("select count(*) as entryCount from entries")
    r = c.fetchone()
    res["entryCount"] = r["entryCount"]
    c = dictDB.execute("select count(*) as needUpdate from entries where needs_update=1")
    r = c.fetchone()
    res["needUpdate"] = r["needUpdate"]
    return res

def updateDictConfig(dictDB: Connection, dictID: str, configID: str, content: Any) -> Tuple[Any, bool]:
    dictDB.execute("delete from configs where id=?", (configID, ))
    dictDB.execute("insert into configs(id, json) values(?, ?)", (configID, json.dumps(content)))
    dictDB.commit()

    # post-process actions
    if configID == "ident":
        attachDict(dictDB, dictID)
        if content.get('lang'):
            lang = content.get('lang')
            conn = getMainDB()
            conn.execute("UPDATE dicts SET language=? WHERE id=?", (lang, dictID))
            conn.commit()
    elif configID == 'users':
        attachDict(dictDB, dictID)
    elif configID == "titling" or configID == "searchability" or configID == "subbing" or configID == "flagging" or configID == "links" or configID == "autonumbering":
        flagForUpdate(dictDB) # Something changed that influences entries xml or metadata (headword)

    return content

def flagForUpdate(dictDB: Connection) -> int:
    "Flag all entries in the dictionary for an update"
    c = dictDB.execute("update entries set needs_update=1")
    dictDB.commit()
    return (c.rowcount > 0)

def makeQuery(lemma: str):
    words: list[str] = []
    for w in lemma.split(" "):
        if w != "":
            words.append('[lc="'+w+'"|lemma_lc="'+w+'"]')
    ret = "aword," + "".join(words)
    return ret

def getEntryLinks(dictDB: Connection, dictID: str, entryID: int):
    ret = {"out": [], "in": []}
    cl = dictDB.execute("SELECT count(*) as count FROM sqlite_master WHERE type='table' and name='linkables'")
    rl = cl.fetchone()
    if rl['count'] > 0:
        c = dictDB.execute("SELECT * FROM linkables WHERE entry_id=?", (entryID,))
        conn = getLinkDB()
        for r in c.fetchall():
            lout = []
            lin = []
            for lr in links_get(dictID, r["element"], r["txt"], "", "", ""):
                lr['source_preview'] = r['preview']
                lout.append(lr)
            for lr in links_get("", "", "", dictID, r["element"], r["txt"]):
                lr['target_preview'] = r['preview']
                lin.append(lr)
            ret["out"] = ret["out"] + lout
            ret["in"] = ret["in"] + lin
    return ret

def readDictHistory(dictDB: Connection, dictID: str, configs: Configs, entryID: int) -> List[HistoryEntry]:
    html_transformer = get_xslt_transformer(configs.get("xemplate", {}).get("_xsl", ""))

    history: List[HistoryEntry] = []
    c = dictDB.execute("select * from history where entry_id=? order by [when] desc", (entryID,))
    for row in c.fetchall():
        xml = row["xml"]
        history.append({
            "entry_id": row["entry_id"],
            "revision_id": row["id"],
            "content": xml,
            "contentHtml": get_entry_html(configs, xml, html_transformer),
            "action": row["action"],
            "when": row["when"],
            "email": row["email"] or "",
            "historiography": json.loads(row["historiography"])
        })
    return history

def verifyUserApiKey(email: str, apikey: str):
    conn = getMainDB()
    if email == '':
        c = conn.execute("select email from users where apiKey=?", (apikey,))
        row = c.fetchone()
    else:
        c = conn.execute("select email from users where email=? and apiKey=?", (email, apikey))
        row = c.fetchone()
    if not row or siteconfig["readonly"]:
        return {"valid": False}
    else:
        return {"valid": True, "email": email or ""}

def links_add(source_dict: str, source_el: str, source_id: str, target_dict: str, target_el: str, target_id: str, confidence: float=0, conn: Optional[Connection]=None):
    if not conn:
        conn = getLinkDB()
    c = conn.execute("SELECT * FROM links WHERE source_dict=? AND source_element=? AND source_id=? AND target_dict=? AND target_element=? AND target_id=?", (source_dict, source_el, source_id, target_dict, target_el, target_id))
    row = c.fetchone()
    if not row:
        conn.execute("INSERT INTO links (source_dict, source_element, source_id, target_dict, target_element, target_id, confidence) VALUES (?,?,?,?,?,?,?)", (source_dict, source_el, source_id, target_dict, target_el, target_id, confidence))
        conn.commit()
    c = conn.execute("SELECT * FROM links WHERE source_dict=? AND source_element=? AND source_id=? AND target_dict=? AND target_element=? AND target_id=?", (source_dict, source_el, source_id, target_dict, target_el, target_id))
    row = c.fetchone()
    return {"link_id": row["link_id"], "source_dict": row["source_dict"], "source_el": row["source_element"], "source_id": row["source_id"], "target_dict": row["target_dict"], "target_el": row["target_element"], "target_id": row["target_id"], "confidence": row["confidence"]}

def links_delete(dictID: str, linkID: str):
    conn = getLinkDB()
    conn.execute("DELETE FROM links WHERE source_dict=? AND link_id=?", (dictID, linkID))
    conn.commit()
    c = conn.execute("select * from links where link_id=?", (linkID, ))
    if len(c.fetchall()) > 0:
        return False
    else:
        return True

def links_get(source_dict: str, source_el: str, source_id: str, target_dict: str, target_el: str, target_id: str):
    params: list[Any] = []
    where: list[str] = []
    if source_dict != "":
        where.append("source_dict=?")
        params.append(source_dict)
    if source_el != "":
        where.append("source_element=?")
        params.append(source_el)
    if source_id != "":
        where.append("source_id=?")
        params.append(source_id)
    if target_dict != "":
        where.append("target_dict=?")
        params.append(target_dict)
    if target_el != "":
        where.append("target_element=?")
        params.append(target_el)
    if target_id != "":
        where.append("target_id=?")
        params.append(target_id)
    query = "SELECT * FROM links"
    if len(where) > 0:
        query += " WHERE " + " AND ".join(where)
    conn = getLinkDB()
    c = conn.execute(query, tuple(params))
    res = []
    #first, get all dictionaries in results
    dbs: dict[str, Connection] = {}
    dbconfigs: dict[str, Configs] = {}
    for row in c.fetchall():
        if not row["source_dict"] in dbs:
            dbs[row["source_dict"]] = getDB(row["source_dict"])
            dbconfigs[row["source_dict"]] = readDictConfigs(dbs[row["source_dict"]])
        if not row["target_dict"] in dbs:
            try:
                dbs[row["target_dict"]] = getDB(row["target_dict"])
                dbconfigs[row["target_dict"]] = readDictConfigs(dbs[row["target_dict"]])
            except:
                dbconfigs[row["target_dict"]] = None
    #now the actual results
    c = conn.execute(query, tuple(params))
    for row in c.fetchall():
        sourceDB = dbs[row["source_dict"]]
        sourceConfig = dbconfigs[row["source_dict"]]
        targetDB = dbs[row["target_dict"]]
        targetConfig = dbconfigs[row["target_dict"]]
        source_entry = ""
        source_hw = ""
        try:
            # test if source DB has linkables tables
            ress = sourceDB.execute("SELECT entry_id FROM linkables WHERE txt=?", (row["source_id"],))
            rows = ress.fetchone()
            if rows:
                source_entry = rows["entry_id"]
        except:
            source_entry = ""
        # fallback for ontolex ids
        if source_entry == "" and re.match(r"^[0-9]+_[0-9]+$", row["source_id"]):
            source_entry = row["source_id"].split("_")[0]
        if source_entry != "":
            source_hw = readEntries(sourceDB, sourceConfig, int(source_entry), titlePlain=True)[0]["titlePlain"]
        target_entry = ""
        target_hw = ""
        try:
            # test if target DB has linkables tables
            rest = targetDB.execute("SELECT entry_id FROM linkables WHERE txt=?", (row["target_id"],))
            rowt = rest.fetchone()
            if rowt:
                target_entry = rowt["entry_id"]
        except:
            target_entry = ""
        # fallback for ontolex ids and CILI
        if target_entry == "" and re.match(r"^[0-9]+_[0-9]+$", row["target_id"]):
            target_entry = row["target_id"].split("_")[0]
        if target_entry != "":
            target_hw = readEntries(targetDB, targetConfig, int(target_entry), titlePlain=True)[0]["titlePlain"]
        if target_dict == "CILI":
            target_entry = row["target_id"]
            target_hw = row["target_id"]

        res.append({"link_id": row["link_id"], "source_dict": row["source_dict"], "source_entry": str(source_entry), "source_hw": source_hw, "source_el": row["source_element"], "source_id": row["source_id"], "target_dict": row["target_dict"], "target_entry": str(target_entry), "target_hw": target_hw, "target_el": row["target_element"], "target_id": row["target_id"], "confidence": row["confidence"]})
    return res

def getDictLinkables(dictDB: Connection):
    ret = []
    cl = dictDB.execute("SELECT count(*) as count FROM sqlite_master WHERE type='table' and name='linkables'")
    rl = cl.fetchone()
    if rl['count'] > 0:
        c = dictDB.execute("SELECT * FROM linkables ORDER BY entry_id, element, txt")
        for r in c.fetchall():
            ret.append({"element": r["element"], "link": r["txt"], "entry": r["entry_id"], "preview": r["preview"]})
    return ret

def isrunning(dictDB: Connection, bgjob: str, pid: Optional[int]=None):
    if not pid:
        c = dictDB.execute("SELECT pid FROM bgjobs WHERE id=?", (bgjob,))
        job = c.fetchone()
        if not job:
            return False
        pid = job["pid"]
    if pid < 0:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True

def linkNAISC(dictDB, dictID, configs, otherdictDB, otherdictID, otherconfigs):
    import subprocess
    res = isLinking(dictDB)
    if "otherdictID" in res:
        return res
    c = dictDB.execute("INSERT INTO bgjobs (type, data) VALUES ('naisc-local', ?)", (otherdictID,))
    dictDB.commit()
    jobid = c.lastrowid
    errfile = open("/tmp/linkNAISC-%s-%s.err" % (dictID, otherdictID), "w")
    outfile = open("/tmp/linkNAISC-%s-%s.out" % (dictID, otherdictID), "w")
    bgjob = subprocess.Popen(['adminscripts/linkNAISC.sh', siteconfig["dataDir"], dictID, otherdictID, siteconfig["naiscCmd"], str(jobid)],
        start_new_session=True, close_fds=True, stderr=errfile, stdout=outfile, stdin=subprocess.DEVNULL)
    dictDB.execute("UPDATE bgjobs SET pid=? WHERE id=?", (bgjob.pid, jobid))
    dictDB.commit()
    return {"bgjob": jobid}

def autoImage(dictDB, dictID, configs, addElem, addNumber):
    import subprocess
    res = isAutoImage(dictDB)
    if res["bgjob"] and res["bgjob"] > 0:
        return res
    c = dictDB.execute("INSERT INTO bgjobs (type, data) VALUES ('autoimage', 'autoimage')")
    dictDB.commit()
    jobid = c.lastrowid
    errfile = open("/tmp/autoImage-%s.err" % (dictID), "w")
    outfile = open("/tmp/autoImage-%s.out" % (dictID), "w")
    bgjob = subprocess.Popen(['adminscripts/autoImage.py', siteconfig["dataDir"], dictID, addElem, str(addNumber), str(jobid)],
        start_new_session=True, close_fds=True, stderr=errfile, stdout=outfile, stdin=subprocess.DEVNULL)
    dictDB.execute("UPDATE bgjobs SET pid=? WHERE id=?", (bgjob.pid, jobid))
    dictDB.commit()
    return {"bgjob": jobid}

def isLinking(dictDB):
    c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bgjobs'")
    if not c.fetchone():
        dictDB.execute("CREATE TABLE bgjobs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, data TEXT, finished INTEGER DEFAULT -1, pid DEFAULT -1)")
        dictDB.commit()
    c = dictDB.execute("SELECT * FROM bgjobs WHERE finished=-1")
    job = c.fetchone()
    if job:
        pid = job["pid"]
        if isrunning(dictDB, job["id"], pid):
            return {"bgjob": job["id"], "otherdictID": job["data"]}
        else: # mark as dead
            c = dictDB.execute("UPDATE bgjobs SET finished=-2 WHERE pid=?", (pid,))
    return {"bgjob": -1}

def isAutoImage(dictDB):
    c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='bgjobs'")
    if not c.fetchone():
        dictDB.execute("CREATE TABLE bgjobs (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, data TEXT, finished INTEGER DEFAULT -1, pid DEFAULT -1)")
        dictDB.commit()
    c = dictDB.execute("SELECT * FROM bgjobs WHERE finished=-1 AND data='autoimage'")
    job = c.fetchone()
    if job:
        pid = job["pid"]
        if isrunning(dictDB, job["id"], pid):
            return {"bgjob": job["id"]}
        else: # mark as dead
            c = dictDB.execute("UPDATE bgjobs SET finished=-2 WHERE pid=?", (pid,))
    return {"bgjob": -1}


def getNAISCstatus(dictDB, dictID, otherdictID, bgjob):
    try:
        err = open("/tmp/linkNAISC-%s-%s.err" % (dictID, otherdictID))
    except:
        return None
    if "[COMPLETED] Done\n" in err.readlines():
        return {"status": "finished"}
    if isrunning(dictDB, bgjob):
        return {"status": "linking"}
    else:
        return {"status": "failed"}

def autoImageStatus(dictDB, dictID, bgjob):
    try:
        out = open("/tmp/autoImage-%s.out" % (dictID))
    except:
        return None
    if "COMPLETED\n" in out.readlines():
        return {"status": "finished"}
    if isrunning(dictDB, bgjob):
        return {"status": "working"}
    else:
        return {"status": "failed"}

def addAutoNumbers(dictDB: Connection, configs: Configs, user: User):
    """Runs the autonumbering operation in manual mode"""
    config = configs.get("autonumbering")
    if not config or not (len(config)):
        return {"success": True, "processed": 0}
    total = 0
    for e in dictDB.execute("select id, xml from entries").fetchall():
        id = e["id"]
        xml = parse(e["xml"])
        entry_was_updated = presave_autonumbering(dictDB, configs, xml, isAutoApplying = False)
        if not entry_was_updated:
            continue

        total += 1
        xmlstr = str(xml)
        dictDB.execute("insert into history(entry_id, action, [when], email, xml, historiography) values(?, ?, ?, ?, ?, ?)", (id, "autonumber", str(datetime.datetime.utcnow()), user["email"], xmlstr, json.dumps({})))
        dictDB.execute("update entries set xml = ? where id = ?", (xmlstr, id))

    dictDB.commit()
    return {"success": True, "processed": total}

def notifyUsers(configOld: ConfigUsers, configNew: ConfigUsers, dictInfo: ConfigIdent, dictID: str):
    for user in configNew:
        if not configOld[user]:
            mailSubject = "Lexonomy, added to the dictionary"
            mailText = "Dear Lexonomy user,\n\n"
            mailText += "you are now able to access the following dictionary:\n"
            mailText += "  " + dictInfo['title'] + "\n\n"
            mailText += "You have the following permissions:\n"
            if configNew[user]['canEdit']:
                mailText += " * edit\n"
            if configNew[user]['canConfig']:
                mailText += " * configure\n"
            if configNew[user]['canDownload']:
                mailText += " * download\n"
            if configNew[user]['canUpload']:
                mailText += " * upload\n"
            mailText += "\nYou can access the dictionary at the following address:\n"
            mailText += siteconfig['baseUrl'] + "#/" + dictID
            mailText += "\n\nYours,\nThe Lexonomy team"
            try:
                sendmail(user, mailSubject, mailText)
            except Exception as e:
                pass

def changeFavDict(userEmail: str, dictID: str, status: Literal["true"]):
    if userEmail != '' and dictID != '':
        conn = getMainDB()
        conn.execute("DELETE FROM dict_fav WHERE user_email=? AND dict_id=?", (userEmail, dictID))
        if status == 'true':
            conn.execute("INSERT INTO dict_fav VALUES (?, ?)", (dictID, userEmail))
        conn.commit()
    return True

def get_iso639_1() -> List[IsoCode]:
    codes = []
    for line in open("libs/iso-639-3.tab", encoding="utf-8").readlines():
        la = line.split("\t")
        if la[3] != "" and la[3] != "Part1":
            codes.append({'code':la[3], 'code3':la[1], 'lang':la[6]})
    return codes

def get_locales():
    codes = []
    for code in Locale().getAvailableLocales():
        codes.append({'code': code, 'lang': Locale(code).getDisplayName()})
    return codes

def getLocale(configs):
    locale = 'en'
    if "locale" in configs["titling"] and configs["titling"]["locale"] != "":
        locale = configs["titling"]["locale"]
    return locale

def extractText(xml, elName):
    elName = str(elName)
    if elName == "":
        return []
    pat = r"<" + elName + "[^>]*>([^<]*)</" + elName + ">"
    return re.findall(pat, xml)

def extractFirstText(xml):
    pat = r"<([^\s>]+)[^>]*>([^<>]*?)</([^\s>]+)>"
    for match in re.findall(pat, xml):
        if match[0] == match[2] and match[1].strip() != "":
            return match[1].strip()
    return ""

def getEntryHeadword(xml, headword_elem):
    ret = "?"
    arr = extractText(xml, headword_elem)
    if len(arr)>0:
        ret = arr[0]
    else:
        ret = extractFirstText(xml)
    if len(ret) > 255:
        ret = ret[0:255]
    return ret


def preprocessLex0(entryXml):
    from xml.dom import minidom, Node
    doc = minidom.parseString(entryXml)
    headword = None
    for el in doc.getElementsByTagName("form"):
        if el.getAttribute("type") == "lemma":
            for el2 in el.getElementsByTagName("orth"):
                headword = el2.firstChild.nodeValue
    if headword and headword != "":
        he = doc.createElement("headword")
        het = doc.createTextNode(headword)
        doc.documentElement.appendChild(he)
        he.appendChild(het)
    return doc.toxml().replace('<?xml version="1.0" ?>', '').strip()

def listOntolexEntries(dictDB: Connection, dictID: str, configs: Configs, doctype: str, searchtext: str=""):
    from lxml import etree as ET
    if searchtext == "":
        sql = "select id, title, sortkey, xml from entries where doctype=? order by id"
        params = (doctype, )
    else:
        sql = "select s.txt, min(s.level) as level, e.id, e.sortkey, e.title, e.xml from searchables as s inner join entries as e on e.id=s.entry_id where doctype=? and s.txt like ? group by e.id order by e.id"
        params = (doctype, searchtext+"%")
    c = dictDB.execute(sql, params)
    for r in c.fetchall():
        xml = parse(r["xml"])
        headword = get_entry_headword(xml, configs)
        headword = headword.replace('"', "'")
        lang = configs["ident"].get("lang", "") or "en"
        entryId = re.sub("[\W_]", "",  headword) + "_" + str(r["id"])
        line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/lemon/ontolex#LexicalEntry> ."
        yield line; yield "\n"
        line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/2000/01/rdf-schema#label> \"" + headword + "\"@" + lang + " ."
        yield line; yield "\n"

        #just guessing and hoping
        root = ET.fromstring(r["xml"])
        num = 0
        for sense in root.findall("sense"):
            senseDef = sense.find("def")
            if senseDef != None and senseDef.text:
                defText = re.sub(r'[\r\n]', ' ', senseDef.text)
            elif sense.text:
                defText = re.sub(r'[\r\n]', ' ', sense.text)
            else:
                defText = ""
            if defText != "":
                num += 1
                defText = defText.replace('"', "'")
                senseId = 'sense:' + str(r["id"]) + "_" + str(num)
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
                yield line; yield "\n"
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
                yield line; yield "\n"
        for sense in root.findall("meaning"):
            senseDef = sense.find("def")
            senseDesc = sense.find("semDescription")
            if senseDef != None and senseDef.text:
                defText = re.sub(r'[\r\n]', ' ', senseDef.text)
            elif senseDesc != None and senseDesc.text:
                defText = re.sub(r'[\r\n]', ' ', senseDesc.text)
            elif sense.text:
                defText = re.sub(r'[\r\n]', ' ', sense.text)
            else:
                defText = ""
            if defText != "":
                num += 1
                defText = defText.replace('"', "'")
                senseId = 'meaning:' + str(r["id"]) + "_" + str(num)
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
                yield line; yield "\n"
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
                yield line; yield "\n"
        for sense in root.findall("def"):
            if sense.text:
                num += 1
                defText = re.sub(r'[\r\n]', ' ', sense.text)
                defText = defText.replace('"', "'")
                senseId = 'def:' + str(r["id"]) + "_" + str(num)
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
                yield line; yield "\n"
                line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
                yield line; yield "\n"
        # no sense detected, copy headword
        if num == 0:
            defText = re.sub(r'[\r\n]', ' ', headword)
            defText = defText.replace('"', "'")
            senseId = 'entry:' + str(r["id"]) + "_1"
            line = "<" + siteconfig["baseUrl"] + dictID + "#" + entryId + "> <http://www.w3.org/ns/lemon/ontolex#sense> <" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> ."
            yield line; yield "\n"
            line = "<" + siteconfig["baseUrl"] + dictID + "#" + senseId + "> <http://www.w3.org/2004/02/skos/core#definition> \"" + defText + "\"@" + lang + " ."
            yield line; yield "\n"

def elexisDictAbout(dictID: str):
    try:
        dictDB = getDB(dictID)
    except IOError:
        return None

    info = {"id": dictID}
    configs = readDictConfigs(dictDB)
    configs = loadHandleMeta(configs)
    if configs["metadata"].get("dc.language.iso") and len(configs["metadata"]["dc.language.iso"]) > 0:
        info["sourceLanguage"] = configs["metadata"]["dc.language.iso"][0]
        info["targetLanguage"] = configs["metadata"]["dc.language.iso"]
    elif configs['ident'].get('lang'):
        info["sourceLanguage"] = configs['ident'].get('lang')
        info["targetLanguage"] = [configs['ident'].get('lang')]
    else:
        info["sourceLanguage"] = 'en'
        info["targetLanguage"] = ['en']
    if configs["metadata"].get("dc.rights"):
        if configs["metadata"].get("dc.rights.label") == "PUB":
            info["release"] = "PUBLIC"
            if configs["metadata"].get("dc.rights.uri") != "":
                info["license"] = configs["metadata"].get("dc.rights.uri")
            else:
                info["license"] = configs["metadata"].get("dc.rights")
        else:
            info["release"] = "PRIVATE"
            info["license"] = ""
    else:
        if configs["publico"]["public"]:
            info["release"] = "PUBLIC"
            info["license"] = configs["publico"]["licence"]
            if siteconfig["licences"][configs["publico"]["licence"]]:
                info["license"] = siteconfig["licences"][configs["publico"]["licence"]]["url"]
        else:
            info["release"] = "PRIVATE"
    info["creator"] = []
    info["publisher"] = []
    if configs["metadata"].get("dc.contributor.author"):
        for auth in configs["metadata"]["dc.contributor.author"]:
            info["creator"].append({"name": auth})
    else:
        for user in configs["users"]:
            info["creator"].append({"email": user})
    if configs["metadata"].get("dc.publisher"):
        info["publisher"] = [{"name": configs["metadata"]["dc.publisher"]}]
    if configs["metadata"].get("dc.title"):
        info["title"] = configs["metadata"]["dc.title"]
    else:
        info["title"] = configs["ident"]["title"]
    if configs["metadata"].get("dc.description"):
        info["abstract"] = configs["metadata"]["dc.description"]
    else:
        info["abstract"] = configs["ident"]["blurb"]
    if configs["metadata"].get("dc.date.issued"):
        info["issued"] = configs["metadata"]["dc.date.issued"]
    info["genre"] = ["gen"]
    if configs["metadata"].get("dc.subject"):
        info["subject"] = '; '.join(configs["metadata"]["dc.subject"])
        if "terminolog" in info["subject"]:
            info["genre"].append("trm")
        if "etymolog" in info["subject"]:
            info["genre"].append("ety")
        if "historical" in info["subject"]:
            info["genre"].append("his")
    c = dictDB.execute("select count(*) as total from entries")
    r = c.fetchone()
    info["entryCount"] = r['total']
    return info


def elexisLemmaList(dictID, limit=None, offset=0):
    try:
        dictDB = getDB(dictID)
    except IOError:
        return None

    info = {"language": "en", "release": "PRIVATE"}
    configs = readDictConfigs(dictDB)
    configs = loadHandleMeta(configs)
    if configs["metadata"].get("dc.language.iso") and len(configs["metadata"]["dc.language.iso"]) > 0:
        info["language"] = configs["metadata"]["dc.language.iso"][0]
    elif configs['ident'].get('lang'):
        info["language"] = configs['ident'].get('lang')
    if configs["metadata"].get("dc.rights"):
        if configs["metadata"].get("dc.rights.label") == "PUB":
            info["release"] = "PUBLIC"
        else:
            info["release"] = "PRIVATE"
    else:
        if configs["publico"]["public"]:
            info["release"] = "PUBLIC"
        else:
            info["release"] = "PRIVATE"
    lemmas = []
    query = "SELECT id, xml FROM entries"
    if limit != None and limit != "":
        query += " LIMIT "+str(int(limit))
    if offset != "" and int(offset) > 0:
        query += " OFFSET "+str(int(offset))
    c = dictDB.execute(query)
    formats = []
    firstentry = True
    for r in c.fetchall():
        if firstentry:
            firstentry = False
            jsonentry = elexisConvertTei(r["xml"])
            if jsonentry != None:
                formats = ["tei", "json"]
        lemma = {"release": info["release"], "language": info["language"], "formats": formats}
        lemma["id"] = str(r["id"])
        lemma["lemma"] = getEntryHeadword(r["xml"], configs["titling"].get("headword"))
        pos = elexisGuessPOS(r["xml"])
        if pos != "":
            lemma["partOfSpeech"] = [pos]
        lemmas.append(lemma)
    return lemmas

def elexisGetLemma(dictID, headword, limit=None, offset=0):
    try:
        dictDB = getDB(dictID)
    except IOError:
        return None

    info = {"language": "en", "release": "PRIVATE"}
    configs = readDictConfigs(dictDB)
    configs = loadHandleMeta(configs)
    if configs["metadata"].get("dc.language.iso") and len(configs["metadata"]["dc.language.iso"]) > 0:
        info["language"] = configs["metadata"]["dc.language.iso"][0]
    elif configs['ident'].get('lang'):
        info["language"] = configs['ident'].get('lang')
    if configs["metadata"].get("dc.rights"):
        if configs["metadata"].get("dc.rights.label") == "PUB":
            info["release"] = "PUBLIC"
        else:
            info["release"] = "PRIVATE"
    else:
        if configs["publico"]["public"]:
            info["release"] = "PUBLIC"
        else:
            info["release"] = "PRIVATE"
    lemmas = []
    query = "SELECT e.id, e.xml FROM searchables AS s INNER JOIN entries AS e on e.id=s.entry_id WHERE doctype=? AND s.txt=? GROUP BY e.id ORDER by s.level"
    params = (configs["xema"]["root"], headword)
    if limit != None and limit != "":
        query += " LIMIT "+str(int(limit))
    if offset != "" and int(offset) > 0:
        query += " OFFSET "+str(int(offset))
    c = dictDB.execute(query, params)
    formats = []
    firstentry = True
    for r in c.fetchall():
        if firstentry:
            firstentry = False
            jsonentry = elexisConvertTei(r["xml"])
            if jsonentry != None:
                formats = ["tei", "json"]
        lemma = {"release": info["release"], "language": info["language"], "formats": formats}
        lemma["id"] = str(r["id"])
        lemma["lemma"] = getEntryHeadword(r["xml"], configs["titling"].get("headword"))
        pos = elexisGuessPOS(r["xml"])
        if pos != "":
            lemma["partOfSpeech"] = [pos]
        lemmas.append(lemma)
    return lemmas


def elexisGuessPOS(xml):
    # try to guess frequent PoS element
    pos = ""
    if "</pos>" in xml:
        arr = extractText(xml, "pos")
        if arr[0] and arr[0] != "":
            pos = arr[0]
    if "<partOfSpeech>" in xml:
        arr = extractText(xml, "partOfSpeech")
        if arr[0] and arr[0] != "":
            pos = arr[0]
    if 'type="pos"' in xml:
        pat = r'<gram[^>]*type="pos"[^>]*>([^<]*)</gram>'
        arr = re.findall(pat, xml)
        if arr and arr[0] and arr[0] != "":
            pos = arr[0]
    return pos

def elexisGetEntry(dictID, entryID):
    try:
        dictDB = getDB(dictID)
    except IOError:
        return None

    query = "SELECT id, xml FROM entries WHERE id=?"
    c = dictDB.execute(query, (entryID, ))
    r = c.fetchone()
    return r['xml'] if r["xml"] else None


def loadHandleMeta(configs: Configs):
    configs["metadata"] = {}
    if configs["ident"].get("handle") and "hdl.handle.net" in configs["ident"].get("handle"):

        handle = configs["ident"].get("handle").replace("hdl.handle.net", "hdl.handle.net/api/handles")
        res = requests.get(handle)
        data = res.json()
        if data.get('values') and data["values"][0] and data["values"][0]["type"] == "URL":
            repourl = data["values"][0]["data"]["value"].replace("xmlui", "rest")
            res2 = requests.get(repourl)
            data2 = res2.json()
            if data2.get("id") != "":
                urlparsed = urllib.parse.urlparse(repourl)
                repourl2: str = urlparsed.scheme + "://" + urlparsed.hostname + "/repository/rest/items/" + str(data2["id"]) + "/metadata"
                res3 = requests.get(repourl2)
                data3 = res3.json()
                for item in data3:
                    if item["key"] == "dc.contributor.author" or item["key"] == "dc.subject" or item["key"] == "dc.language.iso":
                        if not configs["metadata"].get(item["key"]):
                            configs["metadata"][item["key"]] = []
                        configs["metadata"][item["key"]].append(item["value"])
                    else:
                        configs["metadata"][item["key"]] = item["value"]
    return configs

def elexisConvertTei(xml_entry):
    """Convert a TEI entry into Json, return None if not TEI
    xml_entry: The entry as a string"""
    from io import BytesIO
    from lxml import etree as ET
    try:
        # strip NS
        it = ET.iterparse(BytesIO(xml_entry.encode("UTF-8")), recover=True)
        for _, el in it:
            _, _, el.tag = el.tag.rpartition('}')
        doc = it.root

        entry = {}
        for form_elem in doc.iter("form"):
            if form_elem.attrib["type"] == "lemma":
                for orth_elem in form_elem.iter("orth"):
                    if "canonicalForm" not in entry:
                        entry["canonicalForm"] = {"writtenRep": orth_elem.text}
        for gramgrp_elem in doc.iter("gramGrp"):
            for gram in gramgrp_elem.iter("gram"):
                if gram.attrib["type"] == "pos":
                    if "norm" in gram.attrib:
                        entry["partOfSpeech"] = elexisNormalisePos(gram.attrib["norm"])
                    else:
                        entry["partOfSpeech"] = elexisNormalisePos(gram.text)

        entry["senses"] = []
        for sense_elem in doc.iter("sense"):
            sense = {}
            for defn in sense_elem.iter("def"):
                sense["definition"] = defn.text
            entry["senses"].append(sense)
        if "canonicalForm" in entry:
            return entry
        else:
            return None
    except Exception as e:
        return None

def elexisNormalisePos(pos):
    if pos in ["adjective", "adposition", "adverb", "auxiliary",
            "coordinatingConjunction", "determiner", "interjection",
            "commonNoun", "numeral", "particle", "pronoun", "properNoun",
            "punctuation", "subordinatingConjunction", "symbol", "verb",
            "other"]:
        return pos
    pos = pos.upper().strip(' .')
    if pos == "ADJ":
        return "adjective"
    elif pos == "ADP":
        return "adposition"
    elif pos == "ADV":
        return "adverb"
    elif pos == "AUX" :
        return "auxiliary"
    elif pos == "CCONJ" :
        return "coordinatingConjunction"
    elif pos == "DET":
        return "determiner"
    elif pos == "INTJ" :
        return "interjection"
    elif pos == "NN":
        return "commonNoun"
    elif pos == "NOUN":
        return "commonNoun"
    elif pos == "NUM":
        return "numeral"
    elif pos == "PART":
        return "particle"
    elif pos == "PRON":
        return "pronoun"
    elif pos == "PROPN":
        return "properNoun"
    elif pos == "PUNCT":
        return "punctuation"
    elif pos == "SCONJ":
        return "subordinatingConjunction"
    elif pos == "SYM":
        return "symbol"
    elif pos == "VB":
        return "verb"
    elif pos == "VERB":
        return "verb"
    elif pos == "X":
        return "other"
    else:
        return "other"

