import inspect
import json
import re
import sys
import traceback
from typing import Any, Callable, Optional, TypedDict, Union

import ops
from bs4 import Tag
from ops import Configs


# Run a bunch of tests to check whether import functions behave as expected
# Usage: python3 test-import.py, assuming working directory website and lexonomy database has been initialized.
# Maybe use a proper test framework here.

# Some documentation:
# testables array contains objects that each describe a "test"
# a "test" is basically just a list of commands to execute, the rest of the object is parameters for those commands
# It's written a little ad-hoc but works well enough.

class LinkablesTests(TypedDict):
    txt: list[str]
    "The expected ids of the elements (as defined by ConfigLinks['identifier'] that were made linkable, in no particular order"
    preview: list[str]
    "The expected previews of the elements (as defined by ConfigLinks['preview']) that were made linkable, in no particular order"
    element: list[str]
    "The expected xml element names of the elements that were made linkable, in no particular order"

class Test(TypedDict):
    description: str
    "Describe the test, this is printed to the console on evaluation along with pass/fail status"
    entry: str
    """The entry xml to index. This is assumed to be valid xml, 
    though namespace declarations are optional 
    because we're assuming document fragments, where the header declaring the namespace has been cut off"""
    
    # Here are some properties that are tested after the import is complete
    id: Union[int, Callable[[int], bool]]
    """Either the ID that the imported entry is expected to have, 
    or a lambda that receives the ID the entry got and returns a bool (for comparisons like ID is in a certain range, or not null, or what whatever)"""
    xml: Union[str, Callable[[str], bool]]
    """Same as ID, but for the indexed xml. Meaning after lexonomy ID attributes added, subentry substition, linking attributes added, etc.
        Note that all whitespace (both in database and in this property) is stripped before comparing because it's not relevant.
        This is a pretty lazy string-compare though, so order of attributes, quotes, etc should be an exact match though.
    """
    doctype: Union[str, Callable[[str], bool]]
    """Same as ID, but for the entry's doctype (doctype is the element name of its root node)"""
    title: Union[str, Callable[[str], bool]]
    """Same as ID, but for the title of the entry. NOTE: the title is an html-string"""
    sortkey: Union[str, Callable[[str], bool]]
    """Same as ID, but for the sortkey, this will usually be the headword"""
    searchables: Union[list[str], Callable[[list[str]], bool]]
    """Same as ID, but for the searchables, this will usually only be the headword and title, but more can be specified by the user"""
    subentries: list[str]
    """List of IDS for the entry's subentries. These are validated against the database."""
    subentrytests: dict[int, Any] # really another Test instance
    """Keyed by subentry ID: tests/comparisons for the subentry's properties (such as sortkey, title, doctype, etc). This may contain more subentrytests for the subentry's subentries, because they can be recursive."""
    
    linkables: LinkablesTests
    """Values that the linkables table should have for the entry"""

    configs: Configs
    """A partial config object (with xema, flagging, titling, etc.) used to specificy specific config settings for this test."""
    
    actions: list[Any]
    """The actions to perform before testing the results
        Possible actions right now: "create" (index the entry), "flag" (flag an entry), "delete" (delete an entry)
        If just a string is used (such as actions: ["create"]) the action is used without arguments.
        To pass arguments to the function (createEntry, set_entry_flag, deleteEntry) use a nested array with the arguments:
        actions: ["create", ["delete", 100]] # first run create action, then delete action for entry ID 100.
    """

    debug: bool
    """Break into the debugger on this test (if attached)"""

try:
    ops.destroyDict("#test")
except:
    pass

ops.makeDict("#test", "blank", "test", "test", "root@localhost")

dictDB = ops.getDB("#test")
configsFromDB = ops.readDictConfigs(dictDB)

def dict_factory(cursor, row):
    """Transform sqlite query results into normal {} dictionaries so we can use them with JSON functions etc, because normally there are a load of unserializable properties in those row objects that we don't need."""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d
dictDB.row_factory = dict_factory

testables = [{
    "description": """Test entry without any further content. Id and lexonomy namespace should be added, sortkey, title and searchables should default to "?".""",

    "entry": """<entry></entry>""",

    "id": lambda x: x != None,
    "doctype": "entry",
    "title": "<span class='headword'>?</span>",
    "sortkey": "?",
    "searchables": ["?"]
}, {
    "description": "Test that sortkey, searchable and title use the first available text if there is no headword element",

    "entry": """<entry><first_text>yes</first_text>no<some_element>no</some_element></entry>""",

    "doctype": "entry",
    "title": "<span class='headword'>yes</span>",
    "sortkey": "yes",
    "searchables": ["yes"],
}, {
    "description": "Test that id is preserved when already present",

    "entry": """<entry lxnm:id="10"></entry>""",

    "id": 10,
}, {
    "description": "Test that id outside namespace is ignored",

    "entry": """<entry id="10"></entry>""",

    "id": lambda x: x != 10, # passing an id, but not an lxnm:id, so the auto-assigned id should not be 10, because the id attribute should be ignored.
}, {
    "description": "Title is extracted properly",

    "configs": {
        "titling": {
            "headword": "title"
        }
    },

    "entry": """
    <entry id="10">
        <text>this is some text</text>
        <content>
            <title>this is the title</title>
        </content>
        <text>this is some other text</text>
    </entry>""",

    "title": "<span class='headword'>this is the title</span>",
    "sortkey": "this is the title", # sortkey is headword
    "searchables": ["this is the title"] # searchables are headword + title (which is first text if not headword)
}, {
    "description": "HeadwordAnnotations works, extra searchable elements work (also when xema is using elementName).",

    "configs": {
        "titling": {
            "headword": "title",
            "headwordAnnotations": ["text"]
        },
        "searchability": {
            "searchableElements": ["text", "searchable_element_id"]
        },
        "xema": {
            "elements": {
                "searchable_element_id": {"elementName": "searchable_element"}
            }
        }
    },

    "entry": """
    <entry id="10">
        <text>this is some text</text>
        <content>
            <title>this is the title</title>
        </content>
        <text>this is some other text</text>
        <searchable_element>content of the searchable_element</searchable_element>
    </entry>""",

    "title": "<span class='headword'>this is the title</span> this is some text",
    "sortkey": "this is the title",
    # headword, title (headword + content of the first text node, because of headwordAnnotations), contents of the two text elements.
    "searchables": ["this is the title", "this is the title this is some text", "this is some text", "this is some other text", "content of the searchable_element"]
}, {
    "description": "titling headwordAnnotations works also when elementName is used in the xema.",

    "configs": {
        "titling": {
            "headword": "title",
            "headwordAnnotations": ["text_id"]
        },
        "xema": {
            "elements": {
                "text_id": {"elementName": "text"}
            }
        }
    },

    "entry": """
    <entry id="10">
        <text>this is some text</text>
        <content>
            <title>this is the title</title>
        </content>
        <text>this is some other text</text>
    </entry>""",

    "title": "<span class='headword'>this is the title</span> this is some text",
}, {
    "description": "HeadwordAnnotationsAdvanced works",

    "configs": {
        "titling": {
            "headwordAnnotationsType": "advanced",
            "headwordAnnotationsAdvanced": "<div class='test'>%(title)</div><div>%(no_match)</div>"
        },
    },

    "entry": """
    <entry id="10">
        <text>this is some text</text>
        <content>
            <title>this is the title</title>
        </content>
        <title>this is another title that should be ignored because it is later in the document</title>
        <text>this is some other text</text>
    </entry>""",

    "title": "<div class='test'>this is the title</div><div>%(no_match)</div>",
    "sortkey": "this is some text", # first text in the entry since nothing defined
    # headword (first text in entry because not otherwise defined) + text content of matched escape sequences in headwordAnnotationsAdvanced
    "searchables": ["this is some text", "this is the title"]
}, {
    "description": "Subentry works with some interesting edge cases.",

    "configs": {
        "titling": {
            "headword": "headword",
            "headwordAnnotations": ["text"], # make extracting the entry title difficult due to titles existing in subentries and main entry alike
        },
        "subbing": {
            "sub": {}
        },
        "searchability": {
            "searchableElements": ["text"]
        }
    },

    "entry": """
    <entry lxnm:id="100">
        <text>some other text in the entry</text>
        <sub lxnm:id="101">
            <headword>subentry headword</headword>
            <text>subentry text</text>
        </sub>
        <headword>headword</headword>
        <sub lxnm:id="102"><headword>subentry headword 2</headword></sub>
    </entry>""",

    "sortkey": "headword", # NOTE: ensure the extracted headword is the one actually inside the entry itself - not the headword of one of its subentries
    "searchables": ["headword", "headword some other text in the entry", "some other text in the entry"],
    "xml": """
    <entry lxnm:id="100" xmlns:lxnm="http://www.lexonomy.eu/">
        <text>some other text in the entry</text>
        <lxnm:subentryParent doctype="sub" id="101" title="subentry headword subentry text"></lxnm:subentryParent>
        <headword>headword</headword>
        <lxnm:subentryParent doctype="sub" id="102" title="subentry headword 2"></lxnm:subentryParent>
    </entry>
    """,
    "subentries": [101, 102] # created during import.
},  {
    "description": "Applying a flag works when not configured",
    
    "configs": {
        "flagging": {
            "flag_element": "flag",
            "flags": [{
                "key": "", # keyboard shortcut
                "name": "test", # flag element content
                "label": "", # clientside tooltip
                "color": ""
            }]
        }
    },

    "actions": ["create", ["flag", "test"]],

    "entry": """
    <entry lxnm:id="999">
        <text>some content</text>
    </entry>""",

    "xml": """
    <entry lxnm:id="999" xmlns:lxnm="http://www.lexonomy.eu/">
        <text>some content</text>
        <flag>test</flag></entry>
    """,
    "subentries": [],
    "flag": "test"
}, {
    "description": "Applying a flag works when a xema is known and the flag in a far descendant of root",

    "configs": {
        "xema": {
            "root": "entry",
            "elements": {
                "entry": { "children": [{"name": "a"}, {"name": "b"}] },
                "a": { "children": [{"name": "c"}, {"name": "d"}] },
                "c": { "children": [{"name": "e"}, {"name": "f"}] },
                "f": { "children": [{"name": "flag"}] },
            }
        },
        "flagging": {
            "flag_element": "flag",
            "flags": [{
                "key": "", # keyboard shortcut
                "name": "test", # flag element content
                "label": "", # clientside tooltip
                "color": ""
            }]
        }
    },

    "actions": ["create", ["flag", "test"]],

    "entry": """
    <entry lxnm:id="999">
        <text>some content</text>
    </entry>""",

    "xml": """
    <entry lxnm:id="999" xmlns:lxnm="http://www.lexonomy.eu/">
        <text>some content</text>
        <a><c><f><flag>test</flag></f></c></a></entry>
    """,
    "flag": "test"
}, {
    "description": "Applying a flag puts it directly under the root when a xema is known, but the flag is not inside the xema",
    "configs": {
        "xema": {
            "root": "entry",
            "elements": {
                "entry": { "children": [{"name": "a"}, {"name": "b"}] },
                "a": { "children": [{"name": "c"}, {"name": "d"}] },
                "c": { "children": [{"name": "e"}, {"name": "f"}] },
            }
        },
        "flagging": {
            "flag_element": "flag",
            "flags": [{
                "key": "", # keyboard shortcut
                "name": "test", # flag element content
                "label": "", # clientside tooltip
                "color": ""
            }]
        }
    },

    "actions": ["create", ["flag", "test"]],

    "entry": """
    <entry lxnm:id="999">
        <text>some content</text>
    </entry>""",

    "xml": """
    <entry lxnm:id="999" xmlns:lxnm="http://www.lexonomy.eu/">
        <text>some content</text>
        <flag>test</flag></entry>
    """,
}, {
    "description": "Applying a flag creates the correct elements when the xema uses elementName properties",
    "configs": {
        "xema": {
            "root": "entry",
            "elements": {
                "entry": { "children": [{"name": "a"}, {"name": "b"}] },
                "a": { "children": [{"name": "c"}, {"name": "d"}], "elementName": "a_name" },
                "c": { "children": [{"name": "e"}, {"name": "f"}], "elementName": "c_name" },
                "f": { "children": [{"name": "flag"}], "elementName": "f_name" },
                "flag": { "elementName": "flag_name" }
            }
        },
        "flagging": {
            "flag_element": "flag",
            "flags": [{
                "key": "", # keyboard shortcut
                "name": "test", # flag element content
                "label": "", # clientside tooltip
                "color": ""
            }]
        }
    },

    "actions": ["create", ["flag", "test"]],

    "entry": """
    <entry lxnm:id="999">
        <text>some content</text>
    </entry>""",

    "xml": """
    <entry lxnm:id="999" xmlns:lxnm="http://www.lexonomy.eu/">
        <text>some content</text>
        <a_name><c_name><f_name><flag_name>test</flag_name></f_name></c_name></a_name>
    </entry>
    """,
    "flag": "test"
}, {
    "description": "Subentry in subentry works.",
    
    "configs": {
        "subbing": {
            "subentry": {}
        },
    },

    "entry": """
    <entry>
        <text>title</text>
        <subentry lxnm:id="300">
            <subentry lxnm:id="301">
                <text>subentry level 2</text>
            </subentry>
            <text>subentry level 1</text>
        </subentry>
    </entry>""",

    "searchables": ["title"],
    "subentries": [300],
    "subentrytests": {
        300: {
            "searchables": ["subentry level 1"],
            "subentries": [301],
            "subentrytests": {
                301: {
                    "searchables": ["subentry level 2"]
                }
            }
        }
    }
}, {
    "description": "Subentry reference to unknown entry is removed. (there are constraints in the database that make this necessary)",
    
    "entry": """
    <entry lxnm:id="5">
        <text>title</text>
        <lxnm:subentryParent id="20"/>
    </entry>""",

    "xml": """<entry lxnm:id="5" xmlns:lxnm="http://www.lexonomy.eu/"><text>title</text></entry>""",
    "subentries": []
}, {
    "description": "Subentry works with attribute constraints",
    
    "configs": {
        "subbing": {
            "subentry": {
                "attributes": {
                    "att": "true" # @att must be "true"
                }
            }
        },
    },

    "entry": """
    <entry lxnm:id="5">
        <text>title</text>
        <subentry att="false"><text>ignored subentry</text></subentry>
        <subentry lxnm:id="100" att="true"><text>processed subentry</text></subentry>
    </entry>""",

    "xml": """
    <entry lxnm:id="5" xmlns:lxnm="http://www.lexonomy.eu/">
        <text>title</text>
        <subentry att="false">
            <text>ignored subentry</text>
        </subentry>
        <lxnm:subentryParent doctype="subentry" id="100" title="processed subentry"></lxnm:subentryParent>
    </entry>""",
    "subentries": [100]
}, {
    "description": "Creating entry with a subentry, then deleting that subentry: the link with the subentry is removed.",

    "actions": ["create", ["delete", 100]],

    "configs": { "subbing": {"subentry": {} } },

    "entry": """
    <entry lxnm:id="99">
        <text>title</text>
        <subentry lxnm:id="100">
            <text>subentry title</text>
        </subentry>
    </entry>
    """,

    "xml": """
        <entry lxnm:id="99" xmlns:lxnm="http://www.lexonomy.eu/">
            <text>title</text>
        </entry>
    """
}, {
    "description": "Test that legacy lxnm:entryID attribute is converted into new-style lxnm:id attribute",

    "entry": """
    <entry lxnm:entryID="201">some test</entry>
    """,

    "xml": """<entry lxnm:id="201" xmlns:lxnm="http://www.lexonomy.eu/">some test</entry>""",
    "id": 201
}, {
    "description": "Test linkables format-strings work correctly",
    
    "configs": {
        "links": {
            "sense": {
                "linkElement": "sense",
                "identifier": "[%(@sense_id)] %(content) (%(pos))",
                "preview": "%(content) (%(pos))"
            }
        }
    },

    "entry": """
        <entry lxnm:id="201">
            <headword>test</headword>
            <sense sense_id="sense_1">
                <content>the first sense</content>
                <pos>noun</pos>
            </sense>
            <sense sense_id="sense_2">
                <content>the second sense</content>
                <pos>verb</pos>
            </sense>
        </entry>
    """,

    "linkables": {
        "txt": ["[sense_1] the first sense (noun)", "[sense_2] the second sense (verb)"], # identifiers
        "element": ["sense", "sense"],
        "preview": ["the first sense (noun)", "the second sense (verb)"]
    }
}, {
    "description": "Test autonumbering can place number in element",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n", 
        "type": "number"
    }}},
    "entry": """<entry lxnm:id="0"><n/></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n>0</n></entry>"""
}, {
    "description": "Test autonumbering can place string template in element",
    "configs":{"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "type": "string", 
        "string_template": "autonumber %(headword) %(@some-attribute)"
    }}},
    "entry": """<entry lxnm:id="0"><n some-attribute="0"/><headword>test</headword></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n some-attribute="0">autonumber test 0</n><headword>test</headword></entry>"""
}, {
    "description": "Test autonumbering can place string template in attribute",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "target": "@id",
        "type": "string", 
        "string_template": "autonumber %(headword) %(@some-attribute)"
    }}},
    "entry": """<entry lxnm:id="0"><n some-attribute="0"/><headword>test</headword></entry>""",
    "xml":   """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n id="autonumber test 0" some-attribute="0"></n><headword>test</headword></entry>"""
}, {
    "description": "Test autonumbering can place string template in child element",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "target": "target_element",
        "type": "string", 
        "string_template": "autonumber %(headword) %(@some-attribute)",
        "overwrite_existing": True
    }}},
    "entry": """<entry lxnm:id="0"><n some-attribute="0"><target_element>this value should be overwritten</target_element></n><headword>test</headword></entry>""",
    "xml":   """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n some-attribute="0"><target_element>autonumber test 0</target_element></n><headword>test</headword></entry>"""
}, {
    "description": "Test autonumbering can create child element with string template",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "target": "target_element",
        "type": "string", 
        "string_template": "autonumber %(headword) %(@some-attribute)"
    }}},
    "entry": """<entry lxnm:id="0"><n some-attribute="0"></n><headword>test</headword></entry>""",
    "xml":   """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n some-attribute="0"><target_element>autonumber test 0</target_element></n><headword>test</headword></entry>"""
}, {
    "description": "Test autonumbering continues from last known number when numbering globally is enabled",
    "configs":{"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "type": "number", 
        "number_globally": True,
        "number_next": 10
    }}},
    "entry": """<entry lxnm:id="0"><n/><n/></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n>10</n><n>11</n></entry>"""
}, {
    "description": "Test autonumbering does not apply when auto_apply is False",
    "configs": {"autonumbering": {"n": {
        "auto_apply": False,
        "element": "n",
        "type": "number", 
        "number_globally": True,
        "number_next": 10
    }}},
    "entry": """<entry lxnm:id="0"><n/><n/></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n></n><n></n></entry>"""
}, {
    "description": "Test autonumbering manually works even when auto_apply is False",
    "configs": {"autonumbering": {"n": {
        "auto_apply": False,
        "element": "n",
        "type": "number", 
        "number_globally": True,
        "number_next": 10
    }}},
    "entry": """<entry lxnm:id="0"><n/><n/></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n>10</n><n>11</n></entry>""",
    "actions": ["create", "autonumber"]
}, {
    "description": "Test autonumbering ignores next number when not numbering globally",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "type": "number", 
        "number_globally": False,
        "number_next": 10
    }}},
    "entry": """<entry lxnm:id="0"><n/><n/></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n>0</n><n>1</n></entry>""",
}, {
    # We don't do this because it causes numbers to go up indefinitely every time an entry is saved
    # Because identifiers changing every time you touch the entry is actually completely useless...
    "description": "Test autonumbering does NOT overwrite existing numeric values automatically when global numbers are enabled",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "type": "number", 
        "number_globally": True,
        "number_next": 10,
        "overwrite_existing": True
    }}},
    "entry": """<entry lxnm:id="0"><n/><n>1</n></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n>10</n><n>1</n></entry>""",
}, {
    "description": "Test autonumbering DOES overwrite existing numeric values automatically when global numbers are enabled when not in auto-apply mode",
    "configs": {"autonumbering": {"n": {
        "auto_apply": True,
        "element": "n",
        "type": "number", 
        "number_globally": True,
        "number_next": 10,
        "overwrite_existing": True
    }}},
    "entry": """<entry lxnm:id="0"><n/><n>1</n></entry>""",
    "xml": """<entry lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n>11</n><n>12</n></entry>""",
    "actions": ["create", "autonumber"]
}, {
    "description": "Test autonumbering can write to entry root",
    "configs": {"autonumbering": {"entry": {
        "auto_apply": True,
        "element": "entry",
        "target": "@auto_id",
        "type": "number", 
        "number_globally": True,
        "number_next": 10,
        "overwrite_existing": True
    }}},
    "entry": """<entry lxnm:id="0"><n/><n></n></entry>""",
    "xml": """<entry auto_id="10" lxnm:id="0" xmlns:lxnm="http://www.lexonomy.eu/"><n></n><n></n></entry>""",
}, {
    "description": "Test that parent entry is flagged for update when subentry changes",

    "configs": {
        "titling": {
            "headword": "headword"
        },
        "subbing": {
            "sub": {}
        },
    },

    "entry": """
    <entry lxnm:id="100">
        <headword>headword</headword>
        <sub lxnm:id="101">
            <headword>subentry headword</headword>
        </sub>
    </entry>""",

    "actions": ["create", ["update", "<sub><headword>subentry headword edited</headword></sub>", "test@lexonomy", 101]],

    "needs_update": 1,
}]

def overwriteConfig(originalConfig, overrides):
    """
        Put the values from overrides into originalConfig.
        Recurse if both elements are a map.
    """
    configs = json.loads(json.dumps(originalConfig))
    def replace(putInto, value, key):
            if (existingValue := putInto.get(key)) != None and (type(existingValue) != type(value)):
                raise TypeError("Trying to set property to unsupported type: ", key, description)
            if not isinstance(value, dict) or not key in putInto:
                putInto[key] = value
            else: # property already exists, and is a dictionary, recursive overwrite.
                for subKey in value:
                    replace(putInto[key], value[subKey], subKey)
    for key in overrides:
        replace(configs, overrides[key], key)
    return configs

def failIf(
    description: str,
    property: str,
    got: Any,
    expected: Optional[Any],
    compare: lambda got, expected: bool = lambda x,y: x == y,
    message: Optional[str] = None
):
    """Generic variable comparison function with some console logging

    Args:
        description (str): What test are we running
        property (str): What property in the test are we comparing
        got (Any): What was the result of the test run (usually the value of the property in the database after importing)
        expected (Optional[Any]): What did we expect the result to be? 
        compare: How to compare actual and expected variables
        message (Optional[str], optional): Some additional info to print if not a match

    Raises:
        Exception: when the variables don't match.
    """    

    passed = False
    if callable(expected):
        compare = expected
        expected  = None
    elif not callable(compare):
        compare = lambda x, y: x == y

    passExpected = len(inspect.getfullargspec(compare)[0]) > 1
    passed = compare(got, expected) if passExpected else compare(got)
    if not passed:
        raise Exception(f"""'{description}' - mismatch on '{property}'.
{f'''Expected:
{expected}''' if expected != None else ''}
{f'''Got:
{got}'''}
{f'''Addition info:
{message}''' if message != None else ''}
""")

def arraycompare(a, b) -> bool:
    """Set equality comparator for arrays. Uses 'in' operator to compare"""
    if len(a) != len(b):
        return False
    for v in a:
        if not v in b:
            return False
    return True

def test(tests, id: int, description: str):
    """After doing all the operations, run the database value checks."""

    entry = dictDB.execute("select * from entries where id=?", (id, )).fetchone()
    linkables = dictDB.execute("select json_group_array(txt) as txt, json_group_array(element) as element, json_group_array(preview) as preview from linkables where entry_id = ? group by entry_id", (id, )).fetchone()
    if linkables:
        for key in linkables:
            linkables[key] = json.loads(linkables[key])

    # normalize xml whitespace so we can compare (sort of)
    if "xml" in tests:
        tests["xml"] = re.sub(r"\s", "", tests["xml"])
        entry["xml"] = re.sub(r"\s", "", entry["xml"])

    for key in ["id", "xml", "doctype", "title", "sortkey", "flag", "needs_update"]:
        if key in tests:
            failIf(description, key, entry[key], tests[key], tests[key])

    # Test searchables
    if expectedSearchables := tests.get("searchables"):
        searchables = list(map(lambda r: r["txt"], dictDB.execute("select * from searchables where entry_id=?", (id, )).fetchall()))
        failIf(description, "searchables", searchables, expectedSearchables, arraycompare)

    for key in ["txt", "element", "preview"]:
        if key in tests.get("linkables", {}):
            failIf(description, key, linkables[key], tests["linkables"][key], arraycompare)

    # Test subentries last, because it might be recursive
    if expectedSubentries := tests.get("subentries"):
        subentries = list(map(lambda row: row["child_id"], dictDB.execute("select child_id from sub where parent_id = ?", (id, )).fetchall()))
        failIf(description, "subentries", subentries, expectedSubentries, arraycompare)
        for subentryID, subentryTests in tests.get("subentrytests", {}).items():
            test(subentryTests, subentryID, description + f" [subentry {subentryID}]")

for tests in testables:
    try:
        # Override configs for this test, if supplied.
        if tests.get("debug"):
            breakpoint()
        configs = overwriteConfig(configsFromDB, tests.get("configs", {}))
        description = tests["description"]

        id: int = None
        xmlAsIndexed: Tag = None
        success: bool = None
        feedback: Optional[str] = None

        for action in tests.get("actions", ["create"]):
            params: list = None
            if isinstance(action, list):
                action, *params = action

            if action == "create":
                id, xmlAsIndexed, success, feedback = ops.createEntry(dictDB, configs, tests["entry"], "test@lexonomy")
                failIf(description, "success", success, tests.get("success", True))
            elif action == "flag":
                ops.set_entry_flag(dictDB, id, params[0], configs, "test@lexonomy", xmlAsIndexed)
            elif action == "autonumber":
                ops.addAutoNumbers(dictDB, configs, {"email": "test@lexonomy"})
            elif action == "delete":
                ops.deleteEntry(dictDB, configs, params[0] if len(params) > 0 else id, "test@lexonomy")
            elif action == "update": 
                ops.createEntry(dictDB, configs, params[0], params[1], params[2])
            else:
                print(f"ERROR - Unknown action '{action}' - ignoring", file=sys.stderr)

        test(tests, id, description)
        print(f"PASS {description}")

    except Exception as e:
        breakpoint()
        if type(e) == Exception:
            print(e)
        else:
            print(e)
            traceback.print_exc()

dictDB.close()
dictDB = None
ops.destroyDict("#test")
