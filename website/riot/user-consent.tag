<user-consent>
	<div>
		<div class="row">
			<div class="col">
				{ props.siteconfig.consent.terms }
			</div>
		</div>
		<div class="row">
			<div class="col">
				<button class="btn waves-effect waves-light" type="submit" onclick={ doConsent }>{ props.siteconfig.consent.confirm }
					<i class="material-icons right">check</i>
				</button>
			</div>
		</div>
		
	</div>

	<script>
		export default {
			siteconfig: {},
			onMounted() {
				if (Object.keys(this.props.siteconfig) == 0) {
					$.get("/siteconfigread.json", (response) => {
						this.siteconfig = response;
						this.update();
					});
				} else {
					this.siteconfig = this.props.siteconfig;
					this.update();
				}
			},

			doConsent() {
				this.props.accountOps('consent');
			}

		}
	</script>
</user-consent>
