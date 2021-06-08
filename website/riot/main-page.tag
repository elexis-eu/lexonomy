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
			<forgot if={this.props.mainSubPage == 'forgot'} account-ops={ props.accountOps }></forgot>
		</div>
	</div>
</main-page>
