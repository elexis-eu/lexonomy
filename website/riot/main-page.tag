<main-page>
	<div class="col s5">
		<welcome></welcome>
	</div>
	<div class="col s7">
		<div if={ props.authorized } >
			<template if={ props.siteconfig.consent && props.siteconfig.consent.terms && !props.userInfo.consent }>
				<user-consent user-info={ props.userInfo } siteconfig={ props.siteconfig } account-ops={ props.accountOps }></user-consent>
			</template>
			<template if={ !props.siteconfig.consent || !props.siteconfig.consent.terms || props.userInfo.consent }>
				<dict-list if={this.props.mainSubPage != 'new' && this.props.mainSubPage != 'userprofile'}></dict-list>
				<dict-new if={this.props.mainSubPage == 'new'}></dict-new>
				<userprofile if={this.props.mainSubPage == 'userprofile'} user-info={ props.userInfo } siteconfig={ props.siteconfig }></userprofile>
			</template>
		</div>
		<div if={ !props.authorized }>
			<login if={this.props.mainSubPage == 'login'} account-ops={ props.accountOps } siteconfig={ props.siteconfig }></login>
			<register if={this.props.mainSubPage == 'register'} account-ops={ props.accountOps }></register>
			<register-password if={this.props.mainSubPage == 'registerPassword'} account-ops={ props.accountOps } token={ props.token }></register-password>
			<forgot if={this.props.mainSubPage == 'forgot'} account-ops={ props.accountOps }></forgot>
			<forgot-password if={this.props.mainSubPage == 'forgotPassword'} account-ops={ props.accountOps } token={ props.token }></forgot-password>
		</div>
	</div>
</main-page>
