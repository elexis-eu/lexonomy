<main-page>
      <div class="col s5">
			  <welcome></welcome>
      </div>
			<div class="col s7">
				<div if={ props.authorized } >
					<dict-list ></dict-list>
	      </div>
			  <div if={ !props.authorized }>
					<login check-auth={ props.checkAuth }></login>
				</div>
			</div>

</main-page>
