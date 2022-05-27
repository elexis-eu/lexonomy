import {register as riot_register, component} from 'riot'

import './js/store.js'
import './js/auth.js'
import './js/extend-riot.js'
import './js/appupdater.js'
import './js/url.js'
import './libs/screenful/screenful.js'
import './libs/screenful/screenful-editor.js'
import './libs/screenful/screenful-loc-en.js'
import './libs/screenful/screenful-history.js'
import './libs/xonomy/xonomy.js'
import './libs/js.cookie.js'
import './libs/xonomy-tools/dtdconvert/dtd2xonomy.js'
import './widgets/xematron.js'
import './widgets/xemplatron.js'
import './widgets/xrefs.js'
import './widgets/ske.js'
import './widgets/kontext.js'
import './widgets/gmedia.js'
import './widgets/sub.js'

import App from './riot/main.riot'
import api from './riot/api.riot'
import dict_config_autonumber from './riot/dict-config-autonumber.riot'
import dict_config_download from './riot/dict-config-download.riot'
import dict_config_editing from './riot/dict-config-editing.riot'
import dict_config_flagging from './riot/dict-config-flagging.riot'
import dict_config_gapi from './riot/dict-config-gapi.riot'
import dict_config_ident from './riot/dict-config-ident.riot'
import dict_config_kontext from './riot/dict-config-kontext.riot'
import dict_config_links from './riot/dict-config-links.riot'
import dict_nav from './riot/dict-nav.riot'
import dict_entry_filter from './riot/dict-entry-filter.riot'
import dict_config_buttons from './riot/dict-config-buttons.riot'
import dict_config_publico from './riot/dict-config-publico.riot'
import dict_config_searchability from './riot/dict-config-searchability.riot'
import dict_config_ske from './riot/dict-config-ske.riot'
import dict_config_subbing from './riot/dict-config-subbing.riot'
import dict_config from './riot/dict-config.riot'
import dict_config_titling from './riot/dict-config-titling.riot'
import dict_config_url from './riot/dict-config-url.riot'
import dict_config_users from './riot/dict-config-users.riot'
import dict_config_xema from './riot/dict-config-xema.riot'
import dict_config_xema_element from './riot/entry-structure/dict-config-xema-element.riot';
import dict_config_xema_attribute from './riot/entry-structure/dict-config-xema-attribute.riot';
import dict_config_element_in_tree from './riot/dict-config-element-in-tree.riot';
import dict_config_attribute_in_tree from './riot/dict-config-attribute-in-tree.riot';
import dict_config_xemplate from './riot/dict-config-xemplate.riot'
import dict_download from './riot/dict-download.riot'
import dict_edit_entry from './riot/dict-edit-entry.riot'
import dict_edit from './riot/dict-edit.riot'
import dict_list from './riot/dict-list.riot'
import dict_new from './riot/dict-new.riot'
import dict_public_entry from './riot/dict-public-entry.riot'
import dict_public from './riot/dict-public.riot'
import dict_upload from './riot/dict-upload.riot'
import dict_links from './riot/dict-links.riot'
import e404 from './riot/e404.riot'
import entry_view from './riot/entry-view.riot'
import app_footer from './riot/app-footer.riot'
import forgot_password from './riot/forgot-password.riot'
import forgot from './riot/forgot.riot'
import app_header from './riot/app-header.riot'
import login from './riot/login.riot'
import main_page from './riot/main-page.riot'
import main from './riot/main.riot'
import open_dict_list from './riot/open-dict-list.riot'
import register_password from './riot/register-password.riot'
import register from './riot/register.riot'
import userprofile from './riot/userprofile.riot'
import welcome from './riot/welcome.riot'
import user_consent from './riot/user-consent.riot'
import raw_html from './riot/raw-html.riot'
import loading_overlay from './riot/loading-overlay.riot'
import docs_intro from './riot/docs-intro.riot'

riot_register('api', api)
riot_register('dict-config-autonumber', dict_config_autonumber)
riot_register('dict-config-download', dict_config_download)
riot_register('dict-config-editing', dict_config_editing)
riot_register('dict-config-flagging', dict_config_flagging)
riot_register('dict-config-gapi', dict_config_gapi)
riot_register('dict-config-ident', dict_config_ident)
riot_register('dict-config-kontext', dict_config_kontext)
riot_register('dict-config-links', dict_config_links)
riot_register('dict-nav', dict_nav)
riot_register('dict-entry-filter', dict_entry_filter)
riot_register('dict-config-buttons', dict_config_buttons)
riot_register('dict-config-publico', dict_config_publico)
riot_register('dict-config-searchability', dict_config_searchability)
riot_register('dict-config-ske', dict_config_ske)
riot_register('dict-config-subbing', dict_config_subbing)
riot_register('dict-config', dict_config)
riot_register('dict-config-titling', dict_config_titling)
riot_register('dict-config-url', dict_config_url)
riot_register('dict-config-users', dict_config_users)
riot_register('dict-config-xema', dict_config_xema)
riot_register('dict-config-xema-element', dict_config_xema_element)
riot_register('dict-config-xema-attribute', dict_config_xema_attribute)
riot_register('dict-config-element-in-tree', dict_config_element_in_tree)
riot_register('dict-config-attribute-in-tree', dict_config_attribute_in_tree)
riot_register('dict-config-xemplate', dict_config_xemplate)
riot_register('dict-download', dict_download)
riot_register('dict-edit-entry', dict_edit_entry)
riot_register('dict-edit', dict_edit)
riot_register('dict-list', dict_list)
riot_register('dict-new', dict_new)
riot_register('dict-public-entry', dict_public_entry)
riot_register('dict-public', dict_public)
riot_register('dict-upload', dict_upload)
riot_register('dict-links', dict_links)
riot_register('e404', e404)
riot_register('entry-view', entry_view)
riot_register('app-footer', app_footer)
riot_register('forgot-password', forgot_password)
riot_register('forgot', forgot)
riot_register('app-header', app_header)
riot_register('login', login)
riot_register('main-page', main_page)
riot_register('main', main)
riot_register('open-dict-list', open_dict_list);
riot_register('register-password', register_password)
riot_register('register', register)
riot_register('userprofile', userprofile)
riot_register('welcome', welcome)
riot_register('user-consent', user_consent)
riot_register('raw-html', raw_html)
riot_register('loading-overlay', loading_overlay)
riot_register('docs-intro', docs_intro)


component(App)(document.getElementById('root'))
