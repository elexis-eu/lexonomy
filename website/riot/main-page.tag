<main-page>
	<div class="col s5">
		<welcome></welcome>
	</div>
	<div class="col s7">
		<div if={ props.authorized } >
			<dict-list ></dict-list>
		</div>
		<div if={ !props.authorized }>
			<login if={this.props.mainSubPage == 'login'} account-ops={ props.accountOps }></login>
			<register if={this.props.mainSubPage == 'register'} account-ops={ props.accountOps }></register>
			<register-password if={this.props.mainSubPage == 'registerPassword'} account-ops={ props.accountOps } token={ props.token }></register-password>
			<forgot if={this.props.mainSubPage == 'forgot'} account-ops={ props.accountOps }></forgot>
			<forgot-password if={this.props.mainSubPage == 'forgotPassword'} account-ops={ props.accountOps } token={ props.token }></forgot-password>
		</div>
	</div>
</main-page>
