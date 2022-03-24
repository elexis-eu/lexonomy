import {register as riot_register, component} from 'riot'
import App from './riot/main.tag'
import dict_config_autonumber from './riot/dict-config-autonumber.tag'
import dict_config_download from './riot/dict-config-download.tag'
import dict_config_editing from './riot/dict-config-editing.tag'
import dict_config_flagging from './riot/dict-config-flagging.tag'
import dict_config_gapi from './riot/dict-config-gapi.tag'
import dict_config_ident from './riot/dict-config-ident.tag'
import dict_config_kontext from './riot/dict-config-kontext.tag'
import dict_config_links from './riot/dict-config-links.tag'
import dict_config_nav from './riot/dict-config-nav.tag'
import dict_config_publico from './riot/dict-config-publico.tag'
import dict_config_searchability from './riot/dict-config-searchability.tag'
import dict_config_ske from './riot/dict-config-ske.tag'
import dict_config_subbing from './riot/dict-config-subbing.tag'
import dict_config from './riot/dict-config.tag'
import dict_config_titling from './riot/dict-config-titling.tag'
import dict_config_url from './riot/dict-config-url.tag'
import dict_config_users from './riot/dict-config-users.tag'
import dict_config_xema from './riot/dict-config-xema.tag'
import dict_config_xemplate from './riot/dict-config-xemplate.tag'
import dict_download from './riot/dict-download.tag'
import dict_edit_entry from './riot/dict-edit-entry.tag'
import dict_edit from './riot/dict-edit.tag'
import dict_list from './riot/dict-list.tag'
import dict_main from './riot/dict-main.tag'
import dict_new from './riot/dict-new.tag'
import dict_public_entry from './riot/dict-public-entry.tag'
import dict_public from './riot/dict-public.tag'
import dict_upload from './riot/dict-upload.tag'
import entry_view from './riot/entry-view.tag'
import footer from './riot/footer.tag'
import forgot_password from './riot/forgot-password.tag'
import forgot from './riot/forgot.tag'
import header from './riot/header.tag'
import list_headword from './riot/list-headword.tag'
import login from './riot/login.tag'
import main_page from './riot/main-page.tag'
import main from './riot/main.tag'
import register_password from './riot/register-password.tag'
import register from './riot/register.tag'
import userprofile from './riot/userprofile.tag'
import welcome from './riot/welcome.tag'
riot_register('dict-config-autonumber', dict_config_autonumber)
riot_register('dict-config-download', dict_config_download)
riot_register('dict-config-editing', dict_config_editing)
riot_register('dict-config-flagging', dict_config_flagging)
riot_register('dict-config-gapi', dict_config_gapi)
riot_register('dict-config-ident', dict_config_ident)
riot_register('dict-config-kontext', dict_config_kontext)
riot_register('dict-config-links', dict_config_links)
riot_register('dict-config-nav', dict_config_nav)
riot_register('dict-config-publico', dict_config_publico)
riot_register('dict-config-searchability', dict_config_searchability)
riot_register('dict-config-ske', dict_config_ske)
riot_register('dict-config-subbing', dict_config_subbing)
riot_register('dict-config', dict_config)
riot_register('dict-config-titling', dict_config_titling)
riot_register('dict-config-url', dict_config_url)
riot_register('dict-config-users', dict_config_users)
riot_register('dict-config-xema', dict_config_xema)
riot_register('dict-config-xemplate', dict_config_xemplate)
riot_register('dict-download', dict_download)
riot_register('dict-edit-entry', dict_edit_entry)
riot_register('dict-edit', dict_edit)
riot_register('dict-list', dict_list)
riot_register('dict-main', dict_main)
riot_register('dict-new', dict_new)
riot_register('dict-public-entry', dict_public_entry)
riot_register('dict-public', dict_public)
riot_register('dict-upload', dict_upload)
riot_register('entry-view', entry_view)
riot_register('footer', footer)
riot_register('forgot-password', forgot_password)
riot_register('forgot', forgot)
riot_register('header', header)
riot_register('list-headword', list_headword)
riot_register('login', login)
riot_register('main-page', main_page)
riot_register('main', main)
riot_register('register-password', register_password)
riot_register('register', register)
riot_register('userprofile', userprofile)
riot_register('welcome', welcome)

component(App)(document.getElementById('root'))
