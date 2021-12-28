<main>
  <div class="container">
		<header is="header" ref="header" authorized={ this.state.authorized } user-info={ this.state.userInfo } log-out={ logOut } show-dict-menu={ this.state.showDictMenu } dict-id={ this.dictId } user-access={ this.state.userAccess }></header>
		<div class="content row" is={ this.content } dict-id={ this.dictId } authorized={ this.state.authorized } account-ops={ accountOps } user-info={ this.state.userInfo } entry-id={ this.entryId } load-dict-detail={ loadDictDetail } load-config-data={ loadConfigData } save-config-data={ saveConfigData } dict-details={ this.state.dictDetails } config-id={ this.configId } dict-configs={ this.state.dictConfigs } user-access={ this.state.userAccess } doctype={ this.doctype } doctypes={ this.doctypes } main-sub-page={ this.state.subPage } token={ this.state.token } siteconfig={ this.siteconfig }></div>
		<footer is="footer" siteconfig={ this.siteconfig }></footer>
  </div>

  <script>
		export default {
			content: '',
			checkingAuth: false,
			dictId: '',
			doctype: 'entry',
			doctypes: ['entry'],
			siteconfig: {},
			state: {
				authorized: false,
				userInfo: {username: ''},
				userAccess: false,
				dictDetails: {},
				showDictMenu: false,
				publicMoreEntries: [],
				dictConfigs: {},
				subPage: 'login',
				token: '',
			},

			getCookie(val) {
				if (document.cookie != undefined) {
					if (document.cookie.split('; ').find(row => row.startsWith(val+'=')) != undefined) {
						return document.cookie.split('; ').find(row => row.startsWith(val+'=')).split('=')[1].slice(1,-1);
					}
				} else {
					return "";
				}
			},

			checkAuthCookie() {
				if (this.getCookie('email') != '' && this.getCookie('sessionkey') != '' && this.state.userInfo.username == '') {
					console.log('cookie auth')
					$.post("/login.json", (response) => {
						if (response.success) {
							this.state.userInfo.username = response.email;
							this.state.userInfo.ske_username = response.ske_username;
							this.state.userInfo.ske_apiKey = response.ske_apiKey;
							this.state.userInfo.apiKey = response.apiKey;
							this.state.authorized = true;
						}
					}).always(() => {
						this.checkingAuth = false;
						this.update();
					})
				}
			},

			accountOps(type) {
				return new Promise((resolve) => {
					if (type == 'login') {
						var email = $('#username').val();
						var password = $('#password').val();
						$.post("/login.json", {email: email, password: password}, (response) => {
							if (response.success) {
								this.state.userInfo.username = this.getCookie('email');
								this.state.userInfo.ske_username = response.ske_username;
								this.state.userInfo.ske_apiKey = response.ske_apiKey;
								this.state.authorized = true;
							}
						}).always(() => {
							this.checkingAuth = false;
							this.update();
						});
					}

					if (type == 'register') {
						$.post("/signup.json", {email: $('#email').val()}, (response) => {
							if (response.success) {
								resolve({success: true});
							} else {
								resolve({success: false, errorMessage: 'Incorrect e-mail.'});
							}
						}).fail(() => {
								resolve({success: false, errorMessage: 'Incorrect e-mail.'});
						});
					}

					if (type == 'forgot') {
						$.post("/forgotpwd.json", {email: $('#email').val()}, (response) => {
							if (response.success) {
								resolve({success: true});
							} else {
								resolve({success: false, errorMessage: 'Incorrect e-mail.'});
							}
						}).fail(() => {
								resolve({success: false, errorMessage: 'Incorrect e-mail.'});
						});
					}

					if (type == 'registerPassword') {
						$.post("/createaccount.json", {token: $('#token').val(), password: $('#password').val()}, (response) => {
							if (response.success) {
								resolve({success: true});
							} else {
								resolve({success: false, errorMessage: 'Error while creating account.'});
							}
						}).fail(() => {
								resolve({success: false, errorMessage: 'Error while creating account.'});
						});
					}

					if (type == 'forgotPassword') {
						$.post("/recoverpwd.json", {token: $('#token').val(), password: $('#password').val()}, (response) => {
							if (response.success) {
								resolve({success: true});
							} else {
								resolve({success: false, errorMessage: 'Error while accessing account.'});
							}
						}).fail(() => {
								resolve({success: false, errorMessage: 'Error while accessing account.'});
						});
					}
				});
			},

			logOut() {
				this.state.authorized = false;
				this.state.userInfo = {username: ''};
				this.state.showDictMenu = false;
				this.state.userAccess = false;
				$.post("/logout.json", {}, (response) => {
				}).always(() => {
					this.checkingAuth = false;
					this.update();
				})
			},

			loadDictDetail() {
				$.get("/" + this.dictId + "/config.json", (response) => {
					console.log(response);
					if (response.success) {
						this.state.dictDetails.title = response.publicInfo.title;
						this.state.dictDetails.blurb = response.publicInfo.blurb;
						this.state.dictDetails.public = response.publicInfo.public;
						this.state.dictDetails.licence = response.publicInfo.licence;
						this.state.dictDetails.xemaOverride = false;
						this.state.dictDetails.xemplateOverride = false;
						this.state.dictDetails.editingOverride = false;
						this.state.userAccess = response.userAccess;
						this.state.dictConfigs = response.configs;
						if (response.userAccess != false && (response.userAccess.canEdit || response.userAccess.canConfig || response.userAccess.canDownload || response.userAccess.canUpload)) {
							this.state.showDictMenu = true;
						}
						this.update();
					} else {
						route("/");
					}					
				});
			},

			loadConfigData(configId) {
				console.log('load config')
				return new Promise((resolve) => {
					$.post("/" + this.dictId + "/configread.json", {id: configId}, (response) => {
						resolve(response.content)
					});
				});
			},

			saveConfigData(configId, data) {
				$.post("/" + this.dictId + "/configupdate.json", {id: configId, content: JSON.stringify(data)}, (response) => {
					console.log(response)
					$('#submit_button').html('Saved...');
					setTimeout(() => {$('#submit_button').html('Save <i class="material-icons right">save</i>');}, 2000);
				});
			},

			onUpdated() {
				console.log('content='+this.content)
			},

			onMounted() {
				this.checkAuthCookie();

				console.log('mount')
				route('/createaccount/*', (token) => {
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'registerPassword';
					this.state.token = token;
					this.content = 'main-page';
					this.update();
				});
				route('/recoverpwd/*', (token) => {
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'forgotPassword';
					this.state.token = token;
					this.content = 'main-page';
					this.update();
				});
				route('/register', () => {
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'register';
					this.content = 'main-page';
					this.update();
				});
				route('/forgot', () => {
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'forgot';
					this.content = 'main-page';
					this.update();
				});
				route('/userprofile', () => {
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'userprofile';
					this.content = 'main-page';
					this.update();
				});
				route('/make', () => {
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'new';
					this.content = 'main-page';
					this.update();
				});
				route('/*/edit', (dictId) => {
					console.log('edit ' + dictId)
					this.dictId = dictId;
					this.doctype = 'entry';
					$.get("/" + this.dictId + "/doctype.json", (response) => {
						console.log(response);
						if (response.success && response.userAccess.canEdit) {
							if (response.doctype != "") {
								this.doctype = response.doctype;
								this.doctypes = response.doctypes;
							}
							route(this.dictId + "/edit/" + this.doctype);
						} else {
							route("/");
						}
					});
				});
				route('/*/edit/*/([view0-9]*)', (dictId, doctype, entryId) => {
					console.log('edit ' + dictId + doctype + entryId)
					this.dictId = dictId;
					this.entryId = entryId;
					this.doctype = doctype;
					$.get("/" + this.dictId + "/doctype.json", (response) => {
						console.log(response);
						if (response.success && response.doctypes) {
							this.doctypes = response.doctypes;
							this.update();
						}
					});
					this.content = 'dict-edit';
					this.update();
				});
				route('/*/edit/*', (dictId, doctype) => {
					console.log('edit ' + dictId + doctype)
					this.dictId = dictId;
					this.doctype = doctype;
					$.get("/" + this.dictId + "/doctype.json", (response) => {
						console.log(response);
						if (response.success && response.doctypes) {
							this.doctypes = response.doctypes;
							this.update();
						}
					});
					this.content = 'dict-edit';
					this.update();
				});
				route('/*/([0-9]*)$', (dictId, entryId) => {
					console.log('public entry ' + dictId + '-' + entryId)
					this.dictId = dictId;
					this.entryId = entryId;
					this.content = 'dict-public-entry';
					this.update();
				});
				route('/*/config/*', (dictId, configId) => {
					console.log('config ' + dictId)
					this.dictId = dictId;
					this.configId = configId;
					this.content = 'dict-config-'+configId;
					this.update();
				});
				route('/*/config', (dictId) => {
					console.log('config ' + dictId)
					this.dictId = dictId;
					this.content = 'dict-config';
					this.update();
				});
				route('/*/download', (dictId) => {
					console.log('download ' + dictId)
					this.dictId = dictId;
					this.doctype = 'entry';
					$.get("/" + this.dictId + "/doctype.json", (response) => {
						console.log(response);
						if (response.success && response.userAccess.canDownload) {
							if (response.doctype != "") {
								this.doctype = response.doctype;
								this.doctypes = response.doctypes;
							}
							this.content = 'dict-download';
							this.update();
						} else {
							route("/");
						}
					});
				});
				route('/*/upload', (dictId) => {
					console.log('upload ' + dictId)
					this.dictId = dictId;
					this.doctype = 'entry';
					$.get("/" + this.dictId + "/doctype.json", (response) => {
						console.log(response);
						if (response.success && response.userAccess.canUpload) {
							if (response.doctype != "") {
								this.doctype = response.doctype;
								this.doctypes = response.doctypes;
							}
							this.content = 'dict-upload';
							this.update();
						} else {
							route("/");
						}
					});
				});
				route('/*', (dictId) => {
					console.log('testd ' + dictId)
					this.dictId = dictId;
					this.content = 'dict-public';
					this.update();
				});
				route('/', () => {
					console.log('main')
					this.dictId = '';
					this.state.showDictMenu = false;
					this.state.userAccess = false;
					this.state.subPage = 'login';
					this.content = 'main-page';
					$.get("/siteconfigread.json", (response) => {
						this.siteconfig = response;
						this.update();
					});
					this.update();
				});
				route.start(true);
			}
		}
	</script>
</main>
