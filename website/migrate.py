from sqlite3 import Connection
from bs4 import BeautifulSoup, Tag

import ops
from ops import Configs

def migrate_1(dictDB: Connection, configs: Configs):
    # 1: Test if the linkables table is present, and create it if not.
    # There is nothing else to do; if the table didn't exist yet - all the configs for linking will be blank.
    # The actual entries will be marked for update when a (new/initial) linking config is saved.
    
    c = dictDB.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='linkables'")
    if not c.fetchone():
        dictDB.execute("CREATE TABLE linkables (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER REFERENCES entries (id) ON DELETE CASCADE, txt TEXT, element TEXT, preview TEXT)")
        dictDB.execute("CREATE INDEX link ON linkables (txt)")

    # 2: Update the schema for entries
    # Add the 'flag' column.
    # Add the 'needs_update' columns.
    # Delete the needs_refac, needs_resave and needs_refresh column.
    c = dictDB.execute("SELECT * FROM pragma_table_info('entries') WHERE name='flag'")
    if c.fetchone():
        return

    try:
        dictDB.execute("ALTER TABLE entries ADD COLUMN flag TEXT DEFAULT ('')")
    except Exception as ex:
        print(ex)
    
    try:
        # General-purpose flag for "entry needs to be updated" - perhaps some config changed that needs to be reflected in the xml.
        # Generally we check this whenever an entry is read from the database, and if needed - resave that entry and clear the flag before returning it.
        dictDB.execute("ALTER TABLE entries ADD COLUMN needs_update BOOLEAN DEFAULT (0)")
        dictDB.execute("update entries set needs_update=needs_refresh or needs_refac or refresh")
    except Exception as ex:
        print(ex)
    
    try:
        dictDB.execute("DROP INDEX IF EXISTS needs_re")
    except Exception as ex:
        print(ex)
    
    try:
        dictDB.execute("ALTER TABLE entries DROP COLUMN needs_refac")
    except Exception as ex:
        print(ex)
    
    try:
        dictDB.execute("ALTER TABLE entries DROP COLUMN needs_resave")
    except Exception as ex:
        print(ex)
    
    try:
        dictDB.execute("ALTER TABLE entries DROP COLUMN needs_refresh")
    except Exception as ex:
        print(ex)

    # 3. If the dictionary uses flags, mark all entries for an update, as the flags will need to be extracted, which the update will do.
    if configs["flagging"].get("flag_element", ""):
        dictDB.execute("update entries set needs_update=1")

    # 4. If the dictionary uses the subentry system, re-create all those entries, as the xml for subentries has changed fundamentally and cannot be ported on the fly.
    # only do this if absolutely needed - it's a heavy operation.

    # Explanation:
    # In the old schema: 
    # Subentries are a copy of their full xml, with the root having an attribute "lxnm:subentryID=..." 
    # Additionally, the subentry is also a standalone entry in the database, again with the full xml. This time with the normal entry attributes.
    # In the "sub" table, links between the subentries and their parents are stored, but no xml is.

    # In the new schema:
    # A subentry is just a normal entry in the database "entries" table.
    # Inside a parent entry, there is no longer a copy of the xml, only an element "<lxnm:subentryParent id="..."/>" pointing to the subentry's id.
    # Inside the "sub" table, links are stored as usual, and subentries can be retrieved as normal entries.

    # For migration:
    # Remove the embedded subentry xml, replacing it with just the <lxnm:subentryParent id="..."/> tag.

    if len(configs["subbing"]): # only perform this step if any element is designated to be a subentry
        print("Dictionary uses subentry system, migrating individual entries...")

        tagCreator = BeautifulSoup()
        def migrate_subentries(xml: Tag):
            for el in xml.find_all(attrs = {"lxnm:subentryID": True}):
                new_tag = tagCreator.new_tag("lxnm:subentryParent", attrs={"id": str(el.attrs["lxnm:subentryID"])})
                el.replace_with(new_tag)

        done = 0
        for r in dictDB.execute("select distinct(id), xml from entries where id in (select parent_id from sub) or id in (select child_id from sub)").fetchall():
            xml = ops.parse(r["xml"])
            migrate_subentries(xml)
            ops.createEntry(dictDB, configs, xml, "system@lexonomy")
            done += 1
            if done % 100 == 0:
                print(f"Migrated {done} entries so far...")
            # all entries should now be up-to-date :)

def get_version(mainDB: Connection) -> int:
    return mainDB.execute("PRAGMA user_version").fetchone()["user_version"]

def migrate():
    current_version = 1 
    migrations = [migrate_1] # add migrations to newer versions at the end of the list.

    mainDB = ops.getMainDB()
    possibly_outdated_version = get_version(mainDB)
    migrations = migrations[possibly_outdated_version:current_version]
    if not len(migrations):
        print("Database already up-to-date, exiting.")
        return
    
    print("Checking dictionaries to migrate")
    for dict in mainDB.execute("select * from dicts").fetchall():
        id = dict["id"]
        title = dict["title"]
        try:
            dictDB = ops.getDB(id)
            configs = ops.readDictConfigs(dictDB)
            print(f"Migrating dictionary {title} ({id}) ...")
            for migration in migrations:
                migration(dictDB, configs)
            print(f"Migration of {title} ({id}) finished!")
        except Exception as ex:
            print(ex)
    mainDB.execute(f"PRAGMA user_version={current_version}")

migrate()
