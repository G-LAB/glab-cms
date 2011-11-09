<ul class="mid body wizard">
	<li class="<?=($this->router->fetch_method()=='calls') ? 'selected':''?>">
		<span>Step One</span>
		<span>Select Call</span>
	</li>
	<li class="<?=($this->router->fetch_method()=='authenticate') ? 'selected':''?>">
		<span>Step Two</span>
		<span>Authenticate</span>
	</li>
	<li class="<?=($this->router->fetch_method()=='ticket') ? 'selected':''?>">
		<span>Step Three</span>
		<span>Record Notes</span>
	</li>
</ul>